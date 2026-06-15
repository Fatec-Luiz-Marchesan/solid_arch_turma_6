const Settings = require('../models/Settings');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { createSettings } = require('../usecases/settings/createSettings');
const { getSettings } = require('../usecases/settings/getSettings');
const { updateSettings } = require('../usecases/settings/updateSettings');
const { deleteSettings } = require('../usecases/settings/deleteSettings');

const SettingsRepository = {
  create: (data) => new Settings(data).save(),
  findByUser: (userId) =>
    Settings.findOne({ 'user._id': userId, deletedAt: null }),
  updateByUser: (userId, data) =>
    Settings.findOneAndUpdate(
      { 'user._id': userId, deletedAt: null },
      data,
      { new: true }
    ),
};

module.exports = class SettingsController {
  static async create(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await createSettings({
      data: req.body,
      user,
      SettingsRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(result.status).json({
      message: 'Configurações criadas!',
      data: result.settings,
    });
  }

  static async get(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await getSettings({ user, SettingsRepository });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ settings: result.settings });
  }

  static async update(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await updateSettings({
      data: req.body,
      user,
      SettingsRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Configurações atualizadas!',
      data: result.settings,
    });
  }

  static async delete(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await deleteSettings({ user, SettingsRepository });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }
};
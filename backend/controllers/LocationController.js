const Location = require('../models/Location');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { createLocation } = require('../usecases/location/createLocation');
const { listLocations } = require('../usecases/location/listLocations');
const { getLocationById } = require('../usecases/location/getLocationById');
const { updateLocation } = require('../usecases/location/updateLocation');
const { setPrimaryLocation } = require('../usecases/location/setPrimaryLocation');
const { deleteLocation } = require('../usecases/location/deleteLocation');

const LocationRepository = {
  create: (data) => new Location(data).save(),
  findByUser: (userId) =>
    Location.find({ 'user._id': userId }).sort('-createdAt'),
  findById: (id) => Location.findById(id),
  update: (id, data) => Location.findByIdAndUpdate(id, data, { new: true }),
  unsetPrimaryForUser: (userId) =>
    Location.updateMany({ 'user._id': userId, isPrimary: true }, { isPrimary: false }),
  delete: (id) => Location.findByIdAndDelete(id),
};

module.exports = class LocationController {
  static async create(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await createLocation({
      data: req.body,
      user,
      LocationRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(result.status).json({
      message: 'Localização criada!',
      data: result.location,
    });
  }

  static async list(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await listLocations({ user, LocationRepository });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ locations: result.locations });
  }

  static async getById(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await getLocationById({
      id: req.params.id,
      user,
      LocationRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ location: result.location });
  }

  static async update(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await updateLocation({
      id: req.params.id,
      data: req.body,
      user,
      LocationRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Localização atualizada!',
      data: result.location,
    });
  }

  static async setPrimary(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await setPrimaryLocation({
      id: req.params.id,
      user,
      LocationRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Localização definida como principal!',
      data: result.location,
    });
  }

  static async delete(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await deleteLocation({
      id: req.params.id,
      user,
      LocationRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }
};
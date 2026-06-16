const User = require('../models/User');
const Pet = require('../models/Pet');
const Message = require('../models/Message');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { bootstrapAdmin } = require('../usecases/admin/bootstrapAdmin');
const { listAllUsers } = require('../usecases/admin/listAllUsers');
const { getUserDetails } = require('../usecases/admin/getUserDetails');
const { promoteUser } = require('../usecases/admin/promoteUser');
const { demoteUser } = require('../usecases/admin/demoteUser');
const { deleteUser } = require('../usecases/admin/deleteUser');
const { getSystemStats } = require('../usecases/admin/getSystemStats');

const AdminRepository = {
  findAll: () => User.find().select('-password').sort('-createdAt'),
  findById: (id) => User.findById(id).select('-password'),
  countAdmins: () => User.countDocuments({ role: 'admin' }),
  countUsers: () => User.countDocuments(),
  countPets: () => Pet.countDocuments(),
  countMessages: () => Message.countDocuments(),
  promote: (id) =>
    User.findByIdAndUpdate(id, { role: 'admin' }, { new: true }).select('-password'),
  demote: (id) =>
    User.findByIdAndUpdate(id, { role: 'user' }, { new: true }).select('-password'),
  delete: (id) => User.findByIdAndDelete(id),
};

module.exports = class AdminController {
  static async bootstrap(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await bootstrapAdmin({ user, AdminRepository });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Você agora é administrador!',
      data: result.user,
    });
  }

  static async listUsers(req, res) {
    const result = await listAllUsers({ AdminRepository });
    return res.status(200).json({ users: result.users });
  }

  static async getUser(req, res) {
    const result = await getUserDetails({
      targetId: req.params.id,
      AdminRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ user: result.user });
  }

  static async promote(req, res) {
    const result = await promoteUser({
      targetId: req.params.id,
      AdminRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Usuário promovido a administrador!',
      data: result.user,
    });
  }

  static async demote(req, res) {
    const result = await demoteUser({
      targetId: req.params.id,
      actor: req.user,
      AdminRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Administrador rebaixado a usuário comum!',
      data: result.user,
    });
  }

  static async deleteUser(req, res) {
    const result = await deleteUser({
      targetId: req.params.id,
      actor: req.user,
      AdminRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }

  static async stats(req, res) {
    const result = await getSystemStats({ AdminRepository });
    return res.status(200).json({ stats: result.stats });
  }
};
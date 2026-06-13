const bcrypt = require('bcrypt');
const User = require('../models/User');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { changePassword } = require('../usecases/user/changePassword');
const { deleteAccount } = require('../usecases/user/deleteAccount');
const { searchUsers } = require('../usecases/user/searchUsers');


const UserRepository = {
  findById: (id) => User.findById(id),
  updatePassword: (id, hash) =>
    User.findByIdAndUpdate(id, { password: hash }, { new: true }),
  delete: (id) => User.findByIdAndDelete(id),
  searchByNameOrEmail: (q, excludeId) => {
  
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safe, 'i');
    return User.find({
      _id: { $ne: excludeId },
      $or: [{ name: regex }, { email: regex }],
    })
      .select('_id name email image')
      .limit(20);
  },
};

const PasswordHasher = {
  compare: (plain, hash) => bcrypt.compare(plain, hash),
  hash: async (plain) => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(plain, salt);
  },
};

module.exports = class UserAccountController {
  static async changePassword(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await changePassword({
      data: req.body,
      user,
      UserRepository,
      PasswordHasher,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }

  static async deleteAccount(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await deleteAccount({
      data: req.body,
      user,
      UserRepository,
      PasswordHasher,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }

  static async search(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await searchUsers({
      query: req.query.q,
      user,
      UserRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ users: result.users });
  }
};
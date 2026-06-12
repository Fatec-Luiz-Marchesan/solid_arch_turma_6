const { IAdminRepository } = require('../../domain/repositories/IAdminRepository')
const AdminModel = require('../models/AdminModel')


class AdminMongoRepository extends IAdminRepository {
  async findByEmail(email) {
    return AdminModel.findOne({ email })
  }

  async create(adminData) {
    const doc = await AdminModel.create(adminData)
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
    }
  }

  async findAll() {
    const docs = await AdminModel.find().select('-password').sort('-createdAt')
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
    }))
  }
}

module.exports = { AdminMongoRepository }
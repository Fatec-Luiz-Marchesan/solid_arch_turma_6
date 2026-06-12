const { IUserRepository } = require('../../domain/repositories/IUserRepository')
const User = require('../../../models/User')

class UserMongoRepository extends IUserRepository {
  async findByEmail(email) {
    const doc = await User.findOne({ email })
    if (!doc) return null

    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      password: doc.password,
    }
  }

  async create(userData) {
    const doc = await User.create(userData)
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
    }
  }
}

module.exports = { UserMongoRepository }
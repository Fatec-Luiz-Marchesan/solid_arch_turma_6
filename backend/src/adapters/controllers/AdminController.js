const { CreateAdmin } = require('../../use-cases/CreateAdmin')
const { AdminMongoRepository } = require('../../external/repositories/AdminMongoRepository')
const { BcryptHasher } = require('../../external/adapters/BcryptHasher')

module.exports = class AdminController {
  static async create(req, res) {
    const { name, email, password } = req.body

    
    const adminRepository = new AdminMongoRepository()
    const hasher = new BcryptHasher()
    const createAdmin = new CreateAdmin(adminRepository, hasher)

    try {
      const admin = await createAdmin.execute({ name, email, password })
      return res.status(201).json({
        message: 'Admin cadastrado com sucesso!',
        admin,
      })
    } catch (error) {
      if (error.message === 'Já existe um admin com este email!') {
        return res.status(409).json({ message: error.message })
      }
      return res.status(422).json({ message: error.message })
    }
  }
}
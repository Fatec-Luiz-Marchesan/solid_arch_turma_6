// backend/src/adapters/controllers/AdminController.js
const { CreateAdmin } = require('../../use-cases/CreateAdmin')
const { AdminMongoRepository } = require('../../external/repositories/AdminMongoRepository')
const { BcryptHasher } = require('../../external/adapters/BcryptHasher')
const { AdminValidator } = require('../validators/AdminValidator')

// Mapa de mensagens de domínio → status HTTP (Open/Closed para novos erros)
const ERROR_STATUS_MAP = {
  'Já existe um admin com este email!': 409,
  'O email é obrigatório!': 422,
  'A senha deve ter no mínimo 6 caracteres!': 422,
}

module.exports = class AdminController {
  // POST /admins/create
  static async create(req, res) {
    // 1) Validação de schema na borda HTTP
    const schemaError = AdminValidator.validateCreate(req.body)
    if (schemaError) {
      return res.status(422).json({ message: schemaError })
    }

    const { name, email, password } = req.body

    // 2) Composição das dependências (Composition Root)
    const adminRepository = new AdminMongoRepository()
    const hasher = new BcryptHasher()
    const createAdmin = new CreateAdmin(adminRepository, hasher)

    // 3) Repassa para o Use Case e traduz erros
    try {
      const admin = await createAdmin.execute({ name, email, password })
      return res.status(201).json({
        message: 'Admin cadastrado com sucesso!',
        admin,
      })
    } catch (error) {
      const status = ERROR_STATUS_MAP[error.message] || 500
      const message =
        status === 500 ? 'Erro interno ao criar admin.' : error.message
      return res.status(status).json({ message })
    }
  }

  // GET /admins
  static async getAll(req, res) {
    const adminRepository = new AdminMongoRepository()

    try {
      const admins = await adminRepository.findAll()
      return res.status(200).json({ admins })
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno ao listar admins.' })
    }
  }
}
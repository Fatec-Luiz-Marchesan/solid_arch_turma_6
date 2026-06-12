const { RegisterUser } = require('../../use-cases/RegisterUser')
const { UserMongoRepository } = require('../../external/repositories/UserMongoRepository')
const { BcryptHasher } = require('../../external/adapters/BcryptHasher')
const { JwtTokenGenerator } = require('../../external/adapters/JwtTokenGenerator')

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword } = req.body

    // Composição das dependências (Composition Root)
    const userRepository = new UserMongoRepository()
    const hasher = new BcryptHasher()
    const tokenGenerator = new JwtTokenGenerator()
    const registerUser = new RegisterUser(userRepository, hasher, tokenGenerator)

    try {
      const result = await registerUser.execute({
        name,
        email,
        phone,
        password,
        confirmpassword,
      })
      return res.status(201).json(result)
    } catch (error) {
      return res.status(422).json({ message: error.message })
    }
  }
}
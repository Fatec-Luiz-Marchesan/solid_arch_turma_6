const { AuthenticateUser } = require('../../use-cases/AuthenticateUser')
const { UserMongoRepository } = require('../../external/repositories/UserMongoRepository')
const { BcryptHasher } = require('../../external/adapters/BcryptHasher')
const { JwtTokenGenerator } = require('../../external/adapters/JwtTokenGenerator')

module.exports = class AuthController {
  static async login(req, res) {
    const { email, password } = req.body

    const userRepository = new UserMongoRepository()
    const hashComparer = new BcryptHasher()      
    const tokenGenerator = new JwtTokenGenerator()
    const authenticateUser = new AuthenticateUser(
      userRepository,
      hashComparer,
      tokenGenerator,
    )

    try {
      const result = await authenticateUser.execute({ email, password })
      res.status(200).json(result)
    } catch (error) {
      res.status(422).json({ message: error.message })
    }
  }
}
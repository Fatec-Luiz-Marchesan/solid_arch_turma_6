const { User } = require('../domain/entities/User')

class RegisterUser {
  
  constructor(userRepository, hasher, tokenGenerator) {
    this.userRepository = userRepository
    this.hasher = hasher
    this.tokenGenerator = tokenGenerator
  }

  async execute({ name, email, phone, password, confirmpassword }) {
    
    const user = new User({ name, email, phone, password, confirmpassword })

    
    const alreadyExists = await this.userRepository.findByEmail(user.email)
    if (alreadyExists) {
      throw new Error('Por favor, utilize outro e-mail!')
    }

    
    const hashedPassword = await this.hasher.hash(user.password)

    
    const created = await this.userRepository.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: hashedPassword,
    })

    
    const token = this.tokenGenerator.generate({ id: created.id, name: created.name })

    return {
      message: 'Você está autenticado!',
      token,
      userId: created.id,
    }
  }
}

module.exports = { RegisterUser }
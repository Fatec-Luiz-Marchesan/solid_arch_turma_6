const { Admin } = require('../domain/entities/Admin')

class CreateAdmin {
  
  constructor(adminRepository, hasher) {
    this.adminRepository = adminRepository
    this.hasher = hasher
  }

  async execute({ name, email, password }) {
    
    const admin = new Admin({ name, email, password })

    
    const alreadyExists = await this.adminRepository.findByEmail(admin.email)
    if (alreadyExists) {
      throw new Error('Já existe um admin com este email!')
    }

    
    const hashedPassword = await this.hasher.hash(admin.password)

    
    const created = await this.adminRepository.create({
      name: admin.name,
      email: admin.email,
      password: hashedPassword,
      role: admin.role,
    })

    
    return {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
    }
  }
}

module.exports = { CreateAdmin }
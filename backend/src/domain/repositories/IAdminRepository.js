class IAdminRepository {
  
  async findByEmail(email) {
    throw new Error('Método findByEmail não implementado')
  }

  
  async create(adminData) {
    throw new Error('Método create não implementado')
  }

  async findAll() {
    throw new Error('Método findAll não implementado')
  }
}

module.exports = { IAdminRepository }
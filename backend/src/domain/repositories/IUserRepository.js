
class IUserRepository {
  // eslint-disable-next-line no-unused-vars
  async findByEmail(email) {
    throw new Error('Método findByEmail não implementado')
  }

  // eslint-disable-next-line no-unused-vars
  async create(userData) {
    throw new Error('Método create não implementado')
  }
}

module.exports = { IUserRepository }
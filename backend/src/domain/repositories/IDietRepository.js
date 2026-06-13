
class IDietRepository {
  
  async create(dietData) {
    throw new Error('Método create não implementado')
  }

  async findAll() {
    throw new Error('Método findAll não implementado')
  }
}

module.exports = { IDietRepository }
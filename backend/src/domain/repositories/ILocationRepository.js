class ILocationRepository {
  
  async create(locationData) {
    throw new Error('Método create não implementado')
  }

  async findAll() {
    throw new Error('Método findAll não implementado')
  }
}

module.exports = { ILocationRepository }
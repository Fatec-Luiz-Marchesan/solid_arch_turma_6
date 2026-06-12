class IReportRepository {

  async create(reportData) {
    throw new Error('Método create não implementado')
  }

  async findAll() {
    throw new Error('Método findAll não implementado')
  }
}

module.exports = { IReportRepository }
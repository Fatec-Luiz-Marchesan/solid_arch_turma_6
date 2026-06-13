const { CreateReport } = require('../../use-cases/CreateReport')
const { ReportMongoRepository } = require('../../external/repositories/ReportMongoRepository')

module.exports = class ReportController {
 
  static async create(req, res) {
    const { title, description, type, reporterId } = req.body

    const reportRepository = new ReportMongoRepository()
    const createReport = new CreateReport(reportRepository)

    try {
      const report = await createReport.execute({ title, description, type, reporterId })
      return res.status(201).json({
        message: 'Report criado com sucesso!',
        report,
      })
    } catch (error) {
      return res.status(422).json({ message: error.message })
    }
  }

  static async getAll(req, res) {
    const reportRepository = new ReportMongoRepository()
    try {
      const reports = await reportRepository.findAll()
      return res.status(200).json({ reports })
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno ao listar reports.' })
    }
  }
}
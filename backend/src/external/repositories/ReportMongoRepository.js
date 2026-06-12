const { IReportRepository } = require('../../domain/repositories/IReportRepository')
const ReportModel = require('../models/ReportModel')

class ReportMongoRepository extends IReportRepository {
  async create(reportData) {
    const doc = await ReportModel.create(reportData)
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      type: doc.type,
      status: doc.status,
      reporterId: doc.reporterId,
    }
  }

  async findAll() {
    const docs = await ReportModel.find().sort('-createdAt')
    return docs.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      type: doc.type,
      status: doc.status,
      reporterId: doc.reporterId,
    }))
  }
}

module.exports = { ReportMongoRepository }
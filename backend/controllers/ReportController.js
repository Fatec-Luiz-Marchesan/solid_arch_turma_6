const Report = require('../models/Report');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { createReport } = require('../usecases/report/createReport');
const { listReports } = require('../usecases/report/listReports');
const { getReportById } = require('../usecases/report/getReportById');
const { updateReportStatus } = require('../usecases/report/updateReportStatus');
const { deleteReport } = require('../usecases/report/deleteReport');

// Repositório padrão: único lugar que toca o Mongoose diretamente.
const defaultRepository = {
  create: (data) => new Report(data).save(),
  findActive: (query = {}) =>
    Report.find({ ...query, deletedAt: null }).sort('-createdAt'),
  findById: (id) => Report.findById(id),
  // Checagem de duplicidade: mesmo denunciante + mesmo alvo ativo
  findDuplicate: ({ reporterId, targetType, targetId }) =>
    Report.findOne({
      'reporter._id': reporterId,
      targetType,
      targetId,
      deletedAt: null,
    }),
  update: (id, data) => Report.findByIdAndUpdate(id, data, { new: true }),
};

let ReportRepository = defaultRepository;

function setRepository(repo) {
  ReportRepository = repo || defaultRepository;
}

function resetRepository() {
  ReportRepository = defaultRepository;
}

class ReportController {
  static async create(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await createReport({
      data: req.body,
      user,
      ReportRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(result.status).json({
      message: 'Denúncia criada!',
      data: result.report,
    });
  }

  static async list(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await listReports({
      user,
      ReportRepository,
      filters: { status: req.query.status, targetType: req.query.targetType },
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ reports: result.reports });
  }

  static async getById(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await getReportById({
      id: req.params.id,
      user,
      ReportRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ report: result.report });
  }

  static async updateStatus(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await updateReportStatus({
      id: req.params.id,
      data: req.body,
      user,
      ReportRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Status da denúncia atualizado!',
      data: result.report,
    });
  }

  static async delete(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await deleteReport({
      id: req.params.id,
      user,
      ReportRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }
}

module.exports = ReportController;
module.exports.setRepository = setRepository;
module.exports.resetRepository = resetRepository;
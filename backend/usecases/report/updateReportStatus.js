const { validateStatus } = require('../../helpers/validate-report');

async function updateReportStatus({ id, data, user, ReportRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const d = data || {};

  const validation = validateStatus(d.status);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const report = await ReportRepository.findById(id);
  if (!report || report.deletedAt) {
    return { success: false, status: 404, errors: ['Denúncia não encontrada!'] };
  }

  const updated = await ReportRepository.update(id, { status: d.status });
  return { success: true, status: 200, report: updated };
}

module.exports = { updateReportStatus };
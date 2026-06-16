const { validateStatus, validateModeratorNote, normalizeText } = require('../../helpers/validate-report');

async function updateReportStatus({ id, data, user, ReportRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const d = data || {};

  const statusValidation = validateStatus(d.status);
  if (!statusValidation.isValid) {
    return { success: false, status: 422, errors: statusValidation.errors };
  }

  if (d.moderatorNote !== undefined) {
    const noteValidation = validateModeratorNote(d.moderatorNote);
    if (!noteValidation.isValid) {
      return { success: false, status: 422, errors: noteValidation.errors };
    }
  }

  const report = await ReportRepository.findById(id);
  if (!report || report.deletedAt) {
    return { success: false, status: 404, errors: ['Denúncia não encontrada!'] };
  }

  const updateData = { status: d.status };
  if (d.moderatorNote !== undefined) {
    updateData.moderatorNote = normalizeText(d.moderatorNote);
  }

  const updated = await ReportRepository.update(id, updateData);
  return { success: true, status: 200, report: updated };
}

module.exports = { updateReportStatus };
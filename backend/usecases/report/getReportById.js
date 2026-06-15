async function getReportById({ id, user, ReportRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const report = await ReportRepository.findById(id);
  if (!report || report.deletedAt) {
    return { success: false, status: 404, errors: ['Denúncia não encontrada!'] };
  }

  return { success: true, status: 200, report };
}

module.exports = { getReportById };
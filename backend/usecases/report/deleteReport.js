async function deleteReport({ id, user, ReportRepository }) {
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

  await ReportRepository.update(id, { deletedAt: new Date() });
  return { success: true, status: 200, message: 'Denúncia removida!' };
}

module.exports = { deleteReport };
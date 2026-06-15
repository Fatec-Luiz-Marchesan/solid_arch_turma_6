const { validateReport, normalizeText } = require('../../helpers/validate-report');

async function createReport({ data, user, ReportRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const validation = validateReport(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const d = data || {};
  const targetId = normalizeText(d.targetId);

  // Um mesmo usuário não pode denunciar o mesmo alvo mais de uma vez
  // enquanto a denúncia anterior ainda estiver ativa.
  const existing = await ReportRepository.findDuplicate({
    reporterId: user._id,
    targetType: d.targetType,
    targetId,
  });
  if (existing) {
    return {
      success: false,
      status: 409,
      errors: ['Você já denunciou este item!'],
    };
  }

  const report = await ReportRepository.create({
    reporter: { _id: user._id, name: user.name },
    targetType: d.targetType,
    targetId,
    reason: d.reason,
    description:
      d.description !== undefined ? normalizeText(d.description) : '',
    status: 'pending',
    deletedAt: null,
  });

  return { success: true, status: 201, report };
}

module.exports = { createReport };
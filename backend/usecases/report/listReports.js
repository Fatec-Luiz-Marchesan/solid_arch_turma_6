const {
  ALLOWED_STATUSES,
  ALLOWED_TARGET_TYPES,
} = require('../../helpers/validate-report');

async function listReports({ user, ReportRepository, filters = {} }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const f = filters || {};

  if (f.status !== undefined && !ALLOWED_STATUSES.includes(f.status)) {
    return { success: false, status: 422, errors: ['Status inválido!'] };
  }

  if (
    f.targetType !== undefined &&
    !ALLOWED_TARGET_TYPES.includes(f.targetType)
  ) {
    return { success: false, status: 422, errors: ['Tipo de alvo inválido!'] };
  }

  const query = {};
  if (f.status) query.status = f.status;
  if (f.targetType) query.targetType = f.targetType;

  const reports = await ReportRepository.findActive(query);

  return { success: true, status: 200, reports };
}

module.exports = { listReports };
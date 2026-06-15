const { validateListFilters } = require('../../helpers/validate-upload');

async function listUploads({ user, filters, UploadRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const validation = validateListFilters(filters || {});
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const uploads = await UploadRepository.findActiveByUser(user._id, validation.filters);
  return { success: true, status: 200, uploads };
}

module.exports = { listUploads };
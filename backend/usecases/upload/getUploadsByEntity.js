async function getUploadsByEntity({ entityType, entityId, user, UploadRepository }) {
  if (!entityType || !entityId) {
    return { success: false, status: 422, errors: ['entityType e entityId são obrigatórios!'] };
  }

  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const uploads = await UploadRepository.findByEntity(entityType, entityId);
  return { success: true, status: 200, uploads };
}

module.exports = { getUploadsByEntity };
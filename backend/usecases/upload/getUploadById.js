async function getUploadById({ id, user, UploadRepository }) {
  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const upload = await UploadRepository.findById(id);
  if (!upload || upload.deletedAt) {
    return { success: false, status: 404, errors: ['Upload não encontrado!'] };
  }

  if (String(upload.uploader._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  return { success: true, status: 200, upload };
}

module.exports = { getUploadById };
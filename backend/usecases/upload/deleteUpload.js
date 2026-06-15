async function deleteUpload({ id, user, UploadRepository, StorageAdapter }) {
  const upload = await UploadRepository.findById(id);
  if (!upload || upload.deletedAt) {
    return { success: false, status: 404, errors: ['Upload não encontrado!'] };
  }

  if (String(upload.uploader._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  await UploadRepository.update(id, { deletedAt: new Date() });

  if (StorageAdapter) {
    try {
      await StorageAdapter.remove(upload.path);
    } catch (err) {
    }
  }

  return { success: true, status: 200, message: 'Upload removido!' };
}

module.exports = { deleteUpload };
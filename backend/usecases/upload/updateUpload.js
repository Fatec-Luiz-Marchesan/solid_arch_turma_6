const { validateUploadUpdate } = require('../../helpers/validate-upload');

async function updateUpload({ id, data, user, UploadRepository }) {
  const upload = await UploadRepository.findById(id);
  if (!upload || upload.deletedAt) {
    return { success: false, status: 404, errors: ['Upload não encontrado!'] };
  }

  if (String(upload.uploader._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  const validation = validateUploadUpdate(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const updatePayload = {};
  if (data.description !== undefined) {
    updatePayload.description = data.description.trim();
  }
  if (data.entity !== undefined) {
    updatePayload.entity = data.entity;
  }

  const updated = await UploadRepository.update(id, updatePayload);
  return { success: true, status: 200, upload: updated };
}

module.exports = { updateUpload };
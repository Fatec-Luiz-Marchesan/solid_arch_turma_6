const { validateFile, categorizeFile } = require('../../helpers/validate-upload');

async function createUpload({ file, user, description, entity, UploadRepository }) {
  const validation = validateFile(file);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const category = categorizeFile(file.mimetype);

  const upload = await UploadRepository.create({
    originalName: file.originalname,
    storedName: file.filename,
    mimetype: file.mimetype,
    category,
    size: file.size,
    path: file.path,
    uploader: { _id: user._id, name: user.name },
    entity: entity || null,
    description: description ? description.trim() : '',
    deletedAt: null,
  });

  return { success: true, status: 201, upload };
}

module.exports = { createUpload };
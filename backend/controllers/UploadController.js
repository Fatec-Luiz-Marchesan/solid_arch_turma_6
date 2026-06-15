const Upload = require('../models/Upload');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { createUpload } = require('../usecases/upload/createUpload');
const { listUploads } = require('../usecases/upload/listUploads');
const { getUploadById } = require('../usecases/upload/getUploadById');
const { updateUpload } = require('../usecases/upload/updateUpload');
const { deleteUpload } = require('../usecases/upload/deleteUpload');
const { getUploadsByEntity } = require('../usecases/upload/getUploadsByEntity');

const UploadRepository = {
  create: (data) => new Upload(data).save(),
  findActiveByUser: (userId, filters) => {
    const q = { 'uploader._id': userId, deletedAt: null };
    if (filters.category) q.category = filters.category;
    if (filters.entityType) q['entity.type'] = filters.entityType;
    if (filters.entityId) q['entity._id'] = filters.entityId;
    return Upload.find(q).sort('-createdAt').limit(filters.limit || 50);
  },
  findById: (id) => Upload.findById(id),
  findByEntity: (entityType, entityId) =>
    Upload.find({
      'entity.type': entityType,
      'entity._id': entityId,
      deletedAt: null,
    }).sort('-createdAt'),
  update: (id, data) => Upload.findByIdAndUpdate(id, data, { new: true }),
};

const StorageAdapter = {
  remove: async (filePath) => {
    const fs = require('fs').promises;
    try {
      await fs.unlink(filePath);
    } catch (err) {

    }
  },
};

module.exports = class UploadController {
  static async create(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const file = req.file;
    let entity = null;
    if (req.body.entityType && req.body.entityId) {
      entity = { type: req.body.entityType, _id: req.body.entityId };
    }

    const result = await createUpload({
      file,
      user,
      description: req.body.description,
      entity,
      UploadRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(result.status).json({
      message: 'Arquivo enviado!',
      data: result.upload,
    });
  }

  static async list(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await listUploads({
      user,
      filters: req.query,
      UploadRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ uploads: result.uploads });
  }

  static async getById(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await getUploadById({
      id: req.params.id,
      user,
      UploadRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ upload: result.upload });
  }

  static async update(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await updateUpload({
      id: req.params.id,
      data: req.body,
      user,
      UploadRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Upload atualizado!',
      data: result.upload,
    });
  }

  static async delete(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await deleteUpload({
      id: req.params.id,
      user,
      UploadRepository,
      StorageAdapter,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }

  static async getByEntity(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await getUploadsByEntity({
      entityType: req.params.entityType,
      entityId: req.params.entityId,
      user,
      UploadRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ uploads: result.uploads });
  }
};
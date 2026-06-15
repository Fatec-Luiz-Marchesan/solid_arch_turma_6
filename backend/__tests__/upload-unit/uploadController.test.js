const { describe, it, expect, beforeEach } = require('@jest/globals');

jest.mock('../../helpers/get-token', () => () => 'fake-token');
jest.mock('../../helpers/get-user-by-token', () => jest.fn());

jest.mock('../../usecases/upload/createUpload', () => ({
  createUpload: jest.fn(),
}));
jest.mock('../../usecases/upload/listUploads', () => ({
  listUploads: jest.fn(),
}));
jest.mock('../../usecases/upload/getUploadById', () => ({
  getUploadById: jest.fn(),
}));
jest.mock('../../usecases/upload/updateUpload', () => ({
  updateUpload: jest.fn(),
}));
jest.mock('../../usecases/upload/deleteUpload', () => ({
  deleteUpload: jest.fn(),
}));
jest.mock('../../usecases/upload/getUploadsByEntity', () => ({
  getUploadsByEntity: jest.fn(),
}));

const getUserByToken = require('../../helpers/get-user-by-token');
const { createUpload } = require('../../usecases/upload/createUpload');
const { listUploads } = require('../../usecases/upload/listUploads');
const { getUploadById } = require('../../usecases/upload/getUploadById');
const { updateUpload } = require('../../usecases/upload/updateUpload');
const { deleteUpload } = require('../../usecases/upload/deleteUpload');
const { getUploadsByEntity } = require('../../usecases/upload/getUploadsByEntity');
const UploadController = require('../../controllers/UploadController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('UploadController — testes de unidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserByToken.mockResolvedValue({ _id: 'u1', name: 'João' });
  });

  describe('create', () => {
    it('retorna 201 com sucesso', async () => {
      createUpload.mockResolvedValueOnce({
        success: true,
        status: 201,
        upload: { _id: 'up1' },
      });
      const req = {
        file: { originalname: 'f.jpg', mimetype: 'image/jpeg', size: 100, filename: 'x.jpg', path: '/tmp/x.jpg' },
        body: {},
      };
      const res = makeRes();
      await UploadController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('retorna erro quando use case falha', async () => {
      createUpload.mockResolvedValueOnce({
        success: false,
        status: 422,
        errors: ['Arquivo inválido!'],
      });
      const req = { file: null, body: {} };
      const res = makeRes();
      await UploadController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('monta entity a partir do body', async () => {
      createUpload.mockResolvedValueOnce({ success: true, status: 201, upload: {} });
      const req = {
        file: { originalname: 'f.jpg' },
        body: { entityType: 'Pet', entityId: 'p1', description: 'foto' },
      };
      await UploadController.create(req, makeRes());
      const args = createUpload.mock.calls[0][0];
      expect(args.entity).toEqual({ type: 'Pet', _id: 'p1' });
      expect(args.description).toBe('foto');
    });

    it('entity é null quando não informado no body', async () => {
      createUpload.mockResolvedValueOnce({ success: true, status: 201, upload: {} });
      const req = { file: { originalname: 'f.jpg' }, body: {} };
      await UploadController.create(req, makeRes());
      const args = createUpload.mock.calls[0][0];
      expect(args.entity).toBeNull();
    });
  });

  describe('list', () => {
    it('retorna 200 com uploads', async () => {
      listUploads.mockResolvedValueOnce({
        success: true,
        status: 200,
        uploads: [{ _id: 'up1' }],
      });
      const req = { query: {} };
      const res = makeRes();
      await UploadController.list(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ uploads: [{ _id: 'up1' }] });
    });

    it('retorna erro quando use case falha', async () => {
      listUploads.mockResolvedValueOnce({
        success: false,
        status: 401,
        errors: ['Não autenticado!'],
      });
      const res = makeRes();
      await UploadController.list({ query: {} }, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getById', () => {
    it('retorna 200 com o upload', async () => {
      getUploadById.mockResolvedValueOnce({
        success: true,
        status: 200,
        upload: { _id: 'up1' },
      });
      const req = { params: { id: 'up1' } };
      const res = makeRes();
      await UploadController.getById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 404 quando não encontrado', async () => {
      getUploadById.mockResolvedValueOnce({
        success: false,
        status: 404,
        errors: ['Upload não encontrado!'],
      });
      const req = { params: { id: 'xx' } };
      const res = makeRes();
      await UploadController.getById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('update', () => {
    it('retorna 200 quando atualizado', async () => {
      updateUpload.mockResolvedValueOnce({
        success: true,
        status: 200,
        upload: { _id: 'up1', description: 'novo' },
      });
      const req = { params: { id: 'up1' }, body: { description: 'novo' } };
      const res = makeRes();
      await UploadController.update(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 422 com dados inválidos', async () => {
      updateUpload.mockResolvedValueOnce({
        success: false,
        status: 422,
        errors: ['Dados inválidos!'],
      });
      const req = { params: { id: 'up1' }, body: { entity: null } };
      const res = makeRes();
      await UploadController.update(req, res);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('delete', () => {
    it('retorna 200 quando deletado', async () => {
      deleteUpload.mockResolvedValueOnce({
        success: true,
        status: 200,
        message: 'Upload removido!',
      });
      const req = { params: { id: 'up1' } };
      const res = makeRes();
      await UploadController.delete(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Upload removido!' });
    });

    it('retorna 403 quando não autorizado', async () => {
      deleteUpload.mockResolvedValueOnce({
        success: false,
        status: 403,
        errors: ['Acesso negado!'],
      });
      const req = { params: { id: 'up1' } };
      const res = makeRes();
      await UploadController.delete(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('getByEntity', () => {
    it('retorna 200 com uploads da entidade', async () => {
      getUploadsByEntity.mockResolvedValueOnce({
        success: true,
        status: 200,
        uploads: [{ _id: 'up1' }],
      });
      const req = { params: { entityType: 'Pet', entityId: 'p1' } };
      const res = makeRes();
      await UploadController.getByEntity(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 422 quando falta parâmetros', async () => {
      getUploadsByEntity.mockResolvedValueOnce({
        success: false,
        status: 422,
        errors: ['entityType e entityId são obrigatórios!'],
      });
      const req = { params: {} };
      const res = makeRes();
      await UploadController.getByEntity(req, res);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });
});
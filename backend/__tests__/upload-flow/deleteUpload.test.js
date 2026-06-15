const { describe, it, expect } = require('@jest/globals');
const { deleteUpload } = require('../../usecases/upload/deleteUpload');

describe('deleteUpload (soft delete)', () => {
  const base = { _id: 'up1', uploader: { _id: 'u1' }, path: '/tmp/file.jpg', deletedAt: null };

  it('faz soft delete e tenta remover arquivo', async () => {
    const repo = {
      findById: jest.fn(async () => base),
      update: jest.fn(async () => true),
    };
    const storage = { remove: jest.fn(async () => true) };
    const r = await deleteUpload({
      id: 'up1',
      user: { _id: 'u1' },
      UploadRepository: repo,
      StorageAdapter: storage,
    });
    expect(r.success).toBe(true);
    expect(repo.update.mock.calls[0][1].deletedAt).toBeInstanceOf(Date);
    expect(storage.remove).toHaveBeenCalledWith('/tmp/file.jpg');
  });

  it('não falha quando StorageAdapter quebra', async () => {
    const repo = {
      findById: jest.fn(async () => base),
      update: jest.fn(async () => true),
    };
    const storage = { remove: jest.fn(async () => { throw new Error('disco'); }) };
    const r = await deleteUpload({
      id: 'up1',
      user: { _id: 'u1' },
      UploadRepository: repo,
      StorageAdapter: storage,
    });
    expect(r.success).toBe(true);
  });

  it('funciona sem StorageAdapter', async () => {
    const repo = {
      findById: jest.fn(async () => base),
      update: jest.fn(async () => true),
    };
    const r = await deleteUpload({
      id: 'up1',
      user: { _id: 'u1' },
      UploadRepository: repo,
      StorageAdapter: null,
    });
    expect(r.success).toBe(true);
  });

  it('rejeita terceiros', async () => {
    const repo = { findById: jest.fn(async () => base) };
    const r = await deleteUpload({
      id: 'up1',
      user: { _id: 'u2' },
      UploadRepository: repo,
      StorageAdapter: null,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando já deletado', async () => {
    const del = { ...base, deletedAt: new Date() };
    const repo = { findById: jest.fn(async () => del) };
    const r = await deleteUpload({
      id: 'up1',
      user: { _id: 'u1' },
      UploadRepository: repo,
      StorageAdapter: null,
    });
    expect(r.status).toBe(404);
  });
});
const { describe, it, expect } = require('@jest/globals');
const { listUploads } = require('../../usecases/upload/listUploads');

describe('listUploads', () => {
  it('retorna lista do usuário', async () => {
    const repo = { findActiveByUser: jest.fn(async () => [{ _id: 'up1' }]) };
    const r = await listUploads({
      user: { _id: 'u1' },
      filters: {},
      UploadRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.uploads).toHaveLength(1);
  });

  it('rejeita sem autenticação', async () => {
    const r = await listUploads({ user: null, filters: {}, UploadRepository: {} });
    expect(r.status).toBe(401);
  });

  it('rejeita filtro inválido', async () => {
    const r = await listUploads({
      user: { _id: 'u1' },
      filters: { category: 'video' },
      UploadRepository: {},
    });
    expect(r.status).toBe(422);
  });
});
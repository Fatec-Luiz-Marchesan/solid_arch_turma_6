const { describe, it, expect } = require('@jest/globals');
const { getUploadsByEntity } = require('../../usecases/upload/getUploadsByEntity');

describe('getUploadsByEntity', () => {
  it('retorna uploads da entidade', async () => {
    const repo = { findByEntity: jest.fn(async () => [{ _id: 'up1' }]) };
    const r = await getUploadsByEntity({
      entityType: 'Pet',
      entityId: 'p1',
      user: { _id: 'u1' },
      UploadRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.uploads).toHaveLength(1);
  });

  it('rejeita sem entityType', async () => {
    const r = await getUploadsByEntity({
      entityType: null,
      entityId: 'p1',
      user: { _id: 'u1' },
      UploadRepository: {},
    });
    expect(r.status).toBe(422);
  });

  it('rejeita sem autenticação', async () => {
    const r = await getUploadsByEntity({
      entityType: 'Pet',
      entityId: 'p1',
      user: null,
      UploadRepository: {},
    });
    expect(r.status).toBe(401);
  });
});
const { describe, it, expect } = require('@jest/globals');
const { getUploadById } = require('../../usecases/upload/getUploadById');

describe('getUploadById', () => {
  const base = { _id: 'up1', uploader: { _id: 'u1' } };

  it('retorna quando dono', async () => {
    const repo = { findById: jest.fn(async () => base) };
    const r = await getUploadById({ id: 'up1', user: { _id: 'u1' }, UploadRepository: repo });
    expect(r.success).toBe(true);
  });

  it('rejeita terceiros', async () => {
    const repo = { findById: jest.fn(async () => base) };
    const r = await getUploadById({ id: 'up1', user: { _id: 'u2' }, UploadRepository: repo });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando inexistente', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await getUploadById({ id: 'x', user: { _id: 'u1' }, UploadRepository: repo });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando soft-deleted', async () => {
    const del = { ...base, deletedAt: new Date() };
    const repo = { findById: jest.fn(async () => del) };
    const r = await getUploadById({ id: 'up1', user: { _id: 'u1' }, UploadRepository: repo });
    expect(r.status).toBe(404);
  });

  it('rejeita sem id', async () => {
    const r = await getUploadById({ id: null, user: { _id: 'u1' }, UploadRepository: {} });
    expect(r.status).toBe(422);
  });
});
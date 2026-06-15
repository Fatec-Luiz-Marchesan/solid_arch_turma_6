const { describe, it, expect } = require('@jest/globals');
const { updateUpload } = require('../../usecases/upload/updateUpload');

describe('updateUpload', () => {
  const base = { _id: 'up1', uploader: { _id: 'u1' } };

  it('atualiza description', async () => {
    const repo = {
      findById: jest.fn(async () => base),
      update: jest.fn(async (id, d) => ({ ...base, ...d })),
    };
    const r = await updateUpload({
      id: 'up1',
      data: { description: ' Foto bonita ' },
      user: { _id: 'u1' },
      UploadRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.update.mock.calls[0][1].description).toBe('Foto bonita');
  });

  it('atualiza entity', async () => {
    const repo = {
      findById: jest.fn(async () => base),
      update: jest.fn(async (id, d) => ({ ...base, ...d })),
    };
    const r = await updateUpload({
      id: 'up1',
      data: { entity: { type: 'Pet', _id: 'p1' } },
      user: { _id: 'u1' },
      UploadRepository: repo,
    });
    expect(r.success).toBe(true);
  });

  it('rejeita dados inválidos', async () => {
    const repo = { findById: jest.fn(async () => base) };
    const r = await updateUpload({
      id: 'up1',
      data: { entity: null },
      user: { _id: 'u1' },
      UploadRepository: repo,
    });
    expect(r.status).toBe(422);
  });

  it('rejeita terceiros', async () => {
    const repo = { findById: jest.fn(async () => base) };
    const r = await updateUpload({
      id: 'up1',
      data: { description: 'x' },
      user: { _id: 'u2' },
      UploadRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando inexistente', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await updateUpload({
      id: 'x',
      data: {},
      user: { _id: 'u1' },
      UploadRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});
const { describe, it, expect } = require('@jest/globals');
const { deleteLocation } = require('../../usecases/location/deleteLocation');

describe('deleteLocation use case', () => {
  it('deleta quando usuário é dono', async () => {
    const repo = {
      findById: jest.fn(async () => ({ _id: 'l1', user: { _id: 'u1' } })),
      delete: jest.fn(async () => true),
    };
    const r = await deleteLocation({
      id: 'l1',
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.delete).toHaveBeenCalledWith('l1');
  });

  it('retorna 404 quando não existe', async () => {
    const repo = {
      findById: jest.fn(async () => null),
      delete: jest.fn(),
    };
    const r = await deleteLocation({
      id: 'lx',
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('nega acesso a quem não é dono', async () => {
    const repo = {
      findById: jest.fn(async () => ({ _id: 'l1', user: { _id: 'u2' } })),
      delete: jest.fn(),
    };
    const r = await deleteLocation({
      id: 'l1',
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.status).toBe(403);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
const { describe, it, expect } = require('@jest/globals');
const { setPrimaryLocation } = require('../../usecases/location/setPrimaryLocation');

describe('setPrimaryLocation use case', () => {
  it('define como primária e desmarca as outras', async () => {
    const repo = {
      findById: jest.fn(async () => ({ _id: 'l1', user: { _id: 'u1' } })),
      unsetPrimaryForUser: jest.fn(async () => true),
      update: jest.fn(async (id, d) => ({ _id: id, ...d })),
    };
    const r = await setPrimaryLocation({
      id: 'l1',
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.unsetPrimaryForUser).toHaveBeenCalledWith('u1');
    expect(repo.update).toHaveBeenCalledWith('l1', { isPrimary: true });
  });

  it('retorna 404 quando não existe', async () => {
    const repo = {
      findById: jest.fn(async () => null),
      unsetPrimaryForUser: jest.fn(),
      update: jest.fn(),
    };
    const r = await setPrimaryLocation({
      id: 'lx',
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('nega acesso a quem não é dono', async () => {
    const repo = {
      findById: jest.fn(async () => ({ _id: 'l1', user: { _id: 'u2' } })),
      unsetPrimaryForUser: jest.fn(),
      update: jest.fn(),
    };
    const r = await setPrimaryLocation({
      id: 'l1',
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.status).toBe(403);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
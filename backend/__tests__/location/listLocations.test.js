const { describe, it, expect } = require('@jest/globals');
const { listLocations } = require('../../usecases/location/listLocations');

describe('listLocations use case', () => {
  it('lista localizações do usuário', async () => {
    const repo = {
      findByUser: jest.fn(async () => [{ _id: 'l1' }, { _id: 'l2' }]),
    };
    const r = await listLocations({
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.locations).toHaveLength(2);
    expect(repo.findByUser).toHaveBeenCalledWith('u1');
  });

  it('falha sem usuário autenticado', async () => {
    const r = await listLocations({
      user: null,
      LocationRepository: { findByUser: jest.fn() },
    });
    expect(r.status).toBe(401);
  });
});
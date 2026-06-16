const { describe, it, expect } = require('@jest/globals');
const { getLocationById } = require('../../usecases/location/getLocationById');

describe('getLocationById use case', () => {
  it('retorna location quando usuário é dono', async () => {
    const repo = {
      findById: jest.fn(async () => ({
        _id: 'l1',
        user: { _id: 'u1' },
      })),
    };
    const r = await getLocationById({
      id: 'l1',
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.success).toBe(true);
  });

  it('falha com ID ausente', async () => {
    const r = await getLocationById({
      id: null,
      user: { _id: 'u1' },
      LocationRepository: { findById: jest.fn() },
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando não existe', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await getLocationById({
      id: 'lx',
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('nega acesso a usuário que não é o dono', async () => {
    const repo = {
      findById: jest.fn(async () => ({
        _id: 'l1',
        user: { _id: 'u2' },
      })),
    };
    const r = await getLocationById({
      id: 'l1',
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.status).toBe(403);
  });
});
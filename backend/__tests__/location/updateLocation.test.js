const { describe, it, expect } = require('@jest/globals');
const { updateLocation } = require('../../usecases/location/updateLocation');

const validData = {
  name: 'Casa Nova',
  street: 'Rua A',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01310-100',
};

describe('updateLocation use case', () => {
  it('atualiza quando usuário é dono', async () => {
    const repo = {
      findById: jest.fn(async () => ({ _id: 'l1', user: { _id: 'u1' } })),
      update: jest.fn(async (id, d) => ({ _id: id, ...d })),
    };
    const r = await updateLocation({
      id: 'l1',
      data: validData,
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.update).toHaveBeenCalled();
  });

  it('retorna 404 quando não existe', async () => {
    const repo = {
      findById: jest.fn(async () => null),
      update: jest.fn(),
    };
    const r = await updateLocation({
      id: 'lx',
      data: validData,
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('nega acesso a quem não é dono', async () => {
    const repo = {
      findById: jest.fn(async () => ({ _id: 'l1', user: { _id: 'u2' } })),
      update: jest.fn(),
    };
    const r = await updateLocation({
      id: 'l1',
      data: validData,
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.status).toBe(403);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('falha com dados inválidos', async () => {
    const repo = {
      findById: jest.fn(async () => ({ _id: 'l1', user: { _id: 'u1' } })),
      update: jest.fn(),
    };
    const r = await updateLocation({
      id: 'l1',
      data: { name: '' },
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(r.status).toBe(422);
  });
});
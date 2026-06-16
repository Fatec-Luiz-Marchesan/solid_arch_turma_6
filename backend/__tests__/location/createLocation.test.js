const { describe, it, expect } = require('@jest/globals');
const { createLocation } = require('../../usecases/location/createLocation');

const validData = {
  name: 'Casa',
  street: 'Rua das Flores',
  number: '123',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01310-100',
};

const makeRepo = () => ({
  create: jest.fn(async (d) => ({ _id: 'loc1', ...d })),
  unsetPrimaryForUser: jest.fn(async () => true),
});

describe('createLocation use case', () => {
  it('cria localização com dados válidos', async () => {
    const repo = makeRepo();
    const r = await createLocation({
      data: validData,
      user: { _id: 'u1', name: 'João' },
      LocationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(201);
    expect(repo.create).toHaveBeenCalled();
  });

  it('falha com dados inválidos', async () => {
    const r = await createLocation({
      data: { name: 'X' },
      user: { _id: 'u1' },
      LocationRepository: makeRepo(),
    });
    expect(r.success).toBe(false);
    expect(r.status).toBe(422);
  });

  it('falha sem usuário autenticado', async () => {
    const r = await createLocation({
      data: validData,
      user: null,
      LocationRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
  });

  it('desmarca primary anterior ao criar uma nova como primary', async () => {
    const repo = makeRepo();
    await createLocation({
      data: { ...validData, isPrimary: true },
      user: { _id: 'u1' },
      LocationRepository: repo,
    });
    expect(repo.unsetPrimaryForUser).toHaveBeenCalledWith('u1');
  });
});
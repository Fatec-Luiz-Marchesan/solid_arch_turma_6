const { describe, it, expect } = require('@jest/globals');
const { deleteDiet } = require('../../usecases/diet/deleteDiet');

const makeDiet = (overrides = {}) => ({
  _id: 'diet1',
  name: 'Dieta Proteica',
  deletedAt: null,
  ...overrides,
});

const makeRepo = (diet = makeDiet()) => ({
  findById: jest.fn(async () => diet),
  update: jest.fn(async (id, data) => ({ ...diet, ...data })),
});

describe('deleteDiet use case', () => {
  it('faz soft delete com sucesso (200)', async () => {
    const repo = makeRepo();
    const r = await deleteDiet({
      id: 'diet1',
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(r.message).toBe('Dieta removida!');
    expect(repo.update).toHaveBeenCalledWith('diet1', expect.objectContaining({
      deletedAt: expect.any(Date),
    }));
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await deleteDiet({
      id: 'diet1',
      user: null,
      DietRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
    expect(r.success).toBe(false);
  });

  it('falha sem id (422)', async () => {
    const r = await deleteDiet({
      id: null,
      user: { _id: 'u1' },
      DietRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando dieta não existe', async () => {
    const r = await deleteDiet({
      id: 'nope',
      user: { _id: 'u1' },
      DietRepository: makeRepo(null),
    });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando dieta já foi deletada', async () => {
    const r = await deleteDiet({
      id: 'diet1',
      user: { _id: 'u1' },
      DietRepository: makeRepo(makeDiet({ deletedAt: new Date() })),
    });
    expect(r.status).toBe(404);
  });
});

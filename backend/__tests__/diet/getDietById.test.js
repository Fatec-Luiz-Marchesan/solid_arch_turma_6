const { describe, it, expect } = require('@jest/globals');
const { getDietById } = require('../../usecases/diet/getDietById');

const makeRepo = (diet = null) => ({
  findById: jest.fn(async () => diet),
});

describe('getDietById use case', () => {
  it('retorna dieta ativa (200)', async () => {
    const diet = { _id: 'd1', name: 'Low Carb', deletedAt: null };
    const r = await getDietById({ id: 'd1', DietRepository: makeRepo(diet) });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(r.diet).toEqual(diet);
  });

  it('retorna 404 quando dieta não existe', async () => {
    const r = await getDietById({ id: 'nope', DietRepository: makeRepo(null) });
    expect(r.success).toBe(false);
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando dieta está deletada', async () => {
    const diet = { _id: 'd1', name: 'Dieta X', deletedAt: new Date() };
    const r = await getDietById({ id: 'd1', DietRepository: makeRepo(diet) });
    expect(r.success).toBe(false);
    expect(r.status).toBe(404);
  });

  it('retorna 422 quando id não é fornecido', async () => {
    const r = await getDietById({ id: null, DietRepository: makeRepo() });
    expect(r.success).toBe(false);
    expect(r.status).toBe(422);
  });
});

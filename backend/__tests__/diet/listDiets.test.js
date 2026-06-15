const { describe, it, expect } = require('@jest/globals');
const { listDiets } = require('../../usecases/diet/listDiets');

const makeRepo = (diets = []) => ({
  findActive: jest.fn(async () => diets),
});

describe('listDiets use case', () => {
  it('retorna todas as dietas ativas (200)', async () => {
    const diets = [
      { _id: 'd1', name: 'Low Carb', type: 'low-carb' },
      { _id: 'd2', name: 'Proteica', type: 'high-protein' },
    ];
    const repo = makeRepo(diets);
    const r = await listDiets({ DietRepository: repo });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(r.diets).toHaveLength(2);
  });

  it('retorna lista vazia quando não há dietas', async () => {
    const repo = makeRepo([]);
    const r = await listDiets({ DietRepository: repo });
    expect(r.success).toBe(true);
    expect(r.diets).toEqual([]);
  });

  it('filtra por tipo válido', async () => {
    const repo = makeRepo([{ _id: 'd1', type: 'vegan' }]);
    const r = await listDiets({ DietRepository: repo, filters: { type: 'vegan' } });
    expect(r.success).toBe(true);
    expect(repo.findActive).toHaveBeenCalledWith({ type: 'vegan' });
  });

  it('rejeita filtro de tipo inválido (422)', async () => {
    const repo = makeRepo();
    const r = await listDiets({ DietRepository: repo, filters: { type: 'keto-extreme' } });
    expect(r.success).toBe(false);
    expect(r.status).toBe(422);
  });

  it('busca sem filtro quando tipo não é informado', async () => {
    const repo = makeRepo([]);
    await listDiets({ DietRepository: repo, filters: {} });
    expect(repo.findActive).toHaveBeenCalledWith({});
  });
});

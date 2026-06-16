const { describe, it, expect } = require('@jest/globals');
const { updateDiet } = require('../../usecases/diet/updateDiet');

const makeDiet = (overrides = {}) => ({
  _id: 'diet1',
  name: 'Dieta Proteica',
  type: 'high-protein',
  deletedAt: null,
  ...overrides,
});

const makeRepo = ({ diet = makeDiet(), byName = null } = {}) => ({
  findById: jest.fn(async () => diet),
  findByName: jest.fn(async () => byName),
  update: jest.fn(async (id, data) => ({ ...diet, ...data })),
});

describe('updateDiet use case', () => {
  it('atualiza campos válidos (200)', async () => {
    const repo = makeRepo();
    const r = await updateDiet({
      id: 'diet1',
      data: { dailyCalories: 1800, durationDays: 60 },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(repo.update).toHaveBeenCalledWith('diet1', {
      dailyCalories: 1800,
      durationDays: 60,
    });
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await updateDiet({
      id: 'diet1',
      data: { dailyCalories: 1800 },
      user: null,
      DietRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
  });

  it('falha sem id (422)', async () => {
    const r = await updateDiet({
      id: null,
      data: { dailyCalories: 1800 },
      user: { _id: 'u1' },
      DietRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando dieta não existe', async () => {
    const repo = makeRepo({ diet: null });
    const r = await updateDiet({
      id: 'nope',
      data: { dailyCalories: 1800 },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando dieta está deletada', async () => {
    const repo = makeRepo({ diet: makeDiet({ deletedAt: new Date() }) });
    const r = await updateDiet({
      id: 'diet1',
      data: { dailyCalories: 1800 },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('rejeita tipo inválido (422)', async () => {
    const r = await updateDiet({
      id: 'diet1',
      data: { type: 'invalido' },
      user: { _id: 'u1' },
      DietRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('rejeita conflito de nome com outra dieta (409)', async () => {
    const existingOther = { _id: 'diet2', name: 'Low Carb' };
    const repo = makeRepo({ byName: existingOther });
    const r = await updateDiet({
      id: 'diet1',
      data: { name: 'Low Carb' },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    expect(r.status).toBe(409);
  });

  it('permite renomear para o mesmo nome (case-insensitive)', async () => {
    const repo = makeRepo();
    const r = await updateDiet({
      id: 'diet1',
      data: { name: 'dieta proteica' },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.findByName).not.toHaveBeenCalled();
  });

  it('normaliza nome ao atualizar', async () => {
    const repo = makeRepo();
    await updateDiet({
      id: 'diet1',
      data: { name: '  Nova   Dieta  ' },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    expect(repo.update.mock.calls[0][1].name).toBe('Nova Dieta');
  });

  it('apara restrictions e notes ao atualizar', async () => {
    const repo = makeRepo();
    await updateDiet({
      id: 'diet1',
      data: { restrictions: [' glúten '], notes: '  beber água  ' },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    const payload = repo.update.mock.calls[0][1];
    expect(payload.restrictions).toEqual(['glúten']);
    expect(payload.notes).toBe('beber água');
  });
});

describe('updateDiet - mealsPerDay', () => {
  it('atualiza mealsPerDay (200)', async () => {
    const repo = makeRepo();
    const r = await updateDiet({
      id: 'diet1',
      data: { mealsPerDay: 4 },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    expect(r.status).toBe(200);
    expect(repo.update).toHaveBeenCalledWith('diet1', { mealsPerDay: 4 });
  });

  it('rejeita mealsPerDay inválido (422)', async () => {
    const r = await updateDiet({
      id: 'diet1',
      data: { mealsPerDay: -1 },
      user: { _id: 'u1' },
      DietRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });
});
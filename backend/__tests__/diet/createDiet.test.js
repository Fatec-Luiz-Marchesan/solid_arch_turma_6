const { describe, it, expect } = require('@jest/globals');
const { createDiet } = require('../../usecases/diet/createDiet');

const makeRepo = (existingByName = null) => ({
  findByName: jest.fn(async () => existingByName),
  create: jest.fn(async (d) => ({ _id: 'diet1', ...d })),
});

describe('createDiet use case', () => {
  it('cria dieta com defaults (201)', async () => {
    const repo = makeRepo();
    const r = await createDiet({
      data: { name: 'Dieta Proteica', type: 'high-protein' },
      user: { _id: 'u1', name: 'Ana' },
      DietRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(201);
    const payload = repo.create.mock.calls[0][0];
    expect(payload.goal).toBe('');
    expect(payload.dailyCalories).toBeNull();
    expect(payload.durationDays).toBeNull();
    expect(payload.restrictions).toEqual([]);
    expect(payload.notes).toBe('');
    expect(payload.user).toEqual({ _id: 'u1', name: 'Ana' });
    expect(payload.deletedAt).toBeNull();
  });

  it('falha sem usuário autenticado (401)', async () => {
    const r = await createDiet({
      data: { name: 'Dieta Proteica', type: 'high-protein' },
      user: null,
      DietRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
    expect(r.success).toBe(false);
  });

  it('falha com user sem _id (401)', async () => {
    const r = await createDiet({
      data: { name: 'Dieta Proteica', type: 'high-protein' },
      user: {},
      DietRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
  });

  it('falha com dados inválidos — tipo ausente (422)', async () => {
    const r = await createDiet({
      data: { name: 'Dieta Proteica' },
      user: { _id: 'u1' },
      DietRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('falha com nome curto demais (422)', async () => {
    const r = await createDiet({
      data: { name: 'D', type: 'low-carb' },
      user: { _id: 'u1' },
      DietRepository: makeRepo(),
    });
    expect(r.status).toBe(422);
  });

  it('falha quando já existe dieta com o mesmo nome (409)', async () => {
    const repo = makeRepo({ _id: 'old', name: 'Dieta Proteica' });
    const r = await createDiet({
      data: { name: 'dieta proteica', type: 'high-protein' },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    expect(r.status).toBe(409);
  });

  it('normaliza nome e apara restrictions', async () => {
    const repo = makeRepo();
    await createDiet({
      data: {
        name: '  Low   Carb  ',
        type: 'low-carb',
        restrictions: [' glúten ', ' lactose'],
        goal: '  Emagrecer  ',
      },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    const p = repo.create.mock.calls[0][0];
    expect(p.name).toBe('Low Carb');
    expect(p.restrictions).toEqual(['glúten', 'lactose']);
    expect(p.goal).toBe('Emagrecer');
  });

  it('aceita valores customizados válidos', async () => {
    const repo = makeRepo();
    const r = await createDiet({
      data: {
        name: 'Dieta Personalizada',
        type: 'maintenance',
        dailyCalories: 2200,
        durationDays: 30,
        restrictions: ['amendoim'],
        notes: 'Tomar bastante água.',
      },
      user: { _id: 'u1' },
      DietRepository: repo,
    });
    expect(r.success).toBe(true);
    const p = repo.create.mock.calls[0][0];
    expect(p.dailyCalories).toBe(2200);
    expect(p.durationDays).toBe(30);
    expect(p.restrictions).toEqual(['amendoim']);
    expect(p.notes).toBe('Tomar bastante água.');
  });
});

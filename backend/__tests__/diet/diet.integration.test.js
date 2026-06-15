const {
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
} = require('@jest/globals');
const request = require('supertest');

jest.mock('../../helpers/get-token', () => () => 'fake-token');
jest.mock('../../helpers/get-user-by-token', () => async () => ({
  _id: 'user-logado-id',
  name: 'Usuário Teste',
}));

const { buildTestApp } = require('../helpers/buildTestApp');
const DietController = require('../../controllers/DietController');

describe('Diet — testes de integração', () => {
  let app;
  let repo;
  let store;

  beforeEach(() => {
    store = new Map();
    let seq = 0;
    repo = {
      create: jest.fn(async (data) => {
        const _id = 'diet-' + ++seq;
        const diet = { _id, ...data, createdAt: new Date() };
        store.set(_id, diet);
        return diet;
      }),
      findActive: jest.fn(async (query = {}) =>
        Array.from(store.values()).filter(
          (d) => !d.deletedAt && (!query.type || d.type === query.type)
        )
      ),
      findById: jest.fn(async (id) => store.get(id) || null),
      findByName: jest.fn(
        async (name) =>
          Array.from(store.values()).find(
            (d) =>
              !d.deletedAt &&
              String(d.name).toLowerCase() === String(name).toLowerCase()
          ) || null
      ),
      update: jest.fn(async (id, data) => {
        const cur = store.get(id);
        if (!cur) return null;
        const updated = { ...cur, ...data };
        store.set(id, updated);
        return updated;
      }),
    };

    app = buildTestApp({ dietRepository: repo });
  });

  afterAll(() => {
    DietController.resetRepository();
  });

  describe('POST /diets', () => {
    it('cria dieta válida (201)', async () => {
      const res = await request(app)
        .post('/diets')
        .send({ name: 'Low Carb', type: 'low-carb', dailyCalories: 1600 });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.dailyCalories).toBe(1600);
      expect(res.body.data.deletedAt).toBeNull();
    });

    it('rejeita tipo inválido (422)', async () => {
      const res = await request(app)
        .post('/diets')
        .send({ name: 'Dieta X', type: 'keto-extreme' });

      expect(res.status).toBe(422);
    });

    it('rejeita nome muito curto (422)', async () => {
      const res = await request(app)
        .post('/diets')
        .send({ name: 'D', type: 'vegan' });

      expect(res.status).toBe(422);
    });

    it('rejeita nome duplicado, ignorando maiúsculas (409)', async () => {
      await request(app)
        .post('/diets')
        .send({ name: 'Dieta Vegana', type: 'vegan' });

      const res = await request(app)
        .post('/diets')
        .send({ name: 'dieta vegana', type: 'vegan' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /diets', () => {
    it('lista dietas ativas (200)', async () => {
      await request(app)
        .post('/diets')
        .send({ name: 'Low Carb', type: 'low-carb' });

      const res = await request(app).get('/diets');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.diets)).toBe(true);
      expect(res.body.diets).toHaveLength(1);
    });

    it('retorna lista vazia quando não há dietas', async () => {
      const res = await request(app).get('/diets');
      expect(res.status).toBe(200);
      expect(res.body.diets).toEqual([]);
    });

    it('filtra por tipo via query string', async () => {
      await request(app).post('/diets').send({ name: 'Low Carb', type: 'low-carb' });
      await request(app).post('/diets').send({ name: 'Dieta Vegana', type: 'vegan' });

      const res = await request(app).get('/diets?type=vegan');
      expect(res.status).toBe(200);
      expect(res.body.diets).toHaveLength(1);
      expect(res.body.diets[0].type).toBe('vegan');
    });

    it('rejeita filtro de tipo inválido (422)', async () => {
      const res = await request(app).get('/diets?type=invalido');
      expect(res.status).toBe(422);
    });
  });

  describe('GET /diets/:id', () => {
    it('retorna detalhes (200)', async () => {
      const created = await request(app)
        .post('/diets')
        .send({ name: 'Proteica', type: 'high-protein' });

      const id = created.body.data._id;
      const res = await request(app).get(`/diets/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.diet._id).toBe(id);
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app).get('/diets/inexistente');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /diets/:id', () => {
    let dietId;

    beforeEach(async () => {
      const r = await request(app)
        .post('/diets')
        .send({ name: 'Manutenção', type: 'maintenance', dailyCalories: 2000 });
      dietId = r.body.data._id;
    });

    it('atualiza campos válidos (200)', async () => {
      const res = await request(app)
        .patch(`/diets/${dietId}`)
        .send({ dailyCalories: 2200, durationDays: 30 });

      expect(res.status).toBe(200);
      expect(res.body.data.dailyCalories).toBe(2200);
      expect(res.body.data.durationDays).toBe(30);
    });

    it('rejeita tipo inválido na atualização (422)', async () => {
      const res = await request(app)
        .patch(`/diets/${dietId}`)
        .send({ type: 'invalido' });

      expect(res.status).toBe(422);
    });

    it('retorna 404 para dieta inexistente', async () => {
      const res = await request(app)
        .patch('/diets/nope')
        .send({ dailyCalories: 1800 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /diets/:id', () => {
    it('faz soft delete (200) e some da listagem', async () => {
      const created = await request(app)
        .post('/diets')
        .send({ name: 'Dieta Temporária', type: 'other' });
      const id = created.body.data._id;

      const res = await request(app).delete(`/diets/${id}`);
      expect(res.status).toBe(200);

      const list = await request(app).get('/diets');
      expect(list.body.diets).toHaveLength(0);
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app).delete('/diets/inexistente');
      expect(res.status).toBe(404);
    });
  });

  describe('Fluxo completo: criar → consultar → atualizar → remover', () => {
    it('passa por todas as etapas com sucesso', async () => {
      const created = await request(app)
        .post('/diets')
        .send({ name: 'Dieta Completa', type: 'weight-loss', goal: 'Perder peso' });
      expect(created.status).toBe(201);
      const id = created.body.data._id;

      const detail = await request(app).get(`/diets/${id}`);
      expect(detail.body.diet.goal).toBe('Perder peso');

      const updated = await request(app)
        .patch(`/diets/${id}`)
        .send({ dailyCalories: 1500, notes: 'Sem açúcar refinado.' });
      expect(updated.body.data.dailyCalories).toBe(1500);
      expect(updated.body.data.notes).toBe('Sem açúcar refinado.');

      const removed = await request(app).delete(`/diets/${id}`);
      expect(removed.status).toBe(200);

      const list = await request(app).get('/diets');
      expect(list.body.diets).toHaveLength(0);
    });
  });
});

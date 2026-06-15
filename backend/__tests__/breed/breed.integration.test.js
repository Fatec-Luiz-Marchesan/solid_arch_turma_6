const {
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
} = require('@jest/globals');
const request = require('supertest');

// Mocka os helpers de auth ANTES de qualquer require que dependa deles
jest.mock('../../helpers/get-token', () => () => 'fake-token');
jest.mock('../../helpers/get-user-by-token', () => async () => ({
  _id: 'user-logado-id',
  name: 'Usuário Teste',
}));

const { buildTestApp } = require('../helpers/buildTestApp');
const BreedController = require('../../controllers/BreedController');

describe('Breed — testes de integração', () => {
  let app;
  let repo;
  let store;

  beforeEach(() => {
    store = new Map();
    let seq = 0;
    repo = {
      create: jest.fn(async (data) => {
        const _id = 'breed-' + ++seq;
        const breed = { _id, ...data, createdAt: new Date() };
        store.set(_id, breed);
        return breed;
      }),
      findActive: jest.fn(async (query = {}, options = {}) => {
        const results = Array.from(store.values()).filter(
          (b) => !b.deletedAt && (!query.species || b.species === query.species)
        );
        const { skip = 0, limit } = options;
        return results.slice(skip, limit ? skip + limit : undefined);
      }),
      countActive: jest.fn(async (query = {}) =>
        Array.from(store.values()).filter(
          (b) => !b.deletedAt && (!query.species || b.species === query.species)
        ).length
      ),
      findById: jest.fn(async (id) => store.get(id) || null),
      findByName: jest.fn(
        async (name) =>
          Array.from(store.values()).find(
            (b) =>
              !b.deletedAt &&
              String(b.name).toLowerCase() === String(name).toLowerCase()
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

    app = buildTestApp({ breedRepository: repo });
  });

  afterAll(() => {
    BreedController.resetRepository();
  });

  describe('POST /breeds', () => {
    it('cria raça válida (201)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'Labrador', species: 'dog', size: 'large' });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.size).toBe('large');
      expect(res.body.data.deletedAt).toBeNull();
    });

    it('rejeita espécie inválida (422)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'Dragão', species: 'dragon' });

      expect(res.status).toBe(422);
    });

    it('rejeita nome muito curto (422)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'L', species: 'dog' });

      expect(res.status).toBe(422);
    });

    it('rejeita nome duplicado, ignorando maiúsculas (409)', async () => {
      await request(app)
        .post('/breeds')
        .send({ name: 'Poodle', species: 'dog' });

      const res = await request(app)
        .post('/breeds')
        .send({ name: 'poodle', species: 'dog' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /breeds', () => {
    it('lista raças ativas (200)', async () => {
      await request(app)
        .post('/breeds')
        .send({ name: 'Labrador', species: 'dog' });

      const res = await request(app).get('/breeds');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.breeds)).toBe(true);
      expect(res.body.breeds).toHaveLength(1);
    });

    it('retorna lista vazia quando não há raças', async () => {
      const res = await request(app).get('/breeds');
      expect(res.status).toBe(200);
      expect(res.body.breeds).toEqual([]);
    });

    it('filtra por espécie via query string', async () => {
      await request(app).post('/breeds').send({ name: 'Labrador', species: 'dog' });
      await request(app).post('/breeds').send({ name: 'Siamês', species: 'cat' });

      const res = await request(app).get('/breeds?species=cat');
      expect(res.status).toBe(200);
      expect(res.body.breeds).toHaveLength(1);
      expect(res.body.breeds[0].species).toBe('cat');
    });

    it('rejeita filtro de espécie inválido (422)', async () => {
      const res = await request(app).get('/breeds?species=dragon');
      expect(res.status).toBe(422);
    });
  });

  describe('GET /breeds/:id', () => {
    it('retorna detalhes (200)', async () => {
      const created = await request(app)
        .post('/breeds')
        .send({ name: 'Labrador', species: 'dog' });

      const id = created.body.data._id;
      const res = await request(app).get(`/breeds/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.breed._id).toBe(id);
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app).get('/breeds/inexistente');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /breeds/:id', () => {
    let breedId;

    beforeEach(async () => {
      const r = await request(app)
        .post('/breeds')
        .send({ name: 'Labrador', species: 'dog', size: 'medium' });
      breedId = r.body.data._id;
    });

    it('atualiza campos válidos (200)', async () => {
      const res = await request(app)
        .patch(`/breeds/${breedId}`)
        .send({ size: 'small', lifeExpectancy: 12 });

      expect(res.status).toBe(200);
      expect(res.body.data.size).toBe('small');
      expect(res.body.data.lifeExpectancy).toBe(12);
    });

    it('rejeita atualização inválida (422)', async () => {
      const res = await request(app)
        .patch(`/breeds/${breedId}`)
        .send({ species: 'dragon' });

      expect(res.status).toBe(422);
    });

    it('retorna 404 para raça inexistente', async () => {
      const res = await request(app)
        .patch('/breeds/nope')
        .send({ size: 'small' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /breeds/:id', () => {
    it('faz soft delete (200) e some da listagem', async () => {
      const created = await request(app)
        .post('/breeds')
        .send({ name: 'Labrador', species: 'dog' });
      const id = created.body.data._id;

      const res = await request(app).delete(`/breeds/${id}`);
      expect(res.status).toBe(200);

      const list = await request(app).get('/breeds');
      expect(list.body.breeds).toHaveLength(0);
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app).delete('/breeds/inexistente');
      expect(res.status).toBe(404);
    });
  });

  describe('Fluxo completo: criar → consultar → atualizar → remover', () => {
    it('passa por todas as etapas com sucesso', async () => {
      const created = await request(app)
        .post('/breeds')
        .send({ name: 'Border Collie', species: 'dog', origin: 'Escócia' });
      expect(created.status).toBe(201);
      const id = created.body.data._id;

      const detail = await request(app).get(`/breeds/${id}`);
      expect(detail.body.breed.origin).toBe('Escócia');

      const updated = await request(app)
        .patch(`/breeds/${id}`)
        .send({ description: 'Cão de pastoreio.' });
      expect(updated.body.data.description).toBe('Cão de pastoreio.');

      const removed = await request(app).delete(`/breeds/${id}`);
      expect(removed.status).toBe(200);

      const list = await request(app).get('/breeds');
      expect(list.body.breeds).toHaveLength(0);
    });
  });
});
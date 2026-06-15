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

  describe('Campos opcionais e normalização', () => {
    it('persiste todos os campos opcionais ao criar (201)', async () => {
      const res = await request(app).post('/breeds').send({
        name: 'Shih Tzu',
        species: 'dog',
        size: 'small',
        description: 'Raça originária da China.',
        temperament: ['amigável', 'brincalhão'],
        lifeExpectancy: 14,
        origin: 'China',
        hypoallergenic: true,
      });

      expect(res.status).toBe(201);
      const d = res.body.data;
      expect(d.description).toBe('Raça originária da China.');
      expect(d.temperament).toEqual(['amigável', 'brincalhão']);
      expect(d.lifeExpectancy).toBe(14);
      expect(d.origin).toBe('China');
      expect(d.hypoallergenic).toBe(true);
    });

    it('normaliza espaços extras no nome (201)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: '  Golden   Retriever  ', species: 'dog' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Golden Retriever');
    });

    it('aceita espécie cat (201)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'Siamês', species: 'cat' });

      expect(res.status).toBe(201);
      expect(res.body.data.species).toBe('cat');
    });

    it('aceita espécie rabbit (201)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'Holland Lop', species: 'rabbit' });

      expect(res.status).toBe(201);
    });

    it('aplica size medium como default quando omitido', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'Vira-lata', species: 'dog' });

      expect(res.status).toBe(201);
      expect(res.body.data.size).toBe('medium');
    });

    it('inicializa deletedAt como null na criação', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'Akita', species: 'dog' });

      expect(res.status).toBe(201);
      expect(res.body.data.deletedAt).toBeNull();
    });
  });

  describe('Validações de limite', () => {
    it('rejeita nome muito longo — >50 caracteres (422)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'A'.repeat(51), species: 'dog' });

      expect(res.status).toBe(422);
    });

    it('rejeita lifeExpectancy fora do intervalo (422)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'Mutante', species: 'dog', lifeExpectancy: 100 });

      expect(res.status).toBe(422);
    });

    it('rejeita size inválido (422)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'Gigante', species: 'dog', size: 'giant' });

      expect(res.status).toBe(422);
    });

    it('rejeita hypoallergenic não booleano (422)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'Caniche', species: 'dog', hypoallergenic: 'sim' });

      expect(res.status).toBe(422);
    });

    it('rejeita temperament como string em vez de array (422)', async () => {
      const res = await request(app)
        .post('/breeds')
        .send({ name: 'Beagle', species: 'dog', temperament: 'ativo' });

      expect(res.status).toBe(422);
    });
  });

  describe('Renomeação e conflitos no PATCH', () => {
    it('rejeita renomear para nome já existente em outra raça (409)', async () => {
      await request(app).post('/breeds').send({ name: 'Pug', species: 'dog' });
      const r2 = await request(app).post('/breeds').send({ name: 'Dálmata', species: 'dog' });
      const id2 = r2.body.data._id;

      const res = await request(app)
        .patch(`/breeds/${id2}`)
        .send({ name: 'Pug' });

      expect(res.status).toBe(409);
    });

    it('permite renomear para o mesmo nome (sem conflito)', async () => {
      const r = await request(app).post('/breeds').send({ name: 'Husky', species: 'dog' });
      const id = r.body.data._id;

      const res = await request(app)
        .patch(`/breeds/${id}`)
        .send({ name: 'Husky', size: 'large' });

      expect(res.status).toBe(200);
    });

    it('normaliza espaços no nome durante PATCH', async () => {
      const r = await request(app).post('/breeds').send({ name: 'Maltês', species: 'dog' });
      const id = r.body.data._id;

      const res = await request(app)
        .patch(`/breeds/${id}`)
        .send({ name: '  Maltês  ' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Maltês');
    });

    it('atualiza temperament e origin em conjunto (200)', async () => {
      const r = await request(app).post('/breeds').send({ name: 'Spitz', species: 'dog' });
      const id = r.body.data._id;

      const res = await request(app).patch(`/breeds/${id}`).send({
        temperament: ['leal', 'corajoso'],
        origin: 'Alemanha',
        lifeExpectancy: 13,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.temperament).toEqual(['leal', 'corajoso']);
      expect(res.body.data.origin).toBe('Alemanha');
      expect(res.body.data.lifeExpectancy).toBe(13);
    });
  });

  describe('Fluxo de exclusão e reutilização de nome', () => {
    it('permite criar nova raça com nome de uma raça já removida', async () => {
      const r = await request(app).post('/breeds').send({ name: 'Fila', species: 'dog' });
      const id = r.body.data._id;

      await request(app).delete(`/breeds/${id}`);

      const res = await request(app).post('/breeds').send({ name: 'Fila', species: 'dog' });
      expect(res.status).toBe(201);
    });

    it('raça removida não aparece na listagem por espécie', async () => {
      const r = await request(app).post('/breeds').send({ name: 'Setter', species: 'dog' });
      await request(app).delete(`/breeds/${r.body.data._id}`);

      await request(app).post('/breeds').send({ name: 'Bengal', species: 'cat' });

      const res = await request(app).get('/breeds?species=dog');
      expect(res.status).toBe(200);
      expect(res.body.breeds).toHaveLength(0);
    });

    it('retorna 404 ao consultar raça removida pelo id', async () => {
      const r = await request(app).post('/breeds').send({ name: 'Pointer', species: 'dog' });
      const id = r.body.data._id;

      await request(app).delete(`/breeds/${id}`);

      const res = await request(app).get(`/breeds/${id}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Listagem com múltiplos registros', () => {
    it('lista todas as espécies ativas sem filtro', async () => {
      await request(app).post('/breeds').send({ name: 'Labrador', species: 'dog' });
      await request(app).post('/breeds').send({ name: 'Persa', species: 'cat' });
      await request(app).post('/breeds').send({ name: 'Calopsita', species: 'bird' });

      const res = await request(app).get('/breeds');
      expect(res.status).toBe(200);
      expect(res.body.breeds).toHaveLength(3);
    });

    it('retorna apenas dog ao filtrar por species=dog com múltiplos registros', async () => {
      await request(app).post('/breeds').send({ name: 'Rottweiler', species: 'dog' });
      await request(app).post('/breeds').send({ name: 'Rottweiler Cat', species: 'cat' });
      await request(app).post('/breeds').send({ name: 'Rottweiler Bird', species: 'bird' });

      const res = await request(app).get('/breeds?species=dog');
      expect(res.status).toBe(200);
      expect(res.body.breeds).toHaveLength(1);
      expect(res.body.breeds[0].species).toBe('dog');
    });
  });
});
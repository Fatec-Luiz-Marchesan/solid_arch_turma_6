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
const ReportController = require('../../controllers/ReportController');

describe('Report — testes de integração', () => {
  let app;
  let repo;
  let store;

  beforeEach(() => {
    store = new Map();
    let seq = 0;
    repo = {
      create: jest.fn(async (data) => {
        const _id = 'report-' + ++seq;
        const report = { _id, ...data, createdAt: new Date() };
        store.set(_id, report);
        return report;
      }),
      findActive: jest.fn(async (query = {}) =>
        Array.from(store.values()).filter(
          (r) =>
            !r.deletedAt &&
            (!query.status || r.status === query.status) &&
            (!query.targetType || r.targetType === query.targetType)
        )
      ),
      findById: jest.fn(async (id) => store.get(id) || null),
      findDuplicate: jest.fn(
        async ({ reporterId, targetType, targetId }) =>
          Array.from(store.values()).find(
            (r) =>
              !r.deletedAt &&
              r.reporter._id === reporterId &&
              r.targetType === targetType &&
              r.targetId === targetId
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

    app = buildTestApp({ reportRepository: repo });
  });

  afterAll(() => {
    ReportController.resetRepository();
  });

  const validBody = {
    targetType: 'pet',
    targetId: 'pet-123',
    reason: 'spam',
  };

  describe('POST /reports', () => {
    it('cria denúncia válida (201)', async () => {
      const res = await request(app).post('/reports').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.reporter._id).toBe('user-logado-id');
      expect(res.body.data.deletedAt).toBeNull();
    });

    it('rejeita motivo inválido (422)', async () => {
      const res = await request(app)
        .post('/reports')
        .send({ ...validBody, reason: 'porque-sim' });

      expect(res.status).toBe(422);
    });

    it('rejeita tipo de alvo inválido (422)', async () => {
      const res = await request(app)
        .post('/reports')
        .send({ ...validBody, targetType: 'comment' });

      expect(res.status).toBe(422);
    });

    it('rejeita targetId ausente (422)', async () => {
      const res = await request(app)
        .post('/reports')
        .send({ targetType: 'pet', reason: 'spam' });

      expect(res.status).toBe(422);
    });

    it('rejeita denúncia duplicada do mesmo alvo (409)', async () => {
      await request(app).post('/reports').send(validBody);
      const res = await request(app).post('/reports').send(validBody);

      expect(res.status).toBe(409);
    });
  });

  describe('GET /reports', () => {
    it('lista denúncias ativas (200)', async () => {
      await request(app).post('/reports').send(validBody);

      const res = await request(app).get('/reports');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.reports)).toBe(true);
      expect(res.body.reports).toHaveLength(1);
    });

    it('retorna lista vazia quando não há denúncias', async () => {
      const res = await request(app).get('/reports');
      expect(res.status).toBe(200);
      expect(res.body.reports).toEqual([]);
    });

    it('filtra por status via query string', async () => {
      const created = await request(app).post('/reports').send(validBody);
      await request(app)
        .patch(`/reports/${created.body.data._id}/status`)
        .send({ status: 'resolved' });
      await request(app)
        .post('/reports')
        .send({ ...validBody, targetId: 'pet-999' });

      const res = await request(app).get('/reports?status=resolved');
      expect(res.status).toBe(200);
      expect(res.body.reports).toHaveLength(1);
      expect(res.body.reports[0].status).toBe('resolved');
    });

    it('rejeita filtro de status inválido (422)', async () => {
      const res = await request(app).get('/reports?status=archived');
      expect(res.status).toBe(422);
    });
  });

  describe('GET /reports/:id', () => {
    it('retorna detalhes (200)', async () => {
      const created = await request(app).post('/reports').send(validBody);
      const id = created.body.data._id;

      const res = await request(app).get(`/reports/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.report._id).toBe(id);
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app).get('/reports/inexistente');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /reports/:id/status', () => {
    let reportId;

    beforeEach(async () => {
      const r = await request(app).post('/reports').send(validBody);
      reportId = r.body.data._id;
    });

    it('atualiza status válido (200)', async () => {
      const res = await request(app)
        .patch(`/reports/${reportId}/status`)
        .send({ status: 'reviewing' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('reviewing');
    });

    it('rejeita status inválido (422)', async () => {
      const res = await request(app)
        .patch(`/reports/${reportId}/status`)
        .send({ status: 'archived' });

      expect(res.status).toBe(422);
    });

    it('retorna 404 para denúncia inexistente', async () => {
      const res = await request(app)
        .patch('/reports/nope/status')
        .send({ status: 'resolved' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /reports/:id', () => {
    it('faz soft delete (200) e some da listagem', async () => {
      const created = await request(app).post('/reports').send(validBody);
      const id = created.body.data._id;

      const res = await request(app).delete(`/reports/${id}`);
      expect(res.status).toBe(200);

      const list = await request(app).get('/reports');
      expect(list.body.reports).toHaveLength(0);
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app).delete('/reports/inexistente');
      expect(res.status).toBe(404);
    });
  });

  describe('Fluxo completo: criar → consultar → moderar → remover', () => {
    it('passa por todas as etapas com sucesso', async () => {
      const created = await request(app)
        .post('/reports')
        .send({ ...validBody, description: 'Anúncio falso.' });
      expect(created.status).toBe(201);
      const id = created.body.data._id;

      const detail = await request(app).get(`/reports/${id}`);
      expect(detail.body.report.description).toBe('Anúncio falso.');

      const moderated = await request(app)
        .patch(`/reports/${id}/status`)
        .send({ status: 'resolved' });
      expect(moderated.body.data.status).toBe('resolved');

      const removed = await request(app).delete(`/reports/${id}`);
      expect(removed.status).toBe(200);

      const list = await request(app).get('/reports');
      expect(list.body.reports).toHaveLength(0);
    });
  });
});
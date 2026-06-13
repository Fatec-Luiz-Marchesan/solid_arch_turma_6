const { describe, it, expect, beforeEach, afterAll } = require('@jest/globals');
const request = require('supertest');

// Mocka os helpers de auth ANTES de qualquer require que dependa deles
jest.mock('../../helpers/get-token', () => () => 'fake-token');
jest.mock('../../helpers/get-user-by-token', () => async () => ({
  _id: 'user-logado-id',
  name: 'Usuário Teste',
}));

const { buildTestApp } = require('../helpers/buildTestApp');
const PaymentController = require('../../controllers/PaymentController');

describe('Payment — testes de integração', () => {
  let app;
  let repo;
  let store; 
  beforeEach(() => {
    store = new Map();
    repo = {
      create: jest.fn(async (data) => {
        const _id = 'pay-' + (store.size + 1);
        const payment = { _id, ...data, createdAt: new Date() };
        store.set(_id, payment);
        return payment;
      }),
      findByUser: jest.fn(async (userId) =>
        Array.from(store.values()).filter(
          (p) => String(p.payer._id) === String(userId)
        )
      ),
      findActiveByUser: jest.fn(async (userId) =>
        Array.from(store.values()).filter(
          (p) => String(p.payer._id) === String(userId) && !p.deletedAt
        )
      ),
      findById: jest.fn(async (id) => store.get(id) || null),
      update: jest.fn(async (id, data) => {
        const cur = store.get(id);
        if (!cur) return null;
        const updated = { ...cur, ...data };
        store.set(id, updated);
        return updated;
      }),
      delete: jest.fn(async (id) => store.delete(id)),
    };

    app = buildTestApp({ paymentRepository: repo });
  });

  afterAll(() => {
    PaymentController.resetRepository();
  });

 
  describe('POST /payments', () => {
    it('cria pagamento válido (201)', async () => {
      const res = await request(app)
        .post('/payments')
        .send({ amount: 150, method: 'pix', petId: 'p1' });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.currency).toBe('BRL');
      expect(res.body.data.status).toBe('pending');
    });

    it('aceita parcelamento para credit_card', async () => {
      const res = await request(app).post('/payments').send({
        amount: 1200,
        method: 'credit_card',
        petId: 'p1',
        installments: 6,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.installments).toBe(6);
    });

    it('rejeita parcelamento para pix (422)', async () => {
      const res = await request(app).post('/payments').send({
        amount: 1200,
        method: 'pix',
        petId: 'p1',
        installments: 6,
      });

      expect(res.status).toBe(422);
    });

    it('rejeita valor negativo (422)', async () => {
      const res = await request(app)
        .post('/payments')
        .send({ amount: -50, method: 'pix', petId: 'p1' });

      expect(res.status).toBe(422);
    });

    it('rejeita método inválido (422)', async () => {
      const res = await request(app)
        .post('/payments')
        .send({ amount: 50, method: 'bitcoin', petId: 'p1' });

      expect(res.status).toBe(422);
    });

    it('rejeita sem petId (422)', async () => {
      const res = await request(app)
        .post('/payments')
        .send({ amount: 50, method: 'pix' });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /payments', () => {
    it('lista pagamentos do usuário (200)', async () => {
  
      await request(app)
        .post('/payments')
        .send({ amount: 50, method: 'pix', petId: 'p1' });

      const res = await request(app).get('/payments');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.payments)).toBe(true);
      expect(res.body.payments).toHaveLength(1);
    });

    it('retorna lista vazia quando não há pagamentos', async () => {
      const res = await request(app).get('/payments');
      expect(res.status).toBe(200);
      expect(res.body.payments).toEqual([]);
    });
  });


  describe('GET /payments/:id', () => {
    it('retorna detalhes (200)', async () => {
      const created = await request(app)
        .post('/payments')
        .send({ amount: 50, method: 'pix', petId: 'p1' });

      const id = created.body.data._id;
      const res = await request(app).get(`/payments/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.payment._id).toBe(id);
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app).get('/payments/inexistente');
      expect(res.status).toBe(404);
    });
  });


  describe('PATCH /payments/:id/status', () => {
    let paymentId;

    beforeEach(async () => {
      const r = await request(app)
        .post('/payments')
        .send({ amount: 50, method: 'pix', petId: 'p1' });
      paymentId = r.body.data._id;
    });

    it('atualiza status para completed (200)', async () => {
      const res = await request(app)
        .patch(`/payments/${paymentId}/status`)
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.processedAt).toBeTruthy();
    });

    it('atualiza para refunded com motivo (200)', async () => {
      const res = await request(app)
        .patch(`/payments/${paymentId}/status`)
        .send({ status: 'refunded', refundReason: 'Cliente desistiu da adoção' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('refunded');
      expect(res.body.data.refundReason).toBe('Cliente desistiu da adoção');
    });

    it('rejeita refund sem motivo (422)', async () => {
      const res = await request(app)
        .patch(`/payments/${paymentId}/status`)
        .send({ status: 'refunded' });

      expect(res.status).toBe(422);
    });

    it('rejeita status inválido (422)', async () => {
      const res = await request(app)
        .patch(`/payments/${paymentId}/status`)
        .send({ status: 'cancelado' });

      expect(res.status).toBe(422);
    });

    it('retorna 404 para pagamento inexistente', async () => {
      const res = await request(app)
        .patch('/payments/nope/status')
        .send({ status: 'completed' });

      expect(res.status).toBe(404);
    });
  });

 
  describe('DELETE /payments/:id', () => {
    it('faz soft delete em pagamento pending (200)', async () => {
      const created = await request(app)
        .post('/payments')
        .send({ amount: 50, method: 'pix', petId: 'p1' });
      const id = created.body.data._id;

      const res = await request(app).delete(`/payments/${id}`);
      expect(res.status).toBe(200);

     
      const list = await request(app).get('/payments');
      expect(list.body.payments).toHaveLength(0);
    });

    it('rejeita deletar pagamento já completado (422)', async () => {
      const created = await request(app)
        .post('/payments')
        .send({ amount: 50, method: 'pix', petId: 'p1' });
      const id = created.body.data._id;

      await request(app)
        .patch(`/payments/${id}/status`)
        .send({ status: 'completed' });

      const res = await request(app).delete(`/payments/${id}`);
      expect(res.status).toBe(422);
    });

    it('retorna 404 quando não existe', async () => {
      const res = await request(app).delete('/payments/inexistente');
      expect(res.status).toBe(404);
    });
  });


  describe('Fluxo completo: criar → completar → consultar', () => {
    it('passa por todas as etapas com sucesso', async () => {
   
      const created = await request(app)
        .post('/payments')
        .send({ amount: 200, method: 'pix', petId: 'p1', description: 'Taxa' });
      expect(created.status).toBe(201);
      const id = created.body.data._id;

      let detail = await request(app).get(`/payments/${id}`);
      expect(detail.body.payment.status).toBe('pending');

      const updated = await request(app)
        .patch(`/payments/${id}/status`)
        .send({ status: 'completed' });
      expect(updated.body.data.status).toBe('completed');

      const list = await request(app).get('/payments');
      expect(list.body.payments[0].status).toBe('completed');
    });
  });
});
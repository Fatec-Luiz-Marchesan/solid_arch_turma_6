const { describe, it, expect } = require('@jest/globals');
const { getPaymentById } = require('../../usecases/payment/getPaymentById');

describe('getPaymentById use case', () => {
  const basePay = { _id: 'p1', payer: { _id: 'u1' } };

  it('retorna pagamento se usuário é o pagador', async () => {
    const repo = { findById: jest.fn(async () => basePay) };
    const r = await getPaymentById({
      id: 'p1',
      user: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.success).toBe(true);
  });

  it('nega acesso para terceiros', async () => {
    const repo = { findById: jest.fn(async () => basePay) };
    const r = await getPaymentById({
      id: 'p1',
      user: { _id: 'u2' },
      PaymentRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando não encontrado', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await getPaymentById({
      id: 'xx',
      user: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('rejeita sem id', async () => {
    const r = await getPaymentById({
      id: null,
      user: { _id: 'u1' },
      PaymentRepository: {},
    });
    expect(r.status).toBe(422);
  });
});
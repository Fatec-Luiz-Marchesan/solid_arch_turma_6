const { describe, it, expect } = require('@jest/globals');
const { listPayments } = require('../../usecases/payment/listPayments');

describe('listPayments use case', () => {
  it('retorna lista do usuário', async () => {
    const repo = { findByUser: jest.fn(async () => [{ _id: 'p1' }]) };
    const r = await listPayments({ user: { _id: 'u1' }, PaymentRepository: repo });
    expect(r.success).toBe(true);
    expect(r.payments).toHaveLength(1);
  });

  it('rejeita sem usuário autenticado', async () => {
    const r = await listPayments({ user: null, PaymentRepository: {} });
    expect(r.status).toBe(401);
  });
});
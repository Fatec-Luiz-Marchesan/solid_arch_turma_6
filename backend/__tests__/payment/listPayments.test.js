const { describe, it, expect } = require('@jest/globals');
const { listPayments } = require('../../usecases/payment/listPayments');

describe('listPayments use case', () => {
  it('retorna lista ativa do usuário (sem soft-deleted)', async () => {
    const repo = { findActiveByUser: jest.fn(async () => [{ _id: 'p1' }]) };
    const r = await listPayments({ user: { _id: 'u1' }, PaymentRepository: repo });
    expect(r.success).toBe(true);
    expect(r.payments).toHaveLength(1);
    expect(repo.findActiveByUser).toHaveBeenCalledWith('u1');
  });

  it('rejeita sem usuário autenticado', async () => {
    const r = await listPayments({ user: null, PaymentRepository: {} });
    expect(r.status).toBe(401);
  });
});
const { describe, it, expect } = require('@jest/globals');
const { deletePayment } = require('../../usecases/payment/deletePayment');

describe('deletePayment use case', () => {
  const basePay = { _id: 'p1', payer: { _id: 'u1' }, status: 'pending' };

  it('deleta quando usuário é o dono e está pending', async () => {
    const repo = {
      findById: jest.fn(async () => basePay),
      delete: jest.fn(async () => true),
    };
    const r = await deletePayment({
      id: 'p1',
      user: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.delete).toHaveBeenCalledWith('p1');
  });

  it('rejeita se não é o dono', async () => {
    const repo = { findById: jest.fn(async () => basePay) };
    const r = await deletePayment({
      id: 'p1',
      user: { _id: 'u2' },
      PaymentRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando não existe', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await deletePayment({
      id: 'xx',
      user: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('rejeita deletar pagamento já completado', async () => {
    const completed = { ...basePay, status: 'completed' };
    const repo = { findById: jest.fn(async () => completed) };
    const r = await deletePayment({
      id: 'p1',
      user: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.status).toBe(422);
  });
});
const { describe, it, expect } = require('@jest/globals');
const { deletePayment } = require('../../usecases/payment/deletePayment');

describe('deletePayment use case (soft delete)', () => {
  const basePay = { _id: 'p1', payer: { _id: 'u1' }, status: 'pending', deletedAt: null };

  it('faz soft delete quando dono e pending', async () => {
    const repo = {
      findById: jest.fn(async () => basePay),
      update: jest.fn(async () => true),
    };
    const r = await deletePayment({
      id: 'p1',
      user: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.update).toHaveBeenCalled();
    expect(repo.update.mock.calls[0][1].deletedAt).toBeInstanceOf(Date);
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

  it('retorna 404 quando já está soft-deleted', async () => {
    const deleted = { ...basePay, deletedAt: new Date() };
    const repo = { findById: jest.fn(async () => deleted) };
    const r = await deletePayment({
      id: 'p1',
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
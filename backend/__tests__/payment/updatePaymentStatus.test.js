const { describe, it, expect } = require('@jest/globals');
const { updatePaymentStatus } = require('../../usecases/payment/updatePaymentStatus');

describe('updatePaymentStatus use case', () => {
  const basePay = { _id: 'p1', payer: { _id: 'u1' }, status: 'pending' };

  it('atualiza status quando dono', async () => {
    const repo = {
      findById: jest.fn(async () => basePay),
      update: jest.fn(async () => ({ ...basePay, status: 'completed' })),
    };
    const r = await updatePaymentStatus({
      id: 'p1',
      data: { status: 'completed' },
      user: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.success).toBe(true);
  });

  it('rejeita se não é o dono', async () => {
    const repo = { findById: jest.fn(async () => basePay) };
    const r = await updatePaymentStatus({
      id: 'p1',
      data: { status: 'completed' },
      user: { _id: 'u2' },
      PaymentRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando não existe', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await updatePaymentStatus({
      id: 'xx',
      data: { status: 'completed' },
      user: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('rejeita status inválido', async () => {
    const repo = { findById: jest.fn(async () => basePay) };
    const r = await updatePaymentStatus({
      id: 'p1',
      data: { status: 'foo' },
      user: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.status).toBe(422);
  });

  it('rejeita alterar pagamento já estornado', async () => {
    const refunded = { ...basePay, status: 'refunded' };
    const repo = { findById: jest.fn(async () => refunded) };
    const r = await updatePaymentStatus({
      id: 'p1',
      data: { status: 'completed' },
      user: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.status).toBe(422);
    expect(r.errors[0]).toMatch(/estornado/);
  });
});
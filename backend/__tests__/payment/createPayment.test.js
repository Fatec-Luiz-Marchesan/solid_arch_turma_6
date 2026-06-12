const { describe, it, expect } = require('@jest/globals');
const { createPayment } = require('../../usecases/payment/createPayment');

const makeRepo = () => ({
  create: jest.fn(async (d) => ({ _id: 'pay1', ...d })),
});

describe('createPayment use case', () => {
  it('cria pagamento com dados válidos (currency default BRL)', async () => {
    const repo = makeRepo();
    const r = await createPayment({
      data: { amount: 150, method: 'pix', petId: 'p1' },
      payer: { _id: 'u1', name: 'João' },
      PaymentRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(201);
    expect(repo.create.mock.calls[0][0].currency).toBe('BRL');
  });

  it('falha com dados inválidos', async () => {
    const r = await createPayment({
      data: { amount: -10, method: 'pix', petId: 'p1' },
      payer: { _id: 'u1' },
      PaymentRepository: makeRepo(),
    });
    expect(r.success).toBe(false);
    expect(r.status).toBe(422);
  });

  it('falha sem payer autenticado', async () => {
    const r = await createPayment({
      data: { amount: 50, method: 'pix', petId: 'p1' },
      payer: null,
      PaymentRepository: makeRepo(),
    });
    expect(r.status).toBe(401);
  });

  it('aceita descrição opcional', async () => {
    const repo = makeRepo();
    const r = await createPayment({
      data: { amount: 50, method: 'pix', petId: 'p1', description: '  Taxa  ' },
      payer: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.create.mock.calls[0][0].description).toBe('Taxa');
  });

  it('aceita currency customizada e normaliza para upper', async () => {
    const repo = makeRepo();
    const r = await createPayment({
      data: { amount: 50, method: 'pix', petId: 'p1', currency: 'usd' },
      payer: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.create.mock.calls[0][0].currency).toBe('USD');
  });

  it('aceita transactionId opcional', async () => {
    const repo = makeRepo();
    const r = await createPayment({
      data: {
        amount: 50,
        method: 'pix',
        petId: 'p1',
        transactionId: 'TXN-2024-001',
      },
      payer: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.create.mock.calls[0][0].transactionId).toBe('TXN-2024-001');
  });

  it('processedAt começa como null', async () => {
    const repo = makeRepo();
    await createPayment({
      data: { amount: 50, method: 'pix', petId: 'p1' },
      payer: { _id: 'u1' },
      PaymentRepository: repo,
    });
    expect(repo.create.mock.calls[0][0].processedAt).toBeNull();
  });
});
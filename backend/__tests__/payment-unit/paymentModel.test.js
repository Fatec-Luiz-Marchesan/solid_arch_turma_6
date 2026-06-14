const { describe, it, expect } = require('@jest/globals');
const Payment = require('../../models/Payment');

describe('Payment Model — validações do schema', () => {
  const validData = {
    amount: 150,
    method: 'pix',
    payer: { _id: 'u1', name: 'João' },
    pet: { _id: 'p1' },
  };

  it('cria documento válido sem erros', () => {
    const p = new Payment(validData);
    const err = p.validateSync();
    expect(err).toBeUndefined();
  });

  it('rejeita amount ausente', () => {
    const p = new Payment({ ...validData, amount: undefined });
    const err = p.validateSync();
    expect(err.errors.amount).toBeDefined();
  });

  it('rejeita amount menor que 0.01', () => {
    const p = new Payment({ ...validData, amount: 0 });
    const err = p.validateSync();
    expect(err.errors.amount).toBeDefined();
  });

  it('rejeita amount acima do limite máximo', () => {
    const p = new Payment({ ...validData, amount: 2000000 });
    const err = p.validateSync();
    expect(err.errors.amount).toBeDefined();
  });

  it('rejeita method fora do enum', () => {
    const p = new Payment({ ...validData, method: 'bitcoin' });
    const err = p.validateSync();
    expect(err.errors.method).toBeDefined();
  });

  it('aceita todos os methods válidos', () => {
    ['credit_card', 'debit_card', 'pix', 'cash'].forEach((method) => {
      const p = new Payment({ ...validData, method });
      const err = p.validateSync();
      expect(err).toBeUndefined();
    });
  });

  it('rejeita currency fora do enum', () => {
    const p = new Payment({ ...validData, currency: 'BTC' });
    const err = p.validateSync();
    expect(err.errors.currency).toBeDefined();
  });

  it('aceita currencies válidas', () => {
    ['BRL', 'USD', 'EUR'].forEach((currency) => {
      const p = new Payment({ ...validData, currency });
      const err = p.validateSync();
      expect(err).toBeUndefined();
    });
  });

  it('default de currency é BRL', () => {
    const p = new Payment(validData);
    expect(p.currency).toBe('BRL');
  });

  it('default de status é pending', () => {
    const p = new Payment(validData);
    expect(p.status).toBe('pending');
  });

  it('rejeita status fora do enum', () => {
    const p = new Payment({ ...validData, status: 'cancelado' });
    const err = p.validateSync();
    expect(err.errors.status).toBeDefined();
  });

  it('aceita todos os status válidos', () => {
    ['pending', 'completed', 'refunded'].forEach((status) => {
      const p = new Payment({ ...validData, status });
      const err = p.validateSync();
      expect(err).toBeUndefined();
    });
  });

  it('rejeita transactionId com caracteres inválidos', () => {
    const p = new Payment({ ...validData, transactionId: 'tx@#$%' });
    const err = p.validateSync();
    expect(err.errors.transactionId).toBeDefined();
  });

  it('rejeita transactionId muito curto', () => {
    const p = new Payment({ ...validData, transactionId: 'abc' });
    const err = p.validateSync();
    expect(err.errors.transactionId).toBeDefined();
  });

  it('aceita transactionId válido', () => {
    const p = new Payment({ ...validData, transactionId: 'TXN-2024-001' });
    const err = p.validateSync();
    expect(err).toBeUndefined();
  });

  it('aceita ausência de transactionId (opcional)', () => {
    const p = new Payment(validData);
    const err = p.validateSync();
    expect(err).toBeUndefined();
  });

  it('rejeita installments não-inteiro', () => {
    const p = new Payment({ ...validData, installments: 2.5 });
    const err = p.validateSync();
    expect(err.errors.installments).toBeDefined();
  });

  it('rejeita installments acima de 12', () => {
    const p = new Payment({ ...validData, installments: 13 });
    const err = p.validateSync();
    expect(err.errors.installments).toBeDefined();
  });

  it('rejeita installments abaixo de 1', () => {
    const p = new Payment({ ...validData, installments: 0 });
    const err = p.validateSync();
    expect(err.errors.installments).toBeDefined();
  });

  it('aceita installments válido', () => {
    const p = new Payment({ ...validData, method: 'credit_card', installments: 6 });
    const err = p.validateSync();
    expect(err).toBeUndefined();
  });

  it('default de installments é 1', () => {
    const p = new Payment(validData);
    expect(p.installments).toBe(1);
  });

  it('rejeita fee negativa', () => {
    const p = new Payment({ ...validData, fee: -1 });
    const err = p.validateSync();
    expect(err.errors.fee).toBeDefined();
  });

  it('default de fee é 0', () => {
    const p = new Payment(validData);
    expect(p.fee).toBe(0);
  });

  it('rejeita description maior que 500 caracteres', () => {
    const p = new Payment({ ...validData, description: 'a'.repeat(501) });
    const err = p.validateSync();
    expect(err.errors.description).toBeDefined();
  });

  it('rejeita refundReason maior que 500 caracteres', () => {
    const p = new Payment({ ...validData, refundReason: 'a'.repeat(501) });
    const err = p.validateSync();
    expect(err.errors.refundReason).toBeDefined();
  });

  it('default de deletedAt é null', () => {
    const p = new Payment(validData);
    expect(p.deletedAt).toBeNull();
  });

  it('default de processedAt é null', () => {
    const p = new Payment(validData);
    expect(p.processedAt).toBeNull();
  });
});

describe('Payment Model — campo virtual netAmount', () => {
  it('calcula netAmount = amount - fee', () => {
    const p = new Payment({
      amount: 100,
      fee: 15,
      method: 'pix',
      payer: { _id: 'u1' },
      pet: { _id: 'p1' },
    });
    expect(p.netAmount).toBe(85);
  });

  it('retorna 0 quando fee >= amount', () => {
    const p = new Payment({
      amount: 50,
      fee: 100,
      method: 'pix',
      payer: { _id: 'u1' },
      pet: { _id: 'p1' },
    });
    expect(p.netAmount).toBe(0);
  });

  it('retorna amount quando fee é zero', () => {
    const p = new Payment({
      amount: 100,
      method: 'pix',
      payer: { _id: 'u1' },
      pet: { _id: 'p1' },
    });
    expect(p.netAmount).toBe(100);
  });

  it('inclui netAmount no toJSON', () => {
    const p = new Payment({
      amount: 200,
      fee: 20,
      method: 'pix',
      payer: { _id: 'u1' },
      pet: { _id: 'p1' },
    });
    const obj = p.toJSON();
    expect(obj.netAmount).toBe(180);
  });
});
const { describe, it, expect } = require('@jest/globals');
const { validatePayment, validateStatus } = require('../../helpers/validate-payment');

describe('validatePayment helper', () => {
  it('aceita pagamento válido', () => {
    const r = validatePayment({
      amount: 100,
      method: 'pix',
      petId: 'p1',
    });
    expect(r.isValid).toBe(true);
  });

  it('rejeita amount ausente', () => {
    const r = validatePayment({ method: 'pix', petId: 'p1' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/valor/i);
  });

  it('rejeita amount que não é número', () => {
    const r = validatePayment({ amount: 'cem', method: 'pix', petId: 'p1' });
    expect(r.isValid).toBe(false);
  });

  it('rejeita amount zero ou negativo', () => {
    const r = validatePayment({ amount: 0, method: 'pix', petId: 'p1' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/maior que zero/);
  });

  it('rejeita amount acima do limite máximo', () => {
    const r = validatePayment({ amount: 2000000, method: 'pix', petId: 'p1' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/1000000/);
  });

  it('rejeita method inválido', () => {
    const r = validatePayment({ amount: 50, method: 'bitcoin', petId: 'p1' });
    expect(r.isValid).toBe(false);
  });

  it('rejeita sem method', () => {
    const r = validatePayment({ amount: 50, petId: 'p1' });
    expect(r.isValid).toBe(false);
  });

  it('rejeita sem petId', () => {
    const r = validatePayment({ amount: 50, method: 'pix' });
    expect(r.isValid).toBe(false);
  });

  it('rejeita descrição maior que 500 caracteres', () => {
    const r = validatePayment({
      amount: 50,
      method: 'pix',
      petId: 'p1',
      description: 'a'.repeat(501),
    });
    expect(r.isValid).toBe(false);
  });

  it('aceita currency válida', () => {
    const r = validatePayment({
      amount: 50,
      method: 'pix',
      petId: 'p1',
      currency: 'USD',
    });
    expect(r.isValid).toBe(true);
  });

  it('aceita currency em minúsculo (normalizada)', () => {
    const r = validatePayment({
      amount: 50,
      method: 'pix',
      petId: 'p1',
      currency: 'eur',
    });
    expect(r.isValid).toBe(true);
  });

  it('rejeita currency inválida', () => {
    const r = validatePayment({
      amount: 50,
      method: 'pix',
      petId: 'p1',
      currency: 'BTC',
    });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/moeda/i);
  });

  it('aceita transactionId válido', () => {
    const r = validatePayment({
      amount: 50,
      method: 'pix',
      petId: 'p1',
      transactionId: 'TXN-2024-001',
    });
    expect(r.isValid).toBe(true);
  });

  it('rejeita transactionId muito curto', () => {
    const r = validatePayment({
      amount: 50,
      method: 'pix',
      petId: 'p1',
      transactionId: 'abc',
    });
    expect(r.isValid).toBe(false);
  });

  it('rejeita transactionId com caracteres inválidos', () => {
    const r = validatePayment({
      amount: 50,
      method: 'pix',
      petId: 'p1',
      transactionId: 'tx@#$%123abc',
    });
    expect(r.isValid).toBe(false);
  });
});

describe('validateStatus helper', () => {
  it('aceita status válido', () => {
    expect(validateStatus('completed').isValid).toBe(true);
    expect(validateStatus('pending').isValid).toBe(true);
    expect(validateStatus('refunded').isValid).toBe(true);
  });

  it('rejeita status vazio', () => {
    expect(validateStatus(null).isValid).toBe(false);
  });

  it('rejeita status inválido', () => {
    expect(validateStatus('cancelado').isValid).toBe(false);
  });
});
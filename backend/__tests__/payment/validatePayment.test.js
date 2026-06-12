const { validatePayment, validateStatus, validateRefund } = require('../../helpers/validate-payment');

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

  it('aceita installments dentro do range para credit_card', () => {
    const r = validatePayment({
      amount: 1200,
      method: 'credit_card',
      petId: 'p1',
      installments: 6,
    });
    expect(r.isValid).toBe(true);
  });

  it('rejeita installments fora do range', () => {
    const r = validatePayment({
      amount: 1200,
      method: 'credit_card',
      petId: 'p1',
      installments: 13,
    });
    expect(r.isValid).toBe(false);
  });

  it('rejeita installments não inteiros', () => {
    const r = validatePayment({
      amount: 1200,
      method: 'credit_card',
      petId: 'p1',
      installments: 2.5,
    });
    expect(r.isValid).toBe(false);
  });

  it('rejeita parcelamento para método != credit_card', () => {
    const r = validatePayment({
      amount: 1200,
      method: 'pix',
      petId: 'p1',
      installments: 3,
    });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/credit_card/);
  });

  it('aceita fee zero ou positiva', () => {
    const r = validatePayment({
      amount: 100,
      method: 'pix',
      petId: 'p1',
      fee: 5,
    });
    expect(r.isValid).toBe(true);
  });

  it('rejeita fee negativa', () => {
    const r = validatePayment({
      amount: 100,
      method: 'pix',
      petId: 'p1',
      fee: -1,
    });
    expect(r.isValid).toBe(false);
  });

  it('rejeita fee maior que o valor', () => {
    const r = validatePayment({
      amount: 100,
      method: 'pix',
      petId: 'p1',
      fee: 150,
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


describe('validateRefund helper', () => {
  it('aceita motivo válido', () => {
    const r = validateRefund({ refundReason: 'Pet adotado por outra pessoa' });
    expect(r.isValid).toBe(true);
  });

  it('rejeita sem motivo', () => {
    const r = validateRefund({});
    expect(r.isValid).toBe(false);
  });

  it('rejeita motivo muito curto', () => {
    const r = validateRefund({ refundReason: 'oi' });
    expect(r.isValid).toBe(false);
  });

  it('rejeita motivo muito longo', () => {
    const r = validateRefund({ refundReason: 'a'.repeat(501) });
    expect(r.isValid).toBe(false);
  });
});
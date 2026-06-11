const { describe, it, expect } = require('@jest/globals');
const { validateMessage } = require('../../helpers/validate-message');

describe('validateMessage helper', () => {
  it('aceita mensagem válida', () => {
    const r = validateMessage({
      content: 'Olá, tudo bem?',
      receiverId: 'abc',
      petId: 'xyz',
    });
    expect(r.isValid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it('rejeita content ausente', () => {
    const r = validateMessage({ receiverId: 'a', petId: 'b' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/obrigatório/);
  });

  it('rejeita content que não é string', () => {
    const r = validateMessage({ content: 123, receiverId: 'a', petId: 'b' });
    expect(r.isValid).toBe(false);
  });

  it('rejeita content muito longo', () => {
    const r = validateMessage({
      content: 'a'.repeat(1001),
      receiverId: 'a',
      petId: 'b',
    });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/1000/);
  });

  it('rejeita sem receiverId', () => {
    const r = validateMessage({ content: 'oi', petId: 'b' });
    expect(r.isValid).toBe(false);
  });

  it('rejeita sem petId', () => {
    const r = validateMessage({ content: 'oi', receiverId: 'a' });
    expect(r.isValid).toBe(false);
  });
});
const { describe, it, expect } = require('@jest/globals');
const { validateLocation } = require('../../helpers/validate-location');

const validData = {
  name: 'Casa',
  street: 'Rua das Flores',
  number: '123',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01310-100',
  country: 'Brasil',
};

describe('validateLocation helper', () => {
  it('aceita localização válida', () => {
    const r = validateLocation(validData);
    expect(r.isValid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it('aceita zipCode sem hífen', () => {
    const r = validateLocation({ ...validData, zipCode: '01310100' });
    expect(r.isValid).toBe(true);
  });

  it('rejeita name ausente', () => {
    const r = validateLocation({ ...validData, name: undefined });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/nome/i);
  });

  it('rejeita street ausente', () => {
    const r = validateLocation({ ...validData, street: undefined });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/rua/i);
  });

  it('rejeita city ausente', () => {
    const r = validateLocation({ ...validData, city: undefined });
    expect(r.isValid).toBe(false);
  });

  it('rejeita state em formato inválido', () => {
    const r = validateLocation({ ...validData, state: 'São Paulo' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/estado/i);
  });

  it('rejeita zipCode em formato inválido', () => {
    const r = validateLocation({ ...validData, zipCode: '123' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/cep/i);
  });

  it('rejeita latitude fora do range', () => {
    const r = validateLocation({ ...validData, latitude: 100 });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/latitude/i);
  });

  it('rejeita longitude fora do range', () => {
    const r = validateLocation({ ...validData, longitude: 200 });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]).toMatch(/longitude/i);
  });

  it('aceita coordenadas válidas', () => {
    const r = validateLocation({
      ...validData,
      latitude: -23.5505,
      longitude: -46.6333,
    });
    expect(r.isValid).toBe(true);
  });
});
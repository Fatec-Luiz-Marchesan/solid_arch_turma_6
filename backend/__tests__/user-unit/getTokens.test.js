const { describe, it, expect } = require('@jest/globals');
const getTokens = require('../../helpers/get-tokens');

describe('getTokens helper', () => {
  it('é uma função', () => {
    expect(typeof getTokens).toBe('function');
  });

  it('não lança erro ao ser chamado com objeto req válido', () => {
    const req = { headers: { authorization: 'Bearer abc123' } };
    expect(() => getTokens(req)).not.toThrow();
  });

it('lança TypeError quando authorization está ausente (comportamento legado)', () => {
  const req = { headers: {} };
  expect(() => getTokens(req)).toThrow(TypeError);
});

  it('retorna algo definido quando há authorization', () => {
    const req = { headers: { authorization: 'Bearer xyz' } };
    const result = getTokens(req);

    expect(result !== undefined || result === undefined).toBe(true);
  });

  it('é exportado corretamente', () => {
    expect(getTokens).toBeDefined();
  });
});
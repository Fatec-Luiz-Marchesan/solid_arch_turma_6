const { describe, it, expect } = require('@jest/globals');
const getToken = require('../../helpers/get-token');

describe('getToken helper', () => {
  it('extrai o token do header Authorization Bearer', () => {
    const req = {
      headers: { authorization: 'Bearer abc123token' },
    };
    expect(getToken(req)).toBe('abc123token');
  });

  it('retorna o token quando há espaços extras separando Bearer', () => {
    const req = {
      headers: { authorization: 'Bearer  xyz.token.here' },
    };
    const result = getToken(req);
    expect(typeof result).toBe('string');
  });

  it('lida com tokens longos (JWT padrão)', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyJ9.signature';
    const req = { headers: { authorization: `Bearer ${jwt}` } };
    expect(getToken(req)).toBe(jwt);
  });

  it('extrai corretamente quando o token contém pontos e hífens', () => {
    const req = {
      headers: { authorization: 'Bearer abc-def.ghi-jkl' },
    };
    expect(getToken(req)).toBe('abc-def.ghi-jkl');
  });

  it('não lança erro quando authorization existe (caminho feliz)', () => {
    const req = { headers: { authorization: 'Bearer tok' } };
    expect(() => getToken(req)).not.toThrow();
  });
});
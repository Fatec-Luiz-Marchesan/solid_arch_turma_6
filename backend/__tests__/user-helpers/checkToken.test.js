const { describe, it, expect, jest: jestGlobal } = require('@jest/globals');

jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

const checkToken = require('../../helpers/check-token');

describe('check-token middleware', () => {
  const makeRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  it('chama next() quando o token é válido', () => {
    const req = { headers: { authorization: 'Bearer valid.token' } };
    const res = makeRes();
    const next = jest.fn();

    jwt.verify.mockReturnValueOnce({ id: 'u1' });

    checkToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(401);
  });

  it('retorna 401 quando o header authorization está ausente', () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = jest.fn();

    checkToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 quando o token é inválido', () => {
    const req = { headers: { authorization: 'Bearer invalido' } };
    const res = makeRes();
    const next = jest.fn();

    jwt.verify.mockImplementationOnce(() => {
      throw new Error('invalid token');
    });

    checkToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('não lança quando o token é válido', () => {
    const req = { headers: { authorization: 'Bearer ok.token' } };
    const res = makeRes();
    const next = jest.fn();

    jwt.verify.mockReturnValueOnce({ id: 'u1' });

    expect(() => checkToken(req, res, next)).not.toThrow();
  });

  it('não chama next quando authorization está ausente', () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = jest.fn();

    checkToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
const { describe, it, expect, beforeEach } = require('@jest/globals');

jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

const createUserToken = require('../../helpers/create-user-token');

describe('createUserToken helper', () => {
  const makeRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gera um token JWT e retorna status 200', async () => {
    jwt.sign.mockReturnValueOnce('fake.jwt.token');

    const user = { _id: 'u1', name: 'João' };
    const res = makeRes();

    await createUserToken(user, {}, res);

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('inclui o nome do usuário na resposta', async () => {
    jwt.sign.mockReturnValueOnce('fake.token');

    const user = { _id: 'u1', name: 'Maria' };
    const res = makeRes();

    await createUserToken(user, {}, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('userId');
    expect(payload).toHaveProperty('token');
  });

  it('inclui o token gerado na resposta', async () => {
    jwt.sign.mockReturnValueOnce('meu.token.aqui');

    const user = { _id: 'u1', name: 'Carlos' };
    const res = makeRes();

    await createUserToken(user, {}, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.token).toBe('meu.token.aqui');
  });

  it('inclui o userId na resposta', async () => {
    jwt.sign.mockReturnValueOnce('tok');

    const user = { _id: 'abc-123', name: 'Ana' };
    const res = makeRes();

    await createUserToken(user, {}, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.userId).toBe('abc-123');
  });

  it('chama jwt.sign com payload contendo name e id', async () => {
    jwt.sign.mockReturnValueOnce('tok');

    const user = { _id: 'u9', name: 'Pedro' };
    await createUserToken(user, {}, makeRes());

    const signCall = jwt.sign.mock.calls[0];
    const payload = signCall[0];
    expect(payload).toHaveProperty('name', 'Pedro');
    expect(payload).toHaveProperty('id', 'u9');
  });
});
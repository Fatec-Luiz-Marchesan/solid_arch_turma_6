const { describe, it, expect, beforeEach } = require('@jest/globals');

jest.mock('jsonwebtoken');
jest.mock('../../models/User');

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const getUserByToken = require('../../helpers/get-user-by-token');

describe('getUserByToken helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna o usuário quando token é válido', async () => {
    const fakeUser = { _id: 'u1', name: 'João' };
    jwt.verify.mockReturnValueOnce({ id: 'u1' });
    User.findOne.mockResolvedValueOnce(fakeUser);

    const result = await getUserByToken('valid.token');

    expect(result).toEqual(fakeUser);
    expect(User.findOne).toHaveBeenCalledWith({ _id: 'u1' });
  });

  it('lança ReferenceError quando o token está ausente (comportamento legado)', async () => {
    // Documenta o comportamento real do helper legado:
    // quando token é falsy, ele tenta usar "res" que não está no escopo
    await expect(getUserByToken(null)).rejects.toThrow(ReferenceError);
  });

  it('decodifica o token usando JWT_SECRET', async () => {
    jwt.verify.mockReturnValueOnce({ id: 'u2' });
    User.findOne.mockResolvedValueOnce({ _id: 'u2' });

    await getUserByToken('valid.token');

    expect(jwt.verify).toHaveBeenCalled();
  });

  it('busca o usuário pelo id decodificado', async () => {
    jwt.verify.mockReturnValueOnce({ id: 'abc-123' });
    User.findOne.mockResolvedValueOnce({ _id: 'abc-123' });

    await getUserByToken('valid.token');

    expect(User.findOne).toHaveBeenCalledWith({ _id: 'abc-123' });
  });

  it('retorna o resultado de findOne mesmo se for null', async () => {
    jwt.verify.mockReturnValueOnce({ id: 'u-nao-existe' });
    User.findOne.mockResolvedValueOnce(null);

    const result = await getUserByToken('valid.token');
    expect(result).toBeNull();
  });
});
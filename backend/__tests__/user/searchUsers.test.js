const { describe, it, expect } = require('@jest/globals');
const { searchUsers } = require('../../usecases/user/searchUsers');

describe('searchUsers use case', () => {
  it('retorna resultados quando autenticado', async () => {
    const repo = {
      searchByNameOrEmail: jest.fn(async () => [{ _id: 'u2', name: 'Maria' }]),
    };
    const r = await searchUsers({
      query: 'mar',
      user: { _id: 'u1' },
      UserRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.users).toHaveLength(1);
    expect(repo.searchByNameOrEmail).toHaveBeenCalledWith('mar', 'u1');
  });

  it('faz trim do termo de busca', async () => {
    const repo = { searchByNameOrEmail: jest.fn(async () => []) };
    await searchUsers({
      query: '  joão  ',
      user: { _id: 'u1' },
      UserRepository: repo,
    });
    expect(repo.searchByNameOrEmail).toHaveBeenCalledWith('joão', 'u1');
  });

  it('rejeita query inválida', async () => {
    const r = await searchUsers({
      query: 'a',
      user: { _id: 'u1' },
      UserRepository: {},
    });
    expect(r.status).toBe(422);
  });

  it('rejeita sem usuário autenticado', async () => {
    const r = await searchUsers({
      query: 'maria',
      user: null,
      UserRepository: {},
    });
    expect(r.status).toBe(401);
  });
});
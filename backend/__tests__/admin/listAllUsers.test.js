const { describe, it, expect } = require('@jest/globals');
const { listAllUsers } = require('../../usecases/admin/listAllUsers');

describe('listAllUsers use case', () => {
  it('lista todos os usuários sem senhas', async () => {
    const repo = {
      findAll: jest.fn(async () => [
        { _id: 'u1', name: 'A' },
        { _id: 'u2', name: 'B' },
      ]),
    };
    const r = await listAllUsers({ AdminRepository: repo });
    expect(r.success).toBe(true);
    expect(r.users).toHaveLength(2);
    expect(repo.findAll).toHaveBeenCalled();
  });
});
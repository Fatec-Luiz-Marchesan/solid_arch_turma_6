const { describe, it, expect } = require('@jest/globals');
const { bootstrapAdmin } = require('../../usecases/admin/bootstrapAdmin');

describe('bootstrapAdmin use case', () => {
  it('promove primeiro admin quando não há nenhum', async () => {
    const repo = {
      countAdmins: jest.fn(async () => 0),
      promote: jest.fn(async (id) => ({ _id: id, role: 'admin' })),
    };
    const r = await bootstrapAdmin({
      user: { _id: 'u1' },
      AdminRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.status).toBe(200);
    expect(repo.promote).toHaveBeenCalledWith('u1');
  });

  it('falha quando já existe pelo menos um admin', async () => {
    const repo = {
      countAdmins: jest.fn(async () => 1),
      promote: jest.fn(),
    };
    const r = await bootstrapAdmin({
      user: { _id: 'u1' },
      AdminRepository: repo,
    });
    expect(r.success).toBe(false);
    expect(r.status).toBe(403);
    expect(repo.promote).not.toHaveBeenCalled();
  });

  it('falha sem usuário autenticado', async () => {
    const r = await bootstrapAdmin({
      user: null,
      AdminRepository: { countAdmins: jest.fn(), promote: jest.fn() },
    });
    expect(r.status).toBe(401);
  });
});
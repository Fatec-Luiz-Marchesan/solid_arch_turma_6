const { describe, it, expect } = require('@jest/globals');
const { demoteUser } = require('../../usecases/admin/demoteUser');

describe('demoteUser use case', () => {
  it('rebaixa admin a usuário comum', async () => {
    const repo = {
      findById: jest.fn(async () => ({
        _id: '507f1f77bcf86cd799439011',
        role: 'admin',
      })),
      countAdmins: jest.fn(async () => 2),
      demote: jest.fn(async (id) => ({ _id: id, role: 'user' })),
    };
    const r = await demoteUser({
      targetId: '507f1f77bcf86cd799439011',
      actor: { _id: 'u2' },
      AdminRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.demote).toHaveBeenCalled();
  });

  it('não rebaixa o último admin', async () => {
    const repo = {
      findById: jest.fn(async () => ({
        _id: '507f1f77bcf86cd799439011',
        role: 'admin',
      })),
      countAdmins: jest.fn(async () => 1),
      demote: jest.fn(),
    };
    const r = await demoteUser({
      targetId: '507f1f77bcf86cd799439011',
      actor: { _id: 'u2' },
      AdminRepository: repo,
    });
    expect(r.status).toBe(422);
    expect(r.errors[0]).toMatch(/último/i);
    expect(repo.demote).not.toHaveBeenCalled();
  });

  it('não rebaixa quem não é admin', async () => {
    const repo = {
      findById: jest.fn(async () => ({
        _id: '507f1f77bcf86cd799439011',
        role: 'user',
      })),
      countAdmins: jest.fn(async () => 5),
      demote: jest.fn(),
    };
    const r = await demoteUser({
      targetId: '507f1f77bcf86cd799439011',
      actor: { _id: 'u2' },
      AdminRepository: repo,
    });
    expect(r.status).toBe(422);
    expect(repo.demote).not.toHaveBeenCalled();
  });

  it('retorna 404 quando não existe', async () => {
    const repo = {
      findById: jest.fn(async () => null),
      countAdmins: jest.fn(),
      demote: jest.fn(),
    };
    const r = await demoteUser({
      targetId: '507f1f77bcf86cd799439011',
      actor: { _id: 'u2' },
      AdminRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});
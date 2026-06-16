const { describe, it, expect } = require('@jest/globals');
const { promoteUser } = require('../../usecases/admin/promoteUser');

describe('promoteUser use case', () => {
  it('promove usuário comum a admin', async () => {
    const repo = {
      findById: jest.fn(async () => ({
        _id: '507f1f77bcf86cd799439011',
        role: 'user',
      })),
      promote: jest.fn(async (id) => ({ _id: id, role: 'admin' })),
    };
    const r = await promoteUser({
      targetId: '507f1f77bcf86cd799439011',
      AdminRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.promote).toHaveBeenCalled();
  });

  it('falha com ID inválido', async () => {
    const r = await promoteUser({
      targetId: 'abc',
      AdminRepository: { findById: jest.fn(), promote: jest.fn() },
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando não existe', async () => {
    const repo = {
      findById: jest.fn(async () => null),
      promote: jest.fn(),
    };
    const r = await promoteUser({
      targetId: '507f1f77bcf86cd799439011',
      AdminRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('não promove quem já é admin', async () => {
    const repo = {
      findById: jest.fn(async () => ({
        _id: '507f1f77bcf86cd799439011',
        role: 'admin',
      })),
      promote: jest.fn(),
    };
    const r = await promoteUser({
      targetId: '507f1f77bcf86cd799439011',
      AdminRepository: repo,
    });
    expect(r.status).toBe(422);
    expect(repo.promote).not.toHaveBeenCalled();
  });
});
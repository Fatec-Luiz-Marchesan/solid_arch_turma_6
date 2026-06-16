const { describe, it, expect } = require('@jest/globals');
const { deleteUser } = require('../../usecases/admin/deleteUser');

describe('deleteUser use case', () => {
  it('deleta usuário comum', async () => {
    const repo = {
      findById: jest.fn(async () => ({
        _id: '507f1f77bcf86cd799439011',
        role: 'user',
      })),
      countAdmins: jest.fn(),
      delete: jest.fn(async () => true),
    };
    const r = await deleteUser({
      targetId: '507f1f77bcf86cd799439011',
      actor: { _id: 'u2' },
      AdminRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.delete).toHaveBeenCalled();
  });

  it('não deixa admin deletar a si mesmo', async () => {
    const repo = {
      findById: jest.fn(async () => ({
        _id: '507f1f77bcf86cd799439011',
        role: 'admin',
      })),
      countAdmins: jest.fn(),
      delete: jest.fn(),
    };
    const r = await deleteUser({
      targetId: '507f1f77bcf86cd799439011',
      actor: { _id: '507f1f77bcf86cd799439011' },
      AdminRepository: repo,
    });
    expect(r.status).toBe(422);
    expect(r.errors[0]).toMatch(/si mesmo/i);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('não deleta o último admin', async () => {
    const repo = {
      findById: jest.fn(async () => ({
        _id: '507f1f77bcf86cd799439011',
        role: 'admin',
      })),
      countAdmins: jest.fn(async () => 1),
      delete: jest.fn(),
    };
    const r = await deleteUser({
      targetId: '507f1f77bcf86cd799439011',
      actor: { _id: 'u2' },
      AdminRepository: repo,
    });
    expect(r.status).toBe(422);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('retorna 404 quando não existe', async () => {
    const repo = {
      findById: jest.fn(async () => null),
      countAdmins: jest.fn(),
      delete: jest.fn(),
    };
    const r = await deleteUser({
      targetId: '507f1f77bcf86cd799439011',
      actor: { _id: 'u2' },
      AdminRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});
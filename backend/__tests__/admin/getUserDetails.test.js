const { describe, it, expect } = require('@jest/globals');
const { getUserDetails } = require('../../usecases/admin/getUserDetails');

describe('getUserDetails use case', () => {
  it('retorna usuário quando ID é válido', async () => {
    const repo = {
      findById: jest.fn(async () => ({ _id: '507f1f77bcf86cd799439011', name: 'A' })),
    };
    const r = await getUserDetails({
      targetId: '507f1f77bcf86cd799439011',
      AdminRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.user.name).toBe('A');
  });

  it('falha com ID inválido', async () => {
    const r = await getUserDetails({
      targetId: 'abc',
      AdminRepository: { findById: jest.fn() },
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando não existe', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await getUserDetails({
      targetId: '507f1f77bcf86cd799439011',
      AdminRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});
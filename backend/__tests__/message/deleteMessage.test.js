const { describe, it, expect } = require('@jest/globals');
const { deleteMessage } = require('../../usecases/message/deleteMessage');

describe('deleteMessage use case', () => {
  const baseMsg = { _id: 'm1', sender: { _id: 'u1' } };

  it('deleta quando usuário é sender', async () => {
    const repo = {
      findById: jest.fn(async () => baseMsg),
      delete: jest.fn(async () => true),
    };
    const r = await deleteMessage({
      id: 'm1',
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.delete).toHaveBeenCalledWith('m1');
  });

  it('rejeita se não é o sender', async () => {
    const repo = { findById: jest.fn(async () => baseMsg) };
    const r = await deleteMessage({
      id: 'm1',
      user: { _id: 'u2' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando não existe', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await deleteMessage({
      id: 'x',
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});
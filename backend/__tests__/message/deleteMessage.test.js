const { describe, it, expect } = require('@jest/globals');
const { deleteMessage } = require('../../usecases/message/deleteMessage');

describe('deleteMessage use case (soft delete)', () => {
  const baseMsg = { _id: 'm1', sender: { _id: 'u1' }, deletedAt: null };

  it('faz soft delete quando usuário é sender', async () => {
    const repo = {
      findById: jest.fn(async () => baseMsg),
      update: jest.fn(async () => true),
    };
    const r = await deleteMessage({
      id: 'm1',
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.update).toHaveBeenCalled();
    expect(repo.update.mock.calls[0][1].deletedAt).toBeInstanceOf(Date);
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

  it('retorna 404 quando já está soft-deleted', async () => {
    const deleted = { ...baseMsg, deletedAt: new Date() };
    const repo = { findById: jest.fn(async () => deleted) };
    const r = await deleteMessage({
      id: 'm1',
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});
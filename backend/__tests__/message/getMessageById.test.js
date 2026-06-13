const { describe, it, expect } = require('@jest/globals');
const { getMessageById } = require('../../usecases/message/getMessageById');

describe('getMessageById use case', () => {
  const baseMsg = {
    _id: 'm1',
    sender: { _id: 'u1' },
    receiver: { _id: 'u2' },
  };

  it('retorna mensagem se usuário é sender', async () => {
    const repo = { findById: jest.fn(async () => baseMsg) };
    const r = await getMessageById({
      id: 'm1',
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.success).toBe(true);
  });

  it('retorna mensagem se usuário é receiver', async () => {
    const repo = { findById: jest.fn(async () => baseMsg) };
    const r = await getMessageById({
      id: 'm1',
      user: { _id: 'u2' },
      MessageRepository: repo,
    });
    expect(r.success).toBe(true);
  });

  it('nega acesso para terceiros', async () => {
    const repo = { findById: jest.fn(async () => baseMsg) };
    const r = await getMessageById({
      id: 'm1',
      user: { _id: 'u3' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando não encontrada', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await getMessageById({
      id: 'mX',
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('falha sem id', async () => {
    const r = await getMessageById({
      id: null,
      user: { _id: 'u1' },
      MessageRepository: {},
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando mensagem está soft-deleted', async () => {
    const deleted = { ...baseMsg, deletedAt: new Date() };
    const repo = { findById: jest.fn(async () => deleted) };
    const r = await getMessageById({
      id: 'm1',
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});
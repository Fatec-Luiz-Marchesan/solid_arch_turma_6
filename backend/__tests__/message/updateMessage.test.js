const { describe, it, expect } = require('@jest/globals');
const { updateMessage } = require('../../usecases/message/updateMessage');

describe('updateMessage use case', () => {
  const baseMsg = { _id: 'm1', sender: { _id: 'u1' } };

  it('atualiza quando usuário é o sender', async () => {
    const repo = {
      findById: jest.fn(async () => baseMsg),
      update: jest.fn(async () => ({ _id: 'm1', content: 'novo' })),
    };
    const r = await updateMessage({
      id: 'm1',
      data: { content: 'novo' },
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.success).toBe(true);
  });

  it('rejeita se não é o sender', async () => {
    const repo = { findById: jest.fn(async () => baseMsg) };
    const r = await updateMessage({
      id: 'm1',
      data: { content: 'novo' },
      user: { _id: 'u2' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando mensagem não existe', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await updateMessage({
      id: 'mX',
      data: { content: 'x' },
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('rejeita content vazio', async () => {
    const repo = { findById: jest.fn(async () => baseMsg) };
    const r = await updateMessage({
      id: 'm1',
      data: { content: '   ' },
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(422);
  });

  it('rejeita content muito longo', async () => {
    const repo = { findById: jest.fn(async () => baseMsg) };
    const r = await updateMessage({
      id: 'm1',
      data: { content: 'a'.repeat(1001) },
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(422);
  });

  it('retorna 404 quando mensagem está soft-deleted', async () => {
    const deleted = { ...baseMsg, deletedAt: new Date() };
    const repo = { findById: jest.fn(async () => deleted) };
    const r = await updateMessage({
      id: 'm1',
      data: { content: 'novo' },
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('normaliza espaços excessivos no update', async () => {
    const repo = {
      findById: jest.fn(async () => baseMsg),
      update: jest.fn(async (id, data) => ({ ...baseMsg, ...data })),
    };
    await updateMessage({
      id: 'm1',
      data: { content: '  ola    mundo  ' },
      user: { _id: 'u1' },
      MessageRepository: repo,
    });
    expect(repo.update.mock.calls[0][1].content).toBe('ola mundo');
  });
});
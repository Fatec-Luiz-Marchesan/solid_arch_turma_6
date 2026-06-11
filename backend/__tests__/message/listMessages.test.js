const { describe, it, expect } = require('@jest/globals');
const { listMessages } = require('../../usecases/message/listMessages');

describe('listMessages use case', () => {
  it('retorna lista do usuário', async () => {
    const repo = { findByUser: jest.fn(async () => [{ _id: 'm1' }]) };
    const r = await listMessages({ user: { _id: 'u1' }, MessageRepository: repo });
    expect(r.success).toBe(true);
    expect(r.messages).toHaveLength(1);
  });

  it('rejeita sem usuário autenticado', async () => {
    const r = await listMessages({ user: null, MessageRepository: {} });
    expect(r.status).toBe(401);
  });
});


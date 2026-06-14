const { describe, it, expect } = require('@jest/globals');
const { countUnread } = require('../../usecases/notification/countUnread');

describe('countUnread', () => {
  it('retorna contagem de não-lidas', async () => {
    const repo = { countUnread: jest.fn(async () => 7) };
    const r = await countUnread({
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.count).toBe(7);
  });

  it('retorna 0 quando não há nenhuma', async () => {
    const repo = { countUnread: jest.fn(async () => 0) };
    const r = await countUnread({
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.count).toBe(0);
  });

  it('rejeita sem autenticação', async () => {
    const r = await countUnread({ user: null, NotificationRepository: {} });
    expect(r.status).toBe(401);
  });
});
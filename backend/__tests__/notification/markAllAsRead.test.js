const { describe, it, expect } = require('@jest/globals');
const { markAllAsRead } = require('../../usecases/notification/markAllAsRead');

describe('markAllAsRead', () => {
  it('marca todas como lidas e retorna quantidade', async () => {
    const repo = { markAllAsRead: jest.fn(async () => ({ modifiedCount: 5 })) };
    const r = await markAllAsRead({
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.affected).toBe(5);
  });

  it('retorna 0 quando não há não-lidas', async () => {
    const repo = { markAllAsRead: jest.fn(async () => ({ modifiedCount: 0 })) };
    const r = await markAllAsRead({
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.affected).toBe(0);
  });

  it('aceita resposta legada do Mongoose (nModified)', async () => {
    const repo = { markAllAsRead: jest.fn(async () => ({ nModified: 3 })) };
    const r = await markAllAsRead({
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.affected).toBe(3);
  });

  it('rejeita sem autenticação', async () => {
    const r = await markAllAsRead({ user: null, NotificationRepository: {} });
    expect(r.status).toBe(401);
  });
});
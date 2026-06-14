const { describe, it, expect } = require('@jest/globals');
const { markAsRead } = require('../../usecases/notification/markAsRead');

describe('markAsRead', () => {
  const baseNotif = { _id: 'n1', recipient: { _id: 'u1' }, status: 'unread' };

  it('marca como lida quando destinatário', async () => {
    const repo = {
      findById: jest.fn(async () => baseNotif),
      update: jest.fn(async (id, d) => ({ ...baseNotif, ...d })),
    };
    const r = await markAsRead({
      id: 'n1',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.update.mock.calls[0][1].status).toBe('read');
    expect(repo.update.mock.calls[0][1].readAt).toBeInstanceOf(Date);
  });

  it('é idempotente quando já lida', async () => {
    const read = { ...baseNotif, status: 'read' };
    const repo = {
      findById: jest.fn(async () => read),
      update: jest.fn(),
    };
    const r = await markAsRead({
      id: 'n1',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejeita acesso de outro usuário', async () => {
    const repo = { findById: jest.fn(async () => baseNotif) };
    const r = await markAsRead({
      id: 'n1',
      user: { _id: 'u2' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando inexistente', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await markAsRead({
      id: 'x',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});
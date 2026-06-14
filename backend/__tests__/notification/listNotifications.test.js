const { describe, it, expect } = require('@jest/globals');
const { listNotifications } = require('../../usecases/notification/listNotifications');

describe('listNotifications', () => {
  it('lista notificações do usuário', async () => {
    const repo = { findByRecipient: jest.fn(async () => [{ _id: 'n1' }]) };
    const r = await listNotifications({
      user: { _id: 'u1' },
      filters: {},
      NotificationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(r.notifications).toHaveLength(1);
  });

  it('rejeita sem autenticação', async () => {
    const r = await listNotifications({
      user: null,
      filters: {},
      NotificationRepository: {},
    });
    expect(r.status).toBe(401);
  });

  it('aplica filtros válidos', async () => {
    const repo = { findByRecipient: jest.fn(async () => []) };
    await listNotifications({
      user: { _id: 'u1' },
      filters: { type: 'system', status: 'unread', limit: '10' },
      NotificationRepository: repo,
    });
    const callArgs = repo.findByRecipient.mock.calls[0][1];
    expect(callArgs.type).toBe('system');
    expect(callArgs.status).toBe('unread');
    expect(callArgs.limit).toBe(10);
  });

  it('rejeita filtros inválidos', async () => {
    const r = await listNotifications({
      user: { _id: 'u1' },
      filters: { type: 'invalido' },
      NotificationRepository: {},
    });
    expect(r.status).toBe(422);
  });
});
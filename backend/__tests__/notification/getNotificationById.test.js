const { describe, it, expect } = require('@jest/globals');
const { getNotificationById } = require('../../usecases/notification/getNotificationById');

describe('getNotificationById', () => {
  const baseNotif = { _id: 'n1', recipient: { _id: 'u1' } };

  it('retorna quando destinatário é o usuário', async () => {
    const repo = { findById: jest.fn(async () => baseNotif) };
    const r = await getNotificationById({
      id: 'n1',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.success).toBe(true);
  });

  it('rejeita acesso de outro usuário', async () => {
    const repo = { findById: jest.fn(async () => baseNotif) };
    const r = await getNotificationById({
      id: 'n1',
      user: { _id: 'u2' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando inexistente', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await getNotificationById({
      id: 'x',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando soft-deleted', async () => {
    const deleted = { ...baseNotif, deletedAt: new Date() };
    const repo = { findById: jest.fn(async () => deleted) };
    const r = await getNotificationById({
      id: 'n1',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('rejeita sem id', async () => {
    const r = await getNotificationById({
      id: null,
      user: { _id: 'u1' },
      NotificationRepository: {},
    });
    expect(r.status).toBe(422);
  });
});
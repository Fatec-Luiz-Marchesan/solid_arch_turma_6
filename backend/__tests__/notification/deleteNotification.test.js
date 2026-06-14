const { describe, it, expect } = require('@jest/globals');
const { deleteNotification } = require('../../usecases/notification/deleteNotification');

describe('deleteNotification (soft delete)', () => {
  const baseNotif = { _id: 'n1', recipient: { _id: 'u1' }, deletedAt: null };

  it('faz soft delete quando destinatário', async () => {
    const repo = {
      findById: jest.fn(async () => baseNotif),
      update: jest.fn(async () => true),
    };
    const r = await deleteNotification({
      id: 'n1',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.update.mock.calls[0][1].deletedAt).toBeInstanceOf(Date);
  });

  it('rejeita outro usuário', async () => {
    const repo = { findById: jest.fn(async () => baseNotif) };
    const r = await deleteNotification({
      id: 'n1',
      user: { _id: 'u2' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando inexistente', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await deleteNotification({
      id: 'x',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(404);
  });

  it('retorna 404 quando já soft-deleted', async () => {
    const deleted = { ...baseNotif, deletedAt: new Date() };
    const repo = { findById: jest.fn(async () => deleted) };
    const r = await deleteNotification({
      id: 'n1',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});
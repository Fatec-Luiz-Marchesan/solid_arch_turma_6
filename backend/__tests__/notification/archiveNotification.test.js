const { describe, it, expect } = require('@jest/globals');
const { archiveNotification } = require('../../usecases/notification/archiveNotification');

describe('archiveNotification', () => {
  const baseNotif = { _id: 'n1', recipient: { _id: 'u1' }, status: 'read' };

  it('arquiva quando destinatário', async () => {
    const repo = {
      findById: jest.fn(async () => baseNotif),
      update: jest.fn(async (id, d) => ({ ...baseNotif, ...d })),
    };
    const r = await archiveNotification({
      id: 'n1',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.success).toBe(true);
    expect(repo.update.mock.calls[0][1].status).toBe('archived');
    expect(repo.update.mock.calls[0][1].archivedAt).toBeInstanceOf(Date);
  });

  it('rejeita arquivar duas vezes', async () => {
    const archived = { ...baseNotif, status: 'archived' };
    const repo = { findById: jest.fn(async () => archived) };
    const r = await archiveNotification({
      id: 'n1',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(422);
  });

  it('rejeita outro usuário', async () => {
    const repo = { findById: jest.fn(async () => baseNotif) };
    const r = await archiveNotification({
      id: 'n1',
      user: { _id: 'u2' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(403);
  });

  it('retorna 404 quando inexistente', async () => {
    const repo = { findById: jest.fn(async () => null) };
    const r = await archiveNotification({
      id: 'x',
      user: { _id: 'u1' },
      NotificationRepository: repo,
    });
    expect(r.status).toBe(404);
  });
});
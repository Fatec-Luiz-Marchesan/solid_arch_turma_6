const { describe, it, expect, beforeEach } = require('@jest/globals');
const request = require('supertest');
const express = require('express');

jest.mock('../../helpers/get-token', () => () => 'fake-token');
jest.mock('../../helpers/get-user-by-token', () => async () => ({
  _id: 'user-teste-id',
  name: 'Usuário Teste',
}));

const { createNotification } = require('../../usecases/notification/createNotification');
const { listNotifications } = require('../../usecases/notification/listNotifications');
const { getNotificationById } = require('../../usecases/notification/getNotificationById');
const { markAsRead } = require('../../usecases/notification/markAsRead');
const { markAllAsRead } = require('../../usecases/notification/markAllAsRead');
const { archiveNotification } = require('../../usecases/notification/archiveNotification');
const { deleteNotification } = require('../../usecases/notification/deleteNotification');
const { countUnread } = require('../../usecases/notification/countUnread');

describe('Notification — testes de integração', () => {
  let app;
  let store;
  let repo;
  let idCounter;

  beforeEach(() => {
    store = new Map();
    idCounter = 0;

    repo = {
      create: jest.fn(async (data) => {
        idCounter++;
        const _id = 'notif-' + idCounter;
        const notif = { _id, ...data, createdAt: new Date() };
        store.set(_id, notif);
        return notif;
      }),
      findByRecipient: jest.fn(async (recipientId, filters) => {
        return Array.from(store.values())
          .filter((n) => String(n.recipient._id) === String(recipientId) && !n.deletedAt)
          .filter((n) => !filters.type || n.type === filters.type)
          .filter((n) => !filters.status || n.status === filters.status)
          .slice(0, filters.limit || 50);
      }),
      findById: jest.fn(async (id) => store.get(id) || null),
      update: jest.fn(async (id, data) => {
        const cur = store.get(id);
        if (!cur) return null;
        const updated = { ...cur, ...data };
        store.set(id, updated);
        return updated;
      }),
      markAllAsRead: jest.fn(async (recipientId) => {
        let count = 0;
        store.forEach((n, key) => {
          if (
            String(n.recipient._id) === String(recipientId) &&
            n.status === 'unread' &&
            !n.deletedAt
          ) {
            store.set(key, { ...n, status: 'read', readAt: new Date() });
            count++;
          }
        });
        return { modifiedCount: count };
      }),
      countUnread: jest.fn(async (recipientId) => {
        let count = 0;
        store.forEach((n) => {
          if (
            String(n.recipient._id) === String(recipientId) &&
            n.status === 'unread' &&
            !n.deletedAt
          ) {
            count++;
          }
        });
        return count;
      }),
    };

    const dispatcher = { dispatch: jest.fn(async () => true) };

    app = express();
    app.use(express.json());

    app.post('/notifications', async (req, res) => {
      const r = await createNotification({
        data: req.body,
        sender: { _id: 'user-teste-id', name: 'Usuário Teste' },
        NotificationRepository: repo,
        NotificationDispatcher: dispatcher,
      });
      if (!r.success) return res.status(r.status).json({ message: r.errors[0] });
      return res.status(r.status).json({ message: 'Notificação criada!', data: r.notification });
    });

    app.get('/notifications', async (req, res) => {
      const r = await listNotifications({
        user: { _id: 'user-teste-id' },
        filters: req.query,
        NotificationRepository: repo,
      });
      if (!r.success) return res.status(r.status).json({ message: r.errors[0] });
      return res.status(200).json({ notifications: r.notifications });
    });

    app.get('/notifications/unread-count', async (req, res) => {
      const r = await countUnread({
        user: { _id: 'user-teste-id' },
        NotificationRepository: repo,
      });
      if (!r.success) return res.status(r.status).json({ message: r.errors[0] });
      return res.status(200).json({ count: r.count });
    });

    app.patch('/notifications/mark-all-read', async (req, res) => {
      const r = await markAllAsRead({
        user: { _id: 'user-teste-id' },
        NotificationRepository: repo,
      });
      if (!r.success) return res.status(r.status).json({ message: r.errors[0] });
      return res.status(200).json({ affected: r.affected });
    });

    app.get('/notifications/:id', async (req, res) => {
      const r = await getNotificationById({
        id: req.params.id,
        user: { _id: 'user-teste-id' },
        NotificationRepository: repo,
      });
      if (!r.success) return res.status(r.status).json({ message: r.errors[0] });
      return res.status(200).json({ notification: r.notification });
    });

    app.patch('/notifications/:id/read', async (req, res) => {
      const r = await markAsRead({
        id: req.params.id,
        user: { _id: 'user-teste-id' },
        NotificationRepository: repo,
      });
      if (!r.success) return res.status(r.status).json({ message: r.errors[0] });
      return res.status(200).json({ data: r.notification });
    });

    app.patch('/notifications/:id/archive', async (req, res) => {
      const r = await archiveNotification({
        id: req.params.id,
        user: { _id: 'user-teste-id' },
        NotificationRepository: repo,
      });
      if (!r.success) return res.status(r.status).json({ message: r.errors[0] });
      return res.status(200).json({ data: r.notification });
    });

    app.delete('/notifications/:id', async (req, res) => {
      const r = await deleteNotification({
        id: req.params.id,
        user: { _id: 'user-teste-id' },
        NotificationRepository: repo,
      });
      if (!r.success) return res.status(r.status).json({ message: r.errors[0] });
      return res.status(200).json({ message: r.message });
    });
  });

  const validBody = {
    type: 'message_received',
    title: 'Nova mensagem',
    body: 'Você recebeu uma mensagem nova',
    recipientId: 'user-teste-id',
  };

  describe('POST /notifications', () => {
    it('cria notificação válida (201)', async () => {
      const res = await request(app).post('/notifications').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.status).toBe('unread');
    });

    it('aceita priority e channels customizados', async () => {
      const res = await request(app).post('/notifications').send({
        ...validBody,
        priority: 'urgent',
        channels: ['in_app', 'email'],
      });
      expect(res.status).toBe(201);
      expect(res.body.data.priority).toBe('urgent');
      expect(res.body.data.channels).toEqual(['in_app', 'email']);
    });

    it('rejeita tipo inválido (422)', async () => {
      const res = await request(app)
        .post('/notifications')
        .send({ ...validBody, type: 'invalido' });
      expect(res.status).toBe(422);
    });

    it('rejeita sem título (422)', async () => {
      const res = await request(app)
        .post('/notifications')
        .send({ ...validBody, title: '' });
      expect(res.status).toBe(422);
    });

    it('rejeita sem body (422)', async () => {
      const res = await request(app)
        .post('/notifications')
        .send({ ...validBody, body: '' });
      expect(res.status).toBe(422);
    });

    it('rejeita sem destinatário (422)', async () => {
      const res = await request(app)
        .post('/notifications')
        .send({ ...validBody, recipientId: undefined });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /notifications', () => {
    it('lista notificações do usuário (200)', async () => {
      await request(app).post('/notifications').send(validBody);
      await request(app).post('/notifications').send({
        ...validBody,
        type: 'system',
        title: 'Aviso do sistema',
      });

      const res = await request(app).get('/notifications');
      expect(res.status).toBe(200);
      expect(res.body.notifications).toHaveLength(2);
    });

    it('retorna lista vazia quando não há notificações', async () => {
      const res = await request(app).get('/notifications');
      expect(res.status).toBe(200);
      expect(res.body.notifications).toEqual([]);
    });

    it('filtra por tipo', async () => {
      await request(app).post('/notifications').send(validBody);
      await request(app).post('/notifications').send({
        ...validBody,
        type: 'system',
        title: 'Sistema',
      });

      const res = await request(app).get('/notifications?type=system');
      expect(res.status).toBe(200);
      expect(res.body.notifications).toHaveLength(1);
    });

    it('rejeita filtro de tipo inválido (422)', async () => {
      const res = await request(app).get('/notifications?type=invalido');
      expect(res.status).toBe(422);
    });
  });

  describe('GET /notifications/unread-count', () => {
    it('retorna contagem de não-lidas', async () => {
      await request(app).post('/notifications').send(validBody);
      await request(app).post('/notifications').send(validBody);

      const res = await request(app).get('/notifications/unread-count');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('retorna 0 quando não há', async () => {
      const res = await request(app).get('/notifications/unread-count');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });
  });

  describe('GET /notifications/:id', () => {
    it('retorna detalhes (200)', async () => {
      const created = await request(app).post('/notifications').send(validBody);
      const id = created.body.data._id;

      const res = await request(app).get(`/notifications/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.notification._id).toBe(id);
    });

    it('retorna 404 quando inexistente', async () => {
      const res = await request(app).get('/notifications/nao-existe');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /notifications/:id/read', () => {
    it('marca como lida (200)', async () => {
      const created = await request(app).post('/notifications').send(validBody);
      const id = created.body.data._id;

      const res = await request(app).patch(`/notifications/${id}/read`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('read');
      expect(res.body.data.readAt).toBeTruthy();
    });

    it('é idempotente quando já lida', async () => {
      const created = await request(app).post('/notifications').send(validBody);
      const id = created.body.data._id;

      await request(app).patch(`/notifications/${id}/read`);
      const res = await request(app).patch(`/notifications/${id}/read`);
      expect(res.status).toBe(200);
    });

    it('retorna 404 quando inexistente', async () => {
      const res = await request(app).patch('/notifications/nope/read');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /notifications/mark-all-read', () => {
    it('marca todas como lidas e retorna quantidade', async () => {
      await request(app).post('/notifications').send(validBody);
      await request(app).post('/notifications').send(validBody);
      await request(app).post('/notifications').send(validBody);

      const res = await request(app).patch('/notifications/mark-all-read');
      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(3);

      const count = await request(app).get('/notifications/unread-count');
      expect(count.body.count).toBe(0);
    });

    it('retorna 0 quando não há não-lidas', async () => {
      const res = await request(app).patch('/notifications/mark-all-read');
      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(0);
    });
  });

  describe('PATCH /notifications/:id/archive', () => {
    it('arquiva notificação (200)', async () => {
      const created = await request(app).post('/notifications').send(validBody);
      const id = created.body.data._id;

      const res = await request(app).patch(`/notifications/${id}/archive`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('archived');
      expect(res.body.data.archivedAt).toBeTruthy();
    });

    it('rejeita arquivar duas vezes (422)', async () => {
      const created = await request(app).post('/notifications').send(validBody);
      const id = created.body.data._id;

      await request(app).patch(`/notifications/${id}/archive`);
      const res = await request(app).patch(`/notifications/${id}/archive`);
      expect(res.status).toBe(422);
    });

    it('retorna 404 quando inexistente', async () => {
      const res = await request(app).patch('/notifications/nope/archive');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('faz soft delete (200)', async () => {
      const created = await request(app).post('/notifications').send(validBody);
      const id = created.body.data._id;

      const res = await request(app).delete(`/notifications/${id}`);
      expect(res.status).toBe(200);

      const list = await request(app).get('/notifications');
      expect(list.body.notifications).toHaveLength(0);
    });

    it('retorna 404 quando inexistente', async () => {
      const res = await request(app).delete('/notifications/nope');
      expect(res.status).toBe(404);
    });

    it('retorna 404 quando já deletada', async () => {
      const created = await request(app).post('/notifications').send(validBody);
      const id = created.body.data._id;

      await request(app).delete(`/notifications/${id}`);
      const res = await request(app).delete(`/notifications/${id}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Fluxo completo: criar → ler → marcar → arquivar → deletar', () => {
    it('passa por todas as etapas com sucesso', async () => {
      const created = await request(app).post('/notifications').send(validBody);
      expect(created.status).toBe(201);
      const id = created.body.data._id;

      let count = await request(app).get('/notifications/unread-count');
      expect(count.body.count).toBe(1);

      const detail = await request(app).get(`/notifications/${id}`);
      expect(detail.body.notification.status).toBe('unread');

      const read = await request(app).patch(`/notifications/${id}/read`);
      expect(read.body.data.status).toBe('read');

      count = await request(app).get('/notifications/unread-count');
      expect(count.body.count).toBe(0);

      const archived = await request(app).patch(`/notifications/${id}/archive`);
      expect(archived.body.data.status).toBe('archived');

      const deleted = await request(app).delete(`/notifications/${id}`);
      expect(deleted.status).toBe(200);

      const list = await request(app).get('/notifications');
      expect(list.body.notifications).toHaveLength(0);
    });
  });
});
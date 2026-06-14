const Notification = require('../models/Notification');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { createNotification } = require('../usecases/notification/createNotification');
const { listNotifications } = require('../usecases/notification/listNotifications');
const { getNotificationById } = require('../usecases/notification/getNotificationById');
const { markAsRead } = require('../usecases/notification/markAsRead');
const { markAllAsRead } = require('../usecases/notification/markAllAsRead');
const { archiveNotification } = require('../usecases/notification/archiveNotification');
const { deleteNotification } = require('../usecases/notification/deleteNotification');
const { countUnread } = require('../usecases/notification/countUnread');
const { dispatchNotification } = require('../usecases/notification/dispatchNotification');


const inAppAdapter = {
  send: async () => {
   
    return true;
  },
};

const emailAdapter = {
  send: async (notification) => {
    
    console.log(`[email] enviaria para ${notification.recipient._id}: ${notification.title}`);
    return true;
  },
};

const pushAdapter = {
  send: async (notification) => {
    
    console.log(`[push] enviaria para ${notification.recipient._id}: ${notification.title}`);
    return true;
  },
};

const channelAdapters = {
  in_app: inAppAdapter,
  email: emailAdapter,
  push: pushAdapter,
};

const NotificationDispatcher = {
  dispatch: (notification) =>
    dispatchNotification({ notification, channelAdapters }),
};

const NotificationRepository = {
  create: (data) => new Notification(data).save(),
  findByRecipient: (recipientId, filters) => {
    const q = { 'recipient._id': recipientId, deletedAt: null };
    if (filters.type) q.type = filters.type;
    if (filters.status) q.status = filters.status;
    if (filters.priority) q.priority = filters.priority;
    if (filters.fromDate || filters.toDate) {
      q.createdAt = {};
      if (filters.fromDate) q.createdAt.$gte = filters.fromDate;
      if (filters.toDate) q.createdAt.$lte = filters.toDate;
    }
    return Notification.find(q).sort('-createdAt').limit(filters.limit || 50);
  },
  findById: (id) => Notification.findById(id),
  update: (id, data) => Notification.findByIdAndUpdate(id, data, { new: true }),
  markAllAsRead: (recipientId) =>
    Notification.updateMany(
      { 'recipient._id': recipientId, status: 'unread', deletedAt: null },
      { status: 'read', readAt: new Date() }
    ),
  countUnread: (recipientId) =>
    Notification.countDocuments({
      'recipient._id': recipientId,
      status: 'unread',
      deletedAt: null,
    }),
};

module.exports = class NotificationController {
  static async create(req, res) {
    const token = getToken(req);
    const sender = await getUserByToken(token);

    const result = await createNotification({
      data: req.body,
      sender,
      NotificationRepository,
      NotificationDispatcher,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(result.status).json({
      message: 'Notificação criada!',
      data: result.notification,
    });
  }

  static async list(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await listNotifications({
      user,
      filters: req.query,
      NotificationRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ notifications: result.notifications });
  }

  static async getById(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await getNotificationById({
      id: req.params.id,
      user,
      NotificationRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ notification: result.notification });
  }

  static async markAsRead(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await markAsRead({
      id: req.params.id,
      user,
      NotificationRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Marcada como lida!',
      data: result.notification,
    });
  }

  static async markAllAsRead(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await markAllAsRead({ user, NotificationRepository });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: `${result.affected} notificações marcadas como lidas`,
      affected: result.affected,
    });
  }

  static async archive(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await archiveNotification({
      id: req.params.id,
      user,
      NotificationRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Notificação arquivada!',
      data: result.notification,
    });
  }

  static async delete(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await deleteNotification({
      id: req.params.id,
      user,
      NotificationRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }

  static async countUnread(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await countUnread({ user, NotificationRepository });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ count: result.count });
  }
};
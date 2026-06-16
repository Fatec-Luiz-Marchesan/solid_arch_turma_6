const { validateNotification } = require('../../helpers/validate-notification');

async function createNotification({ data, sender, NotificationRepository, NotificationDispatcher }) {
  const validation = validateNotification(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const notification = await NotificationRepository.create({
    type: data.type,
    title: data.title.trim(),
    body: data.body.trim(),
    recipient: { _id: data.recipientId },
    sender: sender ? { _id: sender._id, name: sender.name } : null,
    relatedEntity: data.relatedEntity || null,
    priority: data.priority || 'normal',
    channels: data.channels || ['in_app'],
    metadata: data.metadata || {},
    actionUrl: data.actionUrl ? data.actionUrl.trim() : null,
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    status: 'unread',
  });


  if (NotificationDispatcher && notification.channels.length > 0) {
    try {
      await NotificationDispatcher.dispatch(notification);
    } catch (err) {
      
    }
  }

  return { success: true, status: 201, notification };
}

module.exports = { createNotification };
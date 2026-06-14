async function markAsRead({ id, user, NotificationRepository }) {
  const notification = await NotificationRepository.findById(id);
  if (!notification || notification.deletedAt) {
    return { success: false, status: 404, errors: ['Notificação não encontrada!'] };
  }

  if (String(notification.recipient._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  if (notification.status === 'read') {
    return { success: true, status: 200, notification };
  }

  const updated = await NotificationRepository.update(id, {
    status: 'read',
    readAt: new Date(),
  });
  return { success: true, status: 200, notification: updated };
}

module.exports = { markAsRead };
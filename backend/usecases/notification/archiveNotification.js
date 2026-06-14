async function archiveNotification({ id, user, NotificationRepository }) {
  const notification = await NotificationRepository.findById(id);
  if (!notification || notification.deletedAt) {
    return { success: false, status: 404, errors: ['Notificação não encontrada!'] };
  }

  if (String(notification.recipient._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  if (notification.status === 'archived') {
    return {
      success: false,
      status: 422,
      errors: ['Notificação já está arquivada!'],
    };
  }

  const updated = await NotificationRepository.update(id, {
    status: 'archived',
    archivedAt: new Date(),
  });
  return { success: true, status: 200, notification: updated };
}

module.exports = { archiveNotification };
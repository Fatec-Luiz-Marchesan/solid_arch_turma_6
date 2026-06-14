async function deleteNotification({ id, user, NotificationRepository }) {
  const notification = await NotificationRepository.findById(id);
  if (!notification || notification.deletedAt) {
    return { success: false, status: 404, errors: ['Notificação não encontrada!'] };
  }

  if (String(notification.recipient._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  await NotificationRepository.update(id, { deletedAt: new Date() });
  return { success: true, status: 200, message: 'Notificação removida!' };
}

module.exports = { deleteNotification };
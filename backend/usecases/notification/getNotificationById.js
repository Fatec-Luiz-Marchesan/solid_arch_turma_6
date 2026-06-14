async function getNotificationById({ id, user, NotificationRepository }) {
  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const notification = await NotificationRepository.findById(id);
  if (!notification || notification.deletedAt) {
    return { success: false, status: 404, errors: ['Notificação não encontrada!'] };
  }

  if (String(notification.recipient._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  return { success: true, status: 200, notification };
}

module.exports = { getNotificationById };
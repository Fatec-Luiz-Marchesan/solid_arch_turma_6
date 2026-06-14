async function markAllAsRead({ user, NotificationRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const result = await NotificationRepository.markAllAsRead(user._id);
  return {
    success: true,
    status: 200,
    affected: result.modifiedCount || result.nModified || 0,
  };
}

module.exports = { markAllAsRead };
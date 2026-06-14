async function countUnread({ user, NotificationRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const count = await NotificationRepository.countUnread(user._id);
  return { success: true, status: 200, count };
}

module.exports = { countUnread };
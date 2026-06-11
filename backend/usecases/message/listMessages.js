async function listMessages({ user, MessageRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const messages = await MessageRepository.findByUser(user._id);
  return { success: true, status: 200, messages };
}

module.exports = { listMessages };
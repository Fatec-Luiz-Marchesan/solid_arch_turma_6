async function getMessageById({ id, user, MessageRepository }) {
  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const message = await MessageRepository.findById(id);
  if (!message) {
    return { success: false, status: 404, errors: ['Mensagem não encontrada!'] };
  }

  const isSender = String(message.sender._id) === String(user._id);
  const isReceiver = String(message.receiver._id) === String(user._id);
  if (!isSender && !isReceiver) {
    return { success: false, status: 403, errors: ['Acesso negado!'] };
  }

  return { success: true, status: 200, message };
}

module.exports = { getMessageById };
async function deleteMessage({ id, user, MessageRepository }) {
  const message = await MessageRepository.findById(id);
  if (!message) {
    return { success: false, status: 404, errors: ['Mensagem não encontrada!'] };
  }

  if (String(message.sender._id) !== String(user._id)) {
    return {
      success: false,
      status: 403,
      errors: ['Apenas o remetente pode deletar a mensagem!'],
    };
  }

  await MessageRepository.delete(id);
  return { success: true, status: 200, message: 'Mensagem removida!' };
}

module.exports = { deleteMessage };
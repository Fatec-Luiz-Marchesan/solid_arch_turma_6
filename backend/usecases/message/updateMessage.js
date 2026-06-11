const { validateMessage } = require('../../helpers/validate-message');

async function updateMessage({ id, data, user, MessageRepository }) {
  const message = await MessageRepository.findById(id);
  if (!message) {
    return { success: false, status: 404, errors: ['Mensagem não encontrada!'] };
  }

  if (String(message.sender._id) !== String(user._id)) {
    return {
      success: false,
      status: 403,
      errors: ['Apenas o remetente pode editar a mensagem!'],
    };
  }

  
  if (!data.content || data.content.trim().length < 1) {
    return { success: false, status: 422, errors: ['Conteúdo inválido!'] };
  }
  if (data.content.length > 1000) {
    return { success: false, status: 422, errors: ['Mensagem muito longa!'] };
  }

  const updated = await MessageRepository.update(id, {
    content: data.content.trim(),
  });
  return { success: true, status: 200, message: updated };
}

module.exports = { updateMessage };
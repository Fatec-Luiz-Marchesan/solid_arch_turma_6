const { normalizeContent } = require('../../helpers/validate-message');

async function updateMessage({ id, data, user, MessageRepository }) {
  const message = await MessageRepository.findById(id);
  if (!message || message.deletedAt) {
    return { success: false, status: 404, errors: ['Mensagem não encontrada!'] };
  }

  if (String(message.sender._id) !== String(user._id)) {
    return {
      success: false,
      status: 403,
      errors: ['Apenas o remetente pode editar a mensagem!'],
    };
  }

  if (!data.content || typeof data.content !== 'string') {
    return { success: false, status: 422, errors: ['Conteúdo inválido!'] };
  }

  const normalized = normalizeContent(data.content);
  if (normalized.length < 1) {
    return { success: false, status: 422, errors: ['Conteúdo inválido!'] };
  }
  if (normalized.length > 1000) {
    return { success: false, status: 422, errors: ['Mensagem muito longa!'] };
  }

  const updated = await MessageRepository.update(id, { content: normalized });
  return { success: true, status: 200, message: updated };
}

module.exports = { updateMessage };
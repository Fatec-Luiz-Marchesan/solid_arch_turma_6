const { validateMessage } = require('../../helpers/validate-message');

async function createMessage({ data, sender, MessageRepository }) {
  const validation = validateMessage(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  if (!sender || !sender._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  if (String(sender._id) === String(data.receiverId)) {
    return {
      success: false,
      status: 422,
      errors: ['Você não pode enviar mensagem para si mesmo!'],
    };
  }

  const message = await MessageRepository.create({
    content: data.content.trim(),
    sender: { _id: sender._id, name: sender.name },
    receiver: { _id: data.receiverId },
    pet: { _id: data.petId },
    read: false,
  });

  return { success: true, status: 201, message };
}

module.exports = { createMessage };
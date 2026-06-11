function validateMessage(data) {
  const errors = [];

  if (!data.content || typeof data.content !== 'string') {
    errors.push('O conteúdo da mensagem é obrigatório!');
  } else if (data.content.trim().length < 1) {
    errors.push('A mensagem não pode estar vazia!');
  } else if (data.content.length > 1000) {
    errors.push('A mensagem não pode ter mais de 1000 caracteres!');
  }

  if (!data.receiverId) {
    errors.push('O destinatário é obrigatório!');
  }

  if (!data.petId) {
    errors.push('O pet é obrigatório!');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = { validateMessage };
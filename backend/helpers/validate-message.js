const ALLOWED_PRIORITIES = ['low', 'normal', 'high'];

function normalizeContent(content) {
  if (typeof content !== 'string') return content;
  return content.replace(/\s+/g, ' ').trim();
}

function validateMessage(data) {
  const errors = [];

  if (!data.content || typeof data.content !== 'string') {
    errors.push('O conteúdo da mensagem é obrigatório!');
  } else {
    const normalized = normalizeContent(data.content);
    if (normalized.length < 1) {
      errors.push('A mensagem não pode estar vazia!');
    } else if (normalized.length > 1000) {
      errors.push('A mensagem não pode ter mais de 1000 caracteres!');
    }
  }

  if (!data.receiverId) {
    errors.push('O destinatário é obrigatório!');
  }

  if (!data.petId) {
    errors.push('O pet é obrigatório!');
  }

  if (data.priority && !ALLOWED_PRIORITIES.includes(data.priority)) {
    errors.push('Prioridade inválida!');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateMessage,
  normalizeContent,
  ALLOWED_PRIORITIES,
};
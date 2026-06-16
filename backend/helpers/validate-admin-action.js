function validateAdminAction(data) {
  const errors = [];

  if (!data.targetId) {
    errors.push('O ID do usuário é obrigatório!');
  } else if (typeof data.targetId !== 'string') {
    errors.push('O ID do usuário deve ser uma string!');
  } else if (!/^[a-fA-F0-9]{24}$/.test(data.targetId)) {
    errors.push('ID em formato inválido!');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = { validateAdminAction };
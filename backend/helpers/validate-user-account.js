function validatePasswordChange(data) {
  const errors = [];

  if (!data.currentPassword) {
    errors.push('Senha atual é obrigatória!');
  }
  if (!data.newPassword) {
    errors.push('Nova senha é obrigatória!');
  } else if (typeof data.newPassword !== 'string') {
    errors.push('Nova senha inválida!');
  } else if (data.newPassword.length < 6) {
    errors.push('Nova senha precisa ter pelo menos 6 caracteres!');
  } else if (data.newPassword.length > 100) {
    errors.push('Nova senha não pode passar de 100 caracteres!');
  }
  if (!data.confirmNewPassword) {
    errors.push('Confirmação da nova senha é obrigatória!');
  }
  if (
    data.newPassword &&
    data.confirmNewPassword &&
    data.newPassword !== data.confirmNewPassword
  ) {
    errors.push('Nova senha e confirmação não conferem!');
  }
  if (
    data.currentPassword &&
    data.newPassword &&
    data.currentPassword === data.newPassword
  ) {
    errors.push('A nova senha deve ser diferente da atual!');
  }

  return { isValid: errors.length === 0, errors };
}

function validateSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return { isValid: false, errors: ['Termo de busca é obrigatório!'] };
  }
  if (query.trim().length < 2) {
    return { isValid: false, errors: ['Termo de busca precisa de no mínimo 2 caracteres!'] };
  }
  if (query.length > 100) {
    return { isValid: false, errors: ['Termo de busca muito longo!'] };
  }
  return { isValid: true, errors: [] };
}

function validateDeleteAccount(data) {
  if (!data.password) {
    return { isValid: false, errors: ['Senha é obrigatória para confirmar exclusão!'] };
  }
  return { isValid: true, errors: [] };
}

module.exports = {
  validatePasswordChange,
  validateSearchQuery,
  validateDeleteAccount,
};
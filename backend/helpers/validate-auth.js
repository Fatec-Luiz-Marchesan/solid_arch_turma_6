const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN = 2;
const NAME_MAX = 80;
const PASSWORD_MIN = 6;
const PHONE_MIN = 8;
const PHONE_MAX = 20;

function validateRegister(data) {
  const errors = [];
  const d = data || {};

  if (!d.name || typeof d.name !== 'string' || d.name.trim().length === 0) {
    errors.push('O nome é obrigatório!');
  } else if (d.name.trim().length < NAME_MIN) {
    errors.push(`O nome deve ter pelo menos ${NAME_MIN} caracteres!`);
  } else if (d.name.trim().length > NAME_MAX) {
    errors.push(`O nome não pode passar de ${NAME_MAX} caracteres!`);
  }

  if (!d.email || typeof d.email !== 'string' || d.email.trim().length === 0) {
    errors.push('O e-mail é obrigatório!');
  } else if (!EMAIL_REGEX.test(d.email.trim())) {
    errors.push('Formato de e-mail inválido!');
  }

  if (!d.phone || typeof d.phone !== 'string' || d.phone.trim().length === 0) {
    errors.push('O telefone é obrigatório!');
  } else if (d.phone.trim().length < PHONE_MIN || d.phone.trim().length > PHONE_MAX) {
    errors.push(`O telefone deve ter entre ${PHONE_MIN} e ${PHONE_MAX} caracteres!`);
  }

  if (!d.password) {
    errors.push('A senha é obrigatória!');
  } else if (typeof d.password !== 'string') {
    errors.push('Senha inválida!');
  } else if (d.password.length < PASSWORD_MIN) {
    errors.push(`A senha deve ter pelo menos ${PASSWORD_MIN} caracteres!`);
  }

  if (!d.confirmpassword) {
    errors.push('A confirmação de senha é obrigatória!');
  }

  if (d.password && d.confirmpassword && d.password !== d.confirmpassword) {
    errors.push('A senha e a confirmação precisam ser iguais!');
  }

  return { isValid: errors.length === 0, errors };
}

function validateLogin(data) {
  const errors = [];
  const d = data || {};

  if (!d.email || typeof d.email !== 'string' || d.email.trim().length === 0) {
    errors.push('O e-mail é obrigatório!');
  } else if (!EMAIL_REGEX.test(d.email.trim())) {
    errors.push('Formato de e-mail inválido!');
  }

  if (!d.password) {
    errors.push('A senha é obrigatória!');
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateRegister,
  validateLogin,
  EMAIL_REGEX,
  NAME_MIN,
  NAME_MAX,
  PASSWORD_MIN,
  PHONE_MIN,
  PHONE_MAX,
};
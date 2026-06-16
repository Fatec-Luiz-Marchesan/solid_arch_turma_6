function isValidEmail(email) {
  if (typeof email !== 'string' || email.length > 254) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64) return false;
  if (!domain || !domain.includes('.')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  return true;
}

const NAME_MIN = 2;
const NAME_MAX = 80;
const PHONE_MIN = 8;
const PHONE_MAX = 20;
const BIO_MAX = 200;
const PASSWORD_MIN = 6;

function validateUserEdit(data) {
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
  } else if (!isValidEmail(d.email.trim())) {
    errors.push('Formato de e-mail inválido!');
  }

  if (!d.phone || typeof d.phone !== 'string' || d.phone.trim().length === 0) {
    errors.push('O telefone é obrigatório!');
  } else if (d.phone.trim().length < PHONE_MIN || d.phone.trim().length > PHONE_MAX) {
    errors.push(`O telefone deve ter entre ${PHONE_MIN} e ${PHONE_MAX} caracteres!`);
  }

  if (d.bio !== undefined && d.bio !== null && d.bio !== '') {
    if (typeof d.bio !== 'string') {
      errors.push('Bio deve ser um texto!');
    } else if (d.bio.trim().length > BIO_MAX) {
      errors.push(`Bio não pode passar de ${BIO_MAX} caracteres!`);
    }
  }

  if (d.password && d.confirmpassword && d.password !== d.confirmpassword) {
    errors.push('As senhas não conferem!');
  }

  if (d.password && typeof d.password === 'string' && d.password.length < PASSWORD_MIN) {
    errors.push(`A senha deve ter pelo menos ${PASSWORD_MIN} caracteres!`);
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateUserEdit,
  isValidEmail,
  NAME_MIN,
  NAME_MAX,
  PHONE_MIN,
  PHONE_MAX,
  BIO_MAX,
  PASSWORD_MIN,
};
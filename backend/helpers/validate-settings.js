const ALLOWED_THEMES = ['light', 'dark', 'system'];
const ALLOWED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES'];
const NOTIFICATION_KEYS = ['email', 'push', 'sms'];
const MAX_TIMEZONE_LENGTH = 64;

function validateNotifications(notifications) {
  const errors = [];
  if (notifications === undefined || notifications === null) {
    return { isValid: true, errors };
  }
  if (typeof notifications !== 'object' || Array.isArray(notifications)) {
    errors.push('notifications deve ser um objeto!');
    return { isValid: false, errors };
  }
  for (const key of Object.keys(notifications)) {
    if (!NOTIFICATION_KEYS.includes(key)) {
      errors.push(`Notificação inválida: ${key}!`);
    } else if (typeof notifications[key] !== 'boolean') {
      errors.push(`notifications.${key} deve ser booleano!`);
    }
  }
  return { isValid: errors.length === 0, errors };
}

function validateSettings(data) {
  const errors = [];
  const d = data || {};

  if (d.theme !== undefined && !ALLOWED_THEMES.includes(d.theme)) {
    errors.push('Tema inválido!');
  }

  if (d.language !== undefined && !ALLOWED_LANGUAGES.includes(d.language)) {
    errors.push('Idioma inválido!');
  }

  if (d.timezone !== undefined) {
    if (typeof d.timezone !== 'string' || d.timezone.trim().length === 0) {
      errors.push('timezone deve ser um texto!');
    } else if (d.timezone.length > MAX_TIMEZONE_LENGTH) {
      errors.push(`timezone não pode passar de ${MAX_TIMEZONE_LENGTH} caracteres!`);
    }
  }

  if (d.notifications !== undefined) {
    const n = validateNotifications(d.notifications);
    if (!n.isValid) errors.push(...n.errors);
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateSettings,
  validateNotifications,
  ALLOWED_THEMES,
  ALLOWED_LANGUAGES,
  NOTIFICATION_KEYS,
  MAX_TIMEZONE_LENGTH,
};
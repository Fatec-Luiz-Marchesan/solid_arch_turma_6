const ALLOWED_THEMES = ['light', 'dark', 'system'];
const ALLOWED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES'];
const ALLOWED_DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const ALLOWED_TIME_FORMATS = ['12h', '24h'];
const ALLOWED_FONT_SIZES = ['small', 'medium', 'large'];
const NOTIFICATION_KEYS = ['email', 'push', 'sms', 'quietHours'];
const MAX_TIMEZONE_LENGTH = 64;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

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
    } else if (key === 'quietHours') {
      const qh = notifications.quietHours;
      if (typeof qh !== 'object' || Array.isArray(qh) || qh === null) {
        errors.push('notifications.quietHours deve ser um objeto!');
      } else {
        if (qh.enabled !== undefined && typeof qh.enabled !== 'boolean') {
          errors.push('notifications.quietHours.enabled deve ser booleano!');
        }
        if (qh.start !== undefined && !TIME_REGEX.test(qh.start)) {
          errors.push('notifications.quietHours.start deve estar no formato HH:MM!');
        }
        if (qh.end !== undefined && !TIME_REGEX.test(qh.end)) {
          errors.push('notifications.quietHours.end deve estar no formato HH:MM!');
        }
      }
    } else if (typeof notifications[key] !== 'boolean') {
      errors.push(`notifications.${key} deve ser booleano!`);
    }
  }
  return { isValid: errors.length === 0, errors };
}

function validateAccessibility(accessibility) {
  const errors = [];
  if (accessibility === undefined || accessibility === null) {
    return { isValid: true, errors };
  }
  if (typeof accessibility !== 'object' || Array.isArray(accessibility)) {
    errors.push('accessibility deve ser um objeto!');
    return { isValid: false, errors };
  }
  if (
    accessibility.fontSize !== undefined &&
    !ALLOWED_FONT_SIZES.includes(accessibility.fontSize)
  ) {
    errors.push('accessibility.fontSize inválido!');
  }
  if (
    accessibility.highContrast !== undefined &&
    typeof accessibility.highContrast !== 'boolean'
  ) {
    errors.push('accessibility.highContrast deve ser booleano!');
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

  if (d.dateFormat !== undefined && !ALLOWED_DATE_FORMATS.includes(d.dateFormat)) {
    errors.push('dateFormat inválido!');
  }

  if (d.timeFormat !== undefined && !ALLOWED_TIME_FORMATS.includes(d.timeFormat)) {
    errors.push('timeFormat inválido!');
  }

  if (d.notifications !== undefined) {
    const n = validateNotifications(d.notifications);
    if (!n.isValid) errors.push(...n.errors);
  }

  if (d.accessibility !== undefined) {
    const a = validateAccessibility(d.accessibility);
    if (!a.isValid) errors.push(...a.errors);
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateSettings,
  validateNotifications,
  validateAccessibility,
  ALLOWED_THEMES,
  ALLOWED_LANGUAGES,
  ALLOWED_DATE_FORMATS,
  ALLOWED_TIME_FORMATS,
  ALLOWED_FONT_SIZES,
  NOTIFICATION_KEYS,
  MAX_TIMEZONE_LENGTH,
};

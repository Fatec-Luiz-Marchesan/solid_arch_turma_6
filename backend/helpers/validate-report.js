const ALLOWED_TARGET_TYPES = ['pet', 'user', 'message'];
const ALLOWED_REASONS = ['spam', 'abuse', 'fraud', 'inappropriate', 'other'];
const ALLOWED_STATUSES = ['pending', 'reviewing', 'resolved', 'dismissed'];

const TARGET_ID_MAX = 100;
const DESCRIPTION_MAX = 1000;

// Colapsa espaços internos e apara as bordas.
function normalizeText(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\s+/g, ' ').trim();
}

function validateTargetType(value, errors) {
  if (!ALLOWED_TARGET_TYPES.includes(value)) {
    errors.push('Tipo de alvo inválido!');
  }
}

function validateTargetId(value, errors) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push('targetId é obrigatório!');
    return;
  }
  if (value.trim().length > TARGET_ID_MAX) {
    errors.push(`targetId não pode passar de ${TARGET_ID_MAX} caracteres!`);
  }
}

function validateReason(value, errors) {
  if (!ALLOWED_REASONS.includes(value)) {
    errors.push('Motivo inválido!');
  }
}

function validateDescription(value, errors) {
  if (typeof value !== 'string') {
    errors.push('description deve ser um texto!');
    return;
  }
  if (value.length > DESCRIPTION_MAX) {
    errors.push(`description não pode passar de ${DESCRIPTION_MAX} caracteres!`);
  }
}

/**
 * Valida os dados de uma denúncia.
 * @param {object} data - payload da denúncia
 * @param {object} [options]
 * @param {boolean} [options.partial=false] - quando true, campos obrigatórios
 *   só são validados se presentes (usado em PATCH/update).
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateReport(data, { partial = false } = {}) {
  const errors = [];
  const d = data || {};

  if (!partial || d.targetType !== undefined) {
    validateTargetType(d.targetType, errors);
  }

  if (!partial || d.targetId !== undefined) {
    validateTargetId(d.targetId, errors);
  }

  if (!partial || d.reason !== undefined) {
    validateReason(d.reason, errors);
  }

  if (d.description !== undefined) {
    validateDescription(d.description, errors);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Valida um valor de status (usado na atualização de moderação).
 * @param {string} status
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateStatus(status) {
  const errors = [];
  if (!ALLOWED_STATUSES.includes(status)) {
    errors.push('Status inválido!');
  }
  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateReport,
  validateStatus,
  normalizeText,
  ALLOWED_TARGET_TYPES,
  ALLOWED_REASONS,
  ALLOWED_STATUSES,
  TARGET_ID_MAX,
  DESCRIPTION_MAX,
};
const ALLOWED_TYPES = ['weight-loss', 'weight-gain', 'maintenance', 'high-protein', 'low-carb', 'vegan', 'other'];

const NAME_MIN = 2;
const NAME_MAX = 100;
const GOAL_MAX = 300;
const NOTES_MAX = 1000;
const RESTRICTIONS_MAX_ITEMS = 20;
const RESTRICTION_ITEM_MAX = 50;
const DAILY_CALORIES_MIN = 0;
const DAILY_CALORIES_MAX = 10000;
const DURATION_DAYS_MIN = 1;
const DURATION_DAYS_MAX = 3650;

function normalizeName(name) {
  if (typeof name !== 'string') return name;
  return name.replace(/\s+/g, ' ').trim();
}

function validateName(value, errors) {
  if (typeof value !== 'string') {
    errors.push('O nome da dieta é obrigatório!');
    return;
  }
  const normalized = normalizeName(value);
  if (normalized.length < NAME_MIN) {
    errors.push(`O nome deve ter pelo menos ${NAME_MIN} caracteres!`);
  } else if (normalized.length > NAME_MAX) {
    errors.push(`O nome não pode passar de ${NAME_MAX} caracteres!`);
  }
}

function validateType(value, errors) {
  if (!ALLOWED_TYPES.includes(value)) {
    errors.push('Tipo de dieta inválido!');
  }
}

function validateRestrictions(value, errors) {
  if (!Array.isArray(value)) {
    errors.push('restrictions deve ser uma lista!');
    return;
  }
  if (value.length > RESTRICTIONS_MAX_ITEMS) {
    errors.push(`restrictions não pode ter mais de ${RESTRICTIONS_MAX_ITEMS} itens!`);
    return;
  }
  for (const item of value) {
    if (typeof item !== 'string' || item.trim().length === 0) {
      errors.push('Cada restrição deve ser um texto não vazio!');
      return;
    }
    if (item.trim().length > RESTRICTION_ITEM_MAX) {
      errors.push(`Cada restrição não pode passar de ${RESTRICTION_ITEM_MAX} caracteres!`);
      return;
    }
  }
}

/**
 * Validates diet data.
 * @param {object} data
 * @param {object} [options]
 * @param {boolean} [options.partial=false] - when true, required fields are
 *   only validated if present (used for PATCH/update).
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateDiet(data, { partial = false } = {}) {
  const errors = [];
  const d = data || {};

  if (!partial || d.name !== undefined) {
    validateName(d.name, errors);
  }

  if (!partial || d.type !== undefined) {
    validateType(d.type, errors);
  }

  if (d.goal !== undefined) {
    if (typeof d.goal !== 'string') {
      errors.push('goal deve ser um texto!');
    } else if (d.goal.length > GOAL_MAX) {
      errors.push(`goal não pode passar de ${GOAL_MAX} caracteres!`);
    }
  }

  if (d.dailyCalories !== undefined && d.dailyCalories !== null) {
    const v = d.dailyCalories;
    if (typeof v !== 'number' || Number.isNaN(v) || !Number.isFinite(v)) {
      errors.push('dailyCalories deve ser um número!');
    } else if (v < DAILY_CALORIES_MIN || v > DAILY_CALORIES_MAX) {
      errors.push(`dailyCalories deve estar entre ${DAILY_CALORIES_MIN} e ${DAILY_CALORIES_MAX}!`);
    }
  }

  if (d.durationDays !== undefined && d.durationDays !== null) {
    const v = d.durationDays;
    if (typeof v !== 'number' || Number.isNaN(v) || !Number.isFinite(v)) {
      errors.push('durationDays deve ser um número!');
    } else if (!Number.isInteger(v) || v < DURATION_DAYS_MIN || v > DURATION_DAYS_MAX) {
      errors.push(`durationDays deve ser um inteiro entre ${DURATION_DAYS_MIN} e ${DURATION_DAYS_MAX}!`);
    }
  }

  if (d.restrictions !== undefined) {
    validateRestrictions(d.restrictions, errors);
  }

  if (d.notes !== undefined) {
    if (typeof d.notes !== 'string') {
      errors.push('notes deve ser um texto!');
    } else if (d.notes.length > NOTES_MAX) {
      errors.push(`notes não pode passar de ${NOTES_MAX} caracteres!`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateDiet,
  normalizeName,
  ALLOWED_TYPES,
  NAME_MIN,
  NAME_MAX,
  GOAL_MAX,
  NOTES_MAX,
  RESTRICTIONS_MAX_ITEMS,
  RESTRICTION_ITEM_MAX,
  DAILY_CALORIES_MIN,
  DAILY_CALORIES_MAX,
  DURATION_DAYS_MIN,
  DURATION_DAYS_MAX,
};

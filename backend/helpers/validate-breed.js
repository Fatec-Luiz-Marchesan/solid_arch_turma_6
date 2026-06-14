const ALLOWED_SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'other'];
const ALLOWED_SIZES = ['small', 'medium', 'large'];

const NAME_MIN = 2;
const NAME_MAX = 50;
const DESCRIPTION_MAX = 500;
const ORIGIN_MAX = 100;
const TEMPERAMENT_MAX_ITEMS = 10;
const TEMPERAMENT_ITEM_MAX = 30;
const LIFE_EXPECTANCY_MIN = 0;
const LIFE_EXPECTANCY_MAX = 50;

// Collapse internal whitespace and trim the edges.
function normalizeName(name) {
  if (typeof name !== 'string') return name;
  return name.replace(/\s+/g, ' ').trim();
}

function validateName(value, errors) {
  if (typeof value !== 'string') {
    errors.push('O nome da raça é obrigatório!');
    return;
  }
  const normalized = normalizeName(value);
  if (normalized.length < NAME_MIN) {
    errors.push(`O nome deve ter pelo menos ${NAME_MIN} caracteres!`);
  } else if (normalized.length > NAME_MAX) {
    errors.push(`O nome não pode passar de ${NAME_MAX} caracteres!`);
  }
}

function validateSpecies(value, errors) {
  if (!ALLOWED_SPECIES.includes(value)) {
    errors.push('Espécie inválida!');
  }
}

function validateTemperament(value, errors) {
  if (!Array.isArray(value)) {
    errors.push('temperament deve ser uma lista!');
    return;
  }
  if (value.length > TEMPERAMENT_MAX_ITEMS) {
    errors.push(`temperament não pode ter mais de ${TEMPERAMENT_MAX_ITEMS} itens!`);
    return;
  }
  for (const item of value) {
    if (typeof item !== 'string' || item.trim().length === 0) {
      errors.push('Cada temperamento deve ser um texto não vazio!');
      return;
    }
    if (item.trim().length > TEMPERAMENT_ITEM_MAX) {
      errors.push(`Cada temperamento não pode passar de ${TEMPERAMENT_ITEM_MAX} caracteres!`);
      return;
    }
  }
}

/**
 * Validates breed data.
 * @param {object} data - the breed payload
 * @param {object} [options]
 * @param {boolean} [options.partial=false] - when true, required fields are
 *   only validated if present (used for PATCH/update).
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateBreed(data, { partial = false } = {}) {
  const errors = [];
  const d = data || {};

  // name
  if (!partial || d.name !== undefined) {
    validateName(d.name, errors);
  }

  // species
  if (!partial || d.species !== undefined) {
    validateSpecies(d.species, errors);
  }

  // size (optional)
  if (d.size !== undefined && !ALLOWED_SIZES.includes(d.size)) {
    errors.push('Tamanho inválido!');
  }

  // description (optional)
  if (d.description !== undefined) {
    if (typeof d.description !== 'string') {
      errors.push('description deve ser um texto!');
    } else if (d.description.length > DESCRIPTION_MAX) {
      errors.push(`description não pode passar de ${DESCRIPTION_MAX} caracteres!`);
    }
  }

  // temperament (optional)
  if (d.temperament !== undefined) {
    validateTemperament(d.temperament, errors);
  }

  // lifeExpectancy (optional)
  if (d.lifeExpectancy !== undefined && d.lifeExpectancy !== null) {
    const v = d.lifeExpectancy;
    if (typeof v !== 'number' || Number.isNaN(v) || !Number.isFinite(v)) {
      errors.push('lifeExpectancy deve ser um número!');
    } else if (v < LIFE_EXPECTANCY_MIN || v > LIFE_EXPECTANCY_MAX) {
      errors.push(
        `lifeExpectancy deve estar entre ${LIFE_EXPECTANCY_MIN} e ${LIFE_EXPECTANCY_MAX}!`
      );
    }
  }

  // origin (optional)
  if (d.origin !== undefined) {
    if (typeof d.origin !== 'string') {
      errors.push('origin deve ser um texto!');
    } else if (d.origin.length > ORIGIN_MAX) {
      errors.push(`origin não pode passar de ${ORIGIN_MAX} caracteres!`);
    }
  }

  // hypoallergenic (optional)
  if (d.hypoallergenic !== undefined && typeof d.hypoallergenic !== 'boolean') {
    errors.push('hypoallergenic deve ser booleano!');
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateBreed,
  normalizeName,
  ALLOWED_SPECIES,
  ALLOWED_SIZES,
  NAME_MIN,
  NAME_MAX,
  DESCRIPTION_MAX,
  ORIGIN_MAX,
  TEMPERAMENT_MAX_ITEMS,
  TEMPERAMENT_ITEM_MAX,
  LIFE_EXPECTANCY_MIN,
  LIFE_EXPECTANCY_MAX,
};
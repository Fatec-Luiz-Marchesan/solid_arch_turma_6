const { ALLOWED_TYPES } = require('../../helpers/validate-diet');

async function listDiets({ DietRepository, filters = {} }) {
  const f = filters || {};

  if (f.type !== undefined && !ALLOWED_TYPES.includes(f.type)) {
    return { success: false, status: 422, errors: ['Tipo de dieta inválido!'] };
  }

  const diets = await DietRepository.findActive(
    f.type ? { type: f.type } : {}
  );

  return { success: true, status: 200, diets };
}

module.exports = { listDiets };

const { ALLOWED_TYPES } = require('../../helpers/validate-diet');

async function listDiets({ DietRepository, filters = {} }) {
  const f = filters || {};

  if (f.type !== undefined && !ALLOWED_TYPES.includes(f.type)) {
    return { success: false, status: 422, errors: ['Tipo de dieta inválido!'] };
  }

  const query = f.type ? { type: f.type } : {};
  if (f.userId) {
    query.userId = f.userId;
  }

  const page = f.page || 1;
  const limit = f.limit || 10;

  const diets = await DietRepository.findActive(query);

  const total = Array.isArray(diets) ? diets.length : 0;

  return { success: true, status: 200, diets, total, page, limit };
}

module.exports = { listDiets };

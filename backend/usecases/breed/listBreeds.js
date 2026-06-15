const { ALLOWED_SPECIES } = require('../../helpers/validate-breed');

const ALLOWED_SORT_FIELDS = ['name', 'createdAt'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

async function listBreeds({ BreedRepository, filters = {}, pagination = {} }) {
  const f = filters || {};
  const p = pagination || {};

  if (f.species !== undefined && !ALLOWED_SPECIES.includes(f.species)) {
    return { success: false, status: 422, errors: ['Espécie inválida!'] };
  }

  const page = p.page !== undefined ? parseInt(p.page, 10) : DEFAULT_PAGE;
  if (isNaN(page) || page < 1) {
    return { success: false, status: 422, errors: ['page deve ser um número maior que 0!'] };
  }

  const limit = p.limit !== undefined ? parseInt(p.limit, 10) : DEFAULT_LIMIT;
  if (isNaN(limit) || limit < 1 || limit > MAX_LIMIT) {
    return {
      success: false,
      status: 422,
      errors: [`limit deve estar entre 1 e ${MAX_LIMIT}!`],
    };
  }

  const sortBy = ALLOWED_SORT_FIELDS.includes(p.sortBy) ? p.sortBy : 'createdAt';
  const sortOrder = ALLOWED_SORT_ORDERS.includes(p.sortOrder) ? p.sortOrder : 'desc';

  const skip = (page - 1) * limit;
  const query = f.species ? { species: f.species } : {};

  const [breeds, total] = await Promise.all([
    BreedRepository.findActive(query, { skip, limit, sortBy, sortOrder }),
    BreedRepository.countActive(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { success: true, status: 200, breeds, total, page, limit, totalPages };
}

module.exports = { listBreeds };

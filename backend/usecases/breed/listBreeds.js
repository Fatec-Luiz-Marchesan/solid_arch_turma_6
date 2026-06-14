const { ALLOWED_SPECIES } = require('../../helpers/validate-breed');

async function listBreeds({ BreedRepository, filters = {} }) {
  const f = filters || {};

  if (f.species !== undefined && !ALLOWED_SPECIES.includes(f.species)) {
    return { success: false, status: 422, errors: ['Espécie inválida!'] };
  }

  const breeds = await BreedRepository.findActive(
    f.species ? { species: f.species } : {}
  );

  return { success: true, status: 200, breeds };
}

module.exports = { listBreeds };
const { validateBreed, normalizeName } = require('../../helpers/validate-breed');

async function createBreed({ data, user, BreedRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  const validation = validateBreed(data);
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const d = data || {};
  const name = normalizeName(d.name);

  // Uniqueness (case-insensitive) among active breeds
  const existing = await BreedRepository.findByName(name);
  if (existing) {
    return {
      success: false,
      status: 409,
      errors: ['Já existe uma raça com este nome!'],
    };
  }

  const breed = await BreedRepository.create({
    name,
    species: d.species,
    size: d.size || 'medium',
    description: d.description !== undefined ? d.description.trim() : '',
    temperament: Array.isArray(d.temperament)
      ? d.temperament.map((t) => t.trim())
      : [],
    lifeExpectancy:
      typeof d.lifeExpectancy === 'number' ? d.lifeExpectancy : null,
    origin: d.origin !== undefined ? d.origin.trim() : '',
    hypoallergenic:
      typeof d.hypoallergenic === 'boolean' ? d.hypoallergenic : false,
    user: { _id: user._id, name: user.name },
    deletedAt: null,
  });

  return { success: true, status: 201, breed };
}

module.exports = { createBreed };
const { validateBreed, normalizeName } = require('../../helpers/validate-breed');

async function updateBreed({ id, data, user, BreedRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const breed = await BreedRepository.findById(id);
  if (!breed || breed.deletedAt) {
    return { success: false, status: 404, errors: ['Raça não encontrada!'] };
  }

  const validation = validateBreed(data, { partial: true });
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors };
  }

  const d = data || {};
  const updatePayload = {};

  if (d.name !== undefined) {
    const name = normalizeName(d.name);
    // Only check uniqueness if the name actually changes
    if (name.toLowerCase() !== String(breed.name).toLowerCase()) {
      const existing = await BreedRepository.findByName(name);
      if (existing && String(existing._id) !== String(id)) {
        return {
          success: false,
          status: 409,
          errors: ['Já existe uma raça com este nome!'],
        };
      }
    }
    updatePayload.name = name;
  }

  if (d.species !== undefined) updatePayload.species = d.species;
  if (d.size !== undefined) updatePayload.size = d.size;
  if (d.description !== undefined) updatePayload.description = d.description.trim();
  if (d.temperament !== undefined) {
    updatePayload.temperament = d.temperament.map((t) => t.trim());
  }
  if (d.lifeExpectancy !== undefined) {
    updatePayload.lifeExpectancy = d.lifeExpectancy;
  }
  if (d.origin !== undefined) updatePayload.origin = d.origin.trim();
  if (d.hypoallergenic !== undefined) {
    updatePayload.hypoallergenic = d.hypoallergenic;
  }

  const updated = await BreedRepository.update(id, updatePayload);
  return { success: true, status: 200, breed: updated };
}

module.exports = { updateBreed };
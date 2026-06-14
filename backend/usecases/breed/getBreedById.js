async function getBreedById({ id, BreedRepository }) {
  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const breed = await BreedRepository.findById(id);
  if (!breed || breed.deletedAt) {
    return { success: false, status: 404, errors: ['Raça não encontrada!'] };
  }

  return { success: true, status: 200, breed };
}

module.exports = { getBreedById };
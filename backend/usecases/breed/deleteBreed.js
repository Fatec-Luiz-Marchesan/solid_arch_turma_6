async function deleteBreed({ id, user, BreedRepository }) {
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

  await BreedRepository.update(id, { deletedAt: new Date() });
  return { success: true, status: 200, message: 'Raça removida!' };
}

module.exports = { deleteBreed };
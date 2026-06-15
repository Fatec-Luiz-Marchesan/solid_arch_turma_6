async function deleteDiet({ id, user, DietRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] };
  }

  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const diet = await DietRepository.findById(id);
  if (!diet || diet.deletedAt) {
    return { success: false, status: 404, errors: ['Dieta não encontrada!'] };
  }

  await DietRepository.update(id, { deletedAt: new Date() });
  return { success: true, status: 200, message: 'Dieta removida!' };
}

module.exports = { deleteDiet };

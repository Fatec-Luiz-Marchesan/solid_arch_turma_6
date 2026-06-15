async function getDietById({ id, DietRepository }) {
  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] };
  }

  const diet = await DietRepository.findById(id);
  if (!diet || diet.deletedAt) {
    return { success: false, status: 404, errors: ['Dieta não encontrada!'] };
  }

  return { success: true, status: 200, diet };
}

module.exports = { getDietById };

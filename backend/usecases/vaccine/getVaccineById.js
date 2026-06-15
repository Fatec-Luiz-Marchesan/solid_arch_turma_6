async function getVaccineById({ id, user, VaccineRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] }
  }

  if (!id) {
    return { success: false, status: 422, errors: ['ID inválido!'] }
  }

  const vaccine = await VaccineRepository.findById(id)

  if (!vaccine || vaccine.deletedAt) {
    return { success: false, status: 404, errors: ['Vacina não encontrada!'] }
  }

  if (String(vaccine.user._id) !== String(user._id)) {
    return { success: false, status: 403, errors: ['Acesso negado!'] }
  }

  return { success: true, status: 200, vaccine }
}

module.exports = { getVaccineById }

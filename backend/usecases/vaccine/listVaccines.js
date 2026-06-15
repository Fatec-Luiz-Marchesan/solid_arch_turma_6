async function listVaccines({ user, petId, VaccineRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] }
  }

  const vaccines = petId
    ? await VaccineRepository.findActiveByPet(petId)
    : await VaccineRepository.findActiveByUser(user._id)

  return { success: true, status: 200, vaccines }
}

module.exports = { listVaccines }

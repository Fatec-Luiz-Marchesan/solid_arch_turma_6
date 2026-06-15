const { validateVaccine } = require('../../helpers/validate-vaccine')

async function createVaccine({ data, user, VaccineRepository }) {
  if (!user || !user._id) {
    return { success: false, status: 401, errors: ['Usuário não autenticado!'] }
  }

  const validation = validateVaccine(data)
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors }
  }

  const vaccine = await VaccineRepository.create({
    name: data.name.trim(),
    manufacturer: data.manufacturer ? data.manufacturer.trim() : null,
    batchNumber: data.batchNumber ? data.batchNumber.trim() : null,
    applicationDate: new Date(data.applicationDate),
    nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
    dose: data.dose || 1,
    status: data.status || 'applied',
    veterinarian: data.veterinarian ? data.veterinarian.trim() : null,
    notes: data.notes ? data.notes.trim() : null,
    pet: { _id: data.petId, name: data.petName || null },
    user: { _id: user._id, name: user.name },
  })

  return { success: true, status: 201, vaccine }
}

module.exports = { createVaccine }

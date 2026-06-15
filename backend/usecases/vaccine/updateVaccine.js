const { validateVaccineUpdate } = require('../../helpers/validate-vaccine')

async function updateVaccine({ id, data, user, VaccineRepository }) {
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

  const validation = validateVaccineUpdate(data)
  if (!validation.isValid) {
    return { success: false, status: 422, errors: validation.errors }
  }

  const allowedFields = [
    'name',
    'manufacturer',
    'batchNumber',
    'applicationDate',
    'nextDueDate',
    'dose',
    'status',
    'veterinarian',
    'notes',
  ]

  const updates = {}
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field]
    }
  }

  const updated = await VaccineRepository.update(id, updates)

  return { success: true, status: 200, vaccine: updated }
}

module.exports = { updateVaccine }

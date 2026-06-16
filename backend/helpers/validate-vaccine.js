const ALLOWED_STATUS = ['applied', 'scheduled', 'overdue']
const MAX_DOSE = 20
const MAX_NOTES_LENGTH = 1000
const MAX_NAME_LENGTH = 100
const MAX_FIELD_LENGTH = 100
const BATCH_REGEX = /^[A-Za-z0-9\-]{2,50}$/

function validateVaccine(data) {
  const errors = []

  if (!data.name || typeof data.name !== 'string') {
    errors.push('O nome da vacina é obrigatório!')
  } else if (data.name.trim().length === 0) {
    errors.push('O nome da vacina não pode ser vazio!')
  } else if (data.name.trim().length > MAX_NAME_LENGTH) {
    errors.push(`O nome da vacina não pode passar de ${MAX_NAME_LENGTH} caracteres!`)
  }

  if (!data.petId) {
    errors.push('O pet é obrigatório!')
  }

  if (!data.applicationDate) {
    errors.push('A data de aplicação é obrigatória!')
  } else {
    const d = new Date(data.applicationDate)
    if (isNaN(d.getTime())) {
      errors.push('A data de aplicação é inválida!')
    }
  }

  if (data.nextDueDate !== undefined && data.nextDueDate !== null) {
    const d = new Date(data.nextDueDate)
    if (isNaN(d.getTime())) {
      errors.push('A data de próxima dose é inválida!')
    } else if (
      data.applicationDate &&
      !isNaN(new Date(data.applicationDate).getTime()) &&
      d <= new Date(data.applicationDate)
    ) {
      errors.push('A data de próxima dose deve ser posterior à data de aplicação!')
    }
  }

  if (data.dose !== undefined && data.dose !== null) {
    if (!Number.isInteger(data.dose)) {
      errors.push('A dose deve ser um número inteiro!')
    } else if (data.dose < 1 || data.dose > MAX_DOSE) {
      errors.push(`A dose deve estar entre 1 e ${MAX_DOSE}!`)
    }
  }

  if (data.status !== undefined) {
    if (!ALLOWED_STATUS.includes(data.status)) {
      errors.push('Status inválido!')
    }
  }

  if (data.notes && data.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`As observações não podem passar de ${MAX_NOTES_LENGTH} caracteres!`)
  }

  if (data.manufacturer && data.manufacturer.length > MAX_FIELD_LENGTH) {
    errors.push(`O fabricante não pode passar de ${MAX_FIELD_LENGTH} caracteres!`)
  }

  if (data.veterinarian && data.veterinarian.length > MAX_FIELD_LENGTH) {
    errors.push(`O veterinário não pode passar de ${MAX_FIELD_LENGTH} caracteres!`)
  }

  if (data.batchNumber && !BATCH_REGEX.test(data.batchNumber)) {
    errors.push('O número do lote deve ser alfanumérico entre 2 e 50 caracteres!')
  }

  return { isValid: errors.length === 0, errors }
}

function validateVaccineUpdate(data) {
  const errors = []

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('O nome da vacina não pode ser vazio!')
    } else if (data.name.trim().length > MAX_NAME_LENGTH) {
      errors.push(`O nome da vacina não pode passar de ${MAX_NAME_LENGTH} caracteres!`)
    }
  }

  if (data.applicationDate !== undefined) {
    const d = new Date(data.applicationDate)
    if (isNaN(d.getTime())) {
      errors.push('A data de aplicação é inválida!')
    }
  }

  if (data.nextDueDate !== undefined && data.nextDueDate !== null) {
    const d = new Date(data.nextDueDate)
    if (isNaN(d.getTime())) {
      errors.push('A data de próxima dose é inválida!')
    }
  }

  if (data.dose !== undefined && data.dose !== null) {
    if (!Number.isInteger(data.dose)) {
      errors.push('A dose deve ser um número inteiro!')
    } else if (data.dose < 1 || data.dose > MAX_DOSE) {
      errors.push(`A dose deve estar entre 1 e ${MAX_DOSE}!`)
    }
  }

  if (data.status !== undefined) {
    if (!ALLOWED_STATUS.includes(data.status)) {
      errors.push('Status inválido!')
    }
  }

  if (data.notes && data.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`As observações não podem passar de ${MAX_NOTES_LENGTH} caracteres!`)
  }

  if (data.manufacturer && data.manufacturer.length > MAX_FIELD_LENGTH) {
    errors.push(`O fabricante não pode passar de ${MAX_FIELD_LENGTH} caracteres!`)
  }

  if (data.veterinarian && data.veterinarian.length > MAX_FIELD_LENGTH) {
    errors.push(`O veterinário não pode passar de ${MAX_FIELD_LENGTH} caracteres!`)
  }

  if (data.batchNumber && !BATCH_REGEX.test(data.batchNumber)) {
    errors.push('O número do lote deve ser alfanumérico entre 2 e 50 caracteres!')
  }

  return { isValid: errors.length === 0, errors }
}

module.exports = {
  validateVaccine,
  validateVaccineUpdate,
  ALLOWED_STATUS,
  MAX_DOSE,
  MAX_NOTES_LENGTH,
}

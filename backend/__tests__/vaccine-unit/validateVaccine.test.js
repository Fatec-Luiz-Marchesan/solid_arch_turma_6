const { describe, it, expect } = require('@jest/globals')
const { validateVaccine, validateVaccineUpdate } = require('../../helpers/validate-vaccine')

const validBase = {
  name: 'Antirrábica',
  petId: 'pet1',
  applicationDate: '2024-01-10',
}

describe('validateVaccine', () => {
  it('aceita dados mínimos válidos', () => {
    const r = validateVaccine(validBase)
    expect(r.isValid).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  it('aceita dados completos válidos', () => {
    const r = validateVaccine({
      ...validBase,
      manufacturer: 'MSD Saúde Animal',
      batchNumber: 'LOT-2024A',
      nextDueDate: '2025-01-10',
      dose: 2,
      status: 'applied',
      veterinarian: 'Dr. José',
      notes: 'Paciente sem reações adversas.',
    })
    expect(r.isValid).toBe(true)
  })

  describe('name', () => {
    it('rejeita name ausente', () => {
      const r = validateVaccine({ ...validBase, name: undefined })
      expect(r.isValid).toBe(false)
      expect(r.errors).toContain('O nome da vacina é obrigatório!')
    })

    it('rejeita name vazio', () => {
      const r = validateVaccine({ ...validBase, name: '   ' })
      expect(r.isValid).toBe(false)
      expect(r.errors).toContain('O nome da vacina não pode ser vazio!')
    })

    it('rejeita name com mais de 100 caracteres', () => {
      const r = validateVaccine({ ...validBase, name: 'A'.repeat(101) })
      expect(r.isValid).toBe(false)
      expect(r.errors[0]).toMatch(/100 caracteres/)
    })
  })

  describe('petId', () => {
    it('rejeita petId ausente', () => {
      const r = validateVaccine({ ...validBase, petId: undefined })
      expect(r.isValid).toBe(false)
      expect(r.errors).toContain('O pet é obrigatório!')
    })
  })

  describe('applicationDate', () => {
    it('rejeita applicationDate ausente', () => {
      const r = validateVaccine({ ...validBase, applicationDate: undefined })
      expect(r.isValid).toBe(false)
      expect(r.errors).toContain('A data de aplicação é obrigatória!')
    })

    it('rejeita applicationDate inválida', () => {
      const r = validateVaccine({ ...validBase, applicationDate: 'nao-e-data' })
      expect(r.isValid).toBe(false)
      expect(r.errors).toContain('A data de aplicação é inválida!')
    })
  })

  describe('nextDueDate', () => {
    it('rejeita nextDueDate inválida', () => {
      const r = validateVaccine({ ...validBase, nextDueDate: 'invalido' })
      expect(r.isValid).toBe(false)
      expect(r.errors).toContain('A data de próxima dose é inválida!')
    })

    it('rejeita nextDueDate anterior à applicationDate', () => {
      const r = validateVaccine({
        ...validBase,
        applicationDate: '2024-06-01',
        nextDueDate: '2024-05-01',
      })
      expect(r.isValid).toBe(false)
      expect(r.errors).toContain(
        'A data de próxima dose deve ser posterior à data de aplicação!'
      )
    })

    it('aceita nextDueDate nulo', () => {
      const r = validateVaccine({ ...validBase, nextDueDate: null })
      expect(r.isValid).toBe(true)
    })
  })

  describe('dose', () => {
    it('rejeita dose não inteira', () => {
      const r = validateVaccine({ ...validBase, dose: 1.5 })
      expect(r.isValid).toBe(false)
      expect(r.errors).toContain('A dose deve ser um número inteiro!')
    })

    it('rejeita dose menor que 1', () => {
      const r = validateVaccine({ ...validBase, dose: 0 })
      expect(r.isValid).toBe(false)
      expect(r.errors[0]).toMatch(/dose deve estar entre 1 e/)
    })

    it('rejeita dose maior que 20', () => {
      const r = validateVaccine({ ...validBase, dose: 21 })
      expect(r.isValid).toBe(false)
      expect(r.errors[0]).toMatch(/dose deve estar entre 1 e/)
    })

    it('aceita dose 1', () => {
      const r = validateVaccine({ ...validBase, dose: 1 })
      expect(r.isValid).toBe(true)
    })

    it('aceita dose 20', () => {
      const r = validateVaccine({ ...validBase, dose: 20 })
      expect(r.isValid).toBe(true)
    })
  })

  describe('status', () => {
    it('rejeita status inválido', () => {
      const r = validateVaccine({ ...validBase, status: 'invalido' })
      expect(r.isValid).toBe(false)
      expect(r.errors).toContain('Status inválido!')
    })

    it('aceita todos os status válidos', () => {
      for (const s of ['applied', 'scheduled', 'overdue']) {
        const r = validateVaccine({ ...validBase, status: s })
        expect(r.isValid).toBe(true)
      }
    })
  })

  describe('notes', () => {
    it('rejeita notes com mais de 1000 caracteres', () => {
      const r = validateVaccine({ ...validBase, notes: 'A'.repeat(1001) })
      expect(r.isValid).toBe(false)
      expect(r.errors[0]).toMatch(/1000 caracteres/)
    })
  })

  describe('batchNumber', () => {
    it('rejeita batchNumber com formato inválido', () => {
      const r = validateVaccine({ ...validBase, batchNumber: 'a' })
      expect(r.isValid).toBe(false)
      expect(r.errors).toContain(
        'O número do lote deve ser alfanumérico entre 2 e 50 caracteres!'
      )
    })

    it('aceita batchNumber válido', () => {
      const r = validateVaccine({ ...validBase, batchNumber: 'LOT2024' })
      expect(r.isValid).toBe(true)
    })
  })

  describe('manufacturer', () => {
    it('rejeita manufacturer com mais de 100 caracteres', () => {
      const r = validateVaccine({ ...validBase, manufacturer: 'A'.repeat(101) })
      expect(r.isValid).toBe(false)
      expect(r.errors[0]).toMatch(/fabricante/)
    })
  })

  describe('veterinarian', () => {
    it('rejeita veterinarian com mais de 100 caracteres', () => {
      const r = validateVaccine({ ...validBase, veterinarian: 'A'.repeat(101) })
      expect(r.isValid).toBe(false)
      expect(r.errors[0]).toMatch(/veterinário/)
    })
  })
})

describe('validateVaccineUpdate', () => {
  it('aceita objeto vazio (sem campos obrigatórios)', () => {
    const r = validateVaccineUpdate({})
    expect(r.isValid).toBe(true)
  })

  it('rejeita name vazio', () => {
    const r = validateVaccineUpdate({ name: '' })
    expect(r.isValid).toBe(false)
    expect(r.errors).toContain('O nome da vacina não pode ser vazio!')
  })

  it('rejeita name com mais de 100 caracteres', () => {
    const r = validateVaccineUpdate({ name: 'A'.repeat(101) })
    expect(r.isValid).toBe(false)
    expect(r.errors[0]).toMatch(/100 caracteres/)
  })

  it('rejeita applicationDate inválida', () => {
    const r = validateVaccineUpdate({ applicationDate: 'nao-e-data' })
    expect(r.isValid).toBe(false)
    expect(r.errors).toContain('A data de aplicação é inválida!')
  })

  it('aceita applicationDate válida', () => {
    const r = validateVaccineUpdate({ applicationDate: '2024-06-01' })
    expect(r.isValid).toBe(true)
  })

  it('rejeita nextDueDate inválida', () => {
    const r = validateVaccineUpdate({ nextDueDate: 'invalido' })
    expect(r.isValid).toBe(false)
    expect(r.errors).toContain('A data de próxima dose é inválida!')
  })

  it('aceita nextDueDate nula', () => {
    const r = validateVaccineUpdate({ nextDueDate: null })
    expect(r.isValid).toBe(true)
  })

  it('rejeita dose não inteira', () => {
    const r = validateVaccineUpdate({ dose: 1.5 })
    expect(r.isValid).toBe(false)
    expect(r.errors).toContain('A dose deve ser um número inteiro!')
  })

  it('rejeita dose fora do intervalo', () => {
    const r = validateVaccineUpdate({ dose: 0 })
    expect(r.isValid).toBe(false)
    expect(r.errors[0]).toMatch(/dose deve estar entre/)
  })

  it('rejeita notes com mais de 1000 caracteres', () => {
    const r = validateVaccineUpdate({ notes: 'A'.repeat(1001) })
    expect(r.isValid).toBe(false)
    expect(r.errors[0]).toMatch(/1000 caracteres/)
  })

  it('rejeita manufacturer com mais de 100 caracteres', () => {
    const r = validateVaccineUpdate({ manufacturer: 'A'.repeat(101) })
    expect(r.isValid).toBe(false)
    expect(r.errors[0]).toMatch(/fabricante/)
  })

  it('rejeita veterinarian com mais de 100 caracteres', () => {
    const r = validateVaccineUpdate({ veterinarian: 'A'.repeat(101) })
    expect(r.isValid).toBe(false)
    expect(r.errors[0]).toMatch(/veterinário/)
  })

  it('rejeita batchNumber com formato inválido', () => {
    const r = validateVaccineUpdate({ batchNumber: 'x' })
    expect(r.isValid).toBe(false)
    expect(r.errors).toContain(
      'O número do lote deve ser alfanumérico entre 2 e 50 caracteres!'
    )
  })

  it('rejeita status inválido', () => {
    const r = validateVaccineUpdate({ status: 'errado' })
    expect(r.isValid).toBe(false)
    expect(r.errors).toContain('Status inválido!')
  })

  it('aceita atualização parcial válida', () => {
    const r = validateVaccineUpdate({ status: 'overdue', notes: 'Atualizado.' })
    expect(r.isValid).toBe(true)
  })

  it('aceita todos os status válidos em update', () => {
    for (const s of ['applied', 'scheduled', 'overdue']) {
      const r = validateVaccineUpdate({ status: s })
      expect(r.isValid).toBe(true)
    }
  })
})

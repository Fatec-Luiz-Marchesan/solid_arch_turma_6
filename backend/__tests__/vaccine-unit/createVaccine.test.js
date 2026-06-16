const { describe, it, expect, beforeEach } = require('@jest/globals')
const { createVaccine } = require('../../usecases/vaccine/createVaccine')

const makeRepo = () => ({
  create: jest.fn(async (d) => ({ _id: 'vac1', ...d })),
})

const validData = {
  name: 'Antirrábica',
  petId: 'pet1',
  petName: 'Rex',
  applicationDate: '2024-06-01',
}

const validUser = { _id: 'u1', name: 'Maria' }

describe('createVaccine use case', () => {
  let repo

  beforeEach(() => {
    repo = makeRepo()
  })

  it('cria vacina com dados mínimos válidos', async () => {
    const r = await createVaccine({ data: validData, user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(true)
    expect(r.status).toBe(201)
    expect(repo.create).toHaveBeenCalledTimes(1)
    expect(repo.create.mock.calls[0][0]).toMatchObject({
      name: 'Antirrábica',
      dose: 1,
      status: 'applied',
    })
  })

  it('cria vacina com todos os campos opcionais', async () => {
    const r = await createVaccine({
      data: {
        ...validData,
        manufacturer: 'MSD',
        batchNumber: 'LOT2024',
        nextDueDate: '2025-06-01',
        dose: 2,
        status: 'applied',
        veterinarian: 'Dr. Carlos',
        notes: 'Sem reações.',
      },
      user: validUser,
      VaccineRepository: repo,
    })
    expect(r.success).toBe(true)
    expect(repo.create.mock.calls[0][0]).toMatchObject({ dose: 2, manufacturer: 'MSD' })
  })

  it('retorna 401 sem usuário autenticado', async () => {
    const r = await createVaccine({ data: validData, user: null, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(401)
    expect(repo.create).not.toHaveBeenCalled()
  })

  it('retorna 401 com usuário sem _id', async () => {
    const r = await createVaccine({ data: validData, user: {}, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(401)
  })

  it('retorna 422 com dados inválidos (sem name)', async () => {
    const r = await createVaccine({
      data: { ...validData, name: undefined },
      user: validUser,
      VaccineRepository: repo,
    })
    expect(r.success).toBe(false)
    expect(r.status).toBe(422)
    expect(r.errors).toContain('O nome da vacina é obrigatório!')
    expect(repo.create).not.toHaveBeenCalled()
  })

  it('retorna 422 sem petId', async () => {
    const r = await createVaccine({
      data: { ...validData, petId: undefined },
      user: validUser,
      VaccineRepository: repo,
    })
    expect(r.success).toBe(false)
    expect(r.status).toBe(422)
  })

  it('retorna 422 sem applicationDate', async () => {
    const r = await createVaccine({
      data: { ...validData, applicationDate: undefined },
      user: validUser,
      VaccineRepository: repo,
    })
    expect(r.success).toBe(false)
    expect(r.status).toBe(422)
  })

  it('aplica trim no name antes de salvar', async () => {
    await createVaccine({
      data: { ...validData, name: '  Antirrábica  ' },
      user: validUser,
      VaccineRepository: repo,
    })
    expect(repo.create.mock.calls[0][0].name).toBe('Antirrábica')
  })

  it('usa status padrão "applied" quando não informado', async () => {
    await createVaccine({ data: validData, user: validUser, VaccineRepository: repo })
    expect(repo.create.mock.calls[0][0].status).toBe('applied')
  })

  it('embute dados do user no documento', async () => {
    await createVaccine({ data: validData, user: validUser, VaccineRepository: repo })
    expect(repo.create.mock.calls[0][0].user).toEqual({ _id: 'u1', name: 'Maria' })
  })
})

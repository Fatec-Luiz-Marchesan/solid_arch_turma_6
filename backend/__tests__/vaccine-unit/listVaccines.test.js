const { describe, it, expect, beforeEach } = require('@jest/globals')
const { listVaccines } = require('../../usecases/vaccine/listVaccines')

const makeRepo = (vaccines = []) => ({
  findActiveByUser: jest.fn(async () => vaccines),
  findActiveByPet: jest.fn(async () => vaccines),
})

const validUser = { _id: 'u1', name: 'Maria' }

describe('listVaccines use case', () => {
  let repo

  beforeEach(() => {
    repo = makeRepo([{ _id: 'v1', name: 'Antirrábica' }])
  })

  it('lista vacinas do usuário quando não há petId', async () => {
    const r = await listVaccines({ user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(true)
    expect(r.status).toBe(200)
    expect(repo.findActiveByUser).toHaveBeenCalledWith('u1')
    expect(repo.findActiveByPet).not.toHaveBeenCalled()
    expect(r.vaccines).toHaveLength(1)
  })

  it('lista vacinas por pet quando petId é informado', async () => {
    const r = await listVaccines({
      user: validUser,
      petId: 'pet1',
      VaccineRepository: repo,
    })
    expect(r.success).toBe(true)
    expect(repo.findActiveByPet).toHaveBeenCalledWith('pet1')
    expect(repo.findActiveByUser).not.toHaveBeenCalled()
  })

  it('retorna 401 sem usuário autenticado', async () => {
    const r = await listVaccines({ user: null, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(401)
    expect(repo.findActiveByUser).not.toHaveBeenCalled()
  })

  it('retorna 401 com usuário sem _id', async () => {
    const r = await listVaccines({ user: {}, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(401)
  })

  it('retorna lista vazia sem erros', async () => {
    repo = makeRepo([])
    const r = await listVaccines({ user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(true)
    expect(r.vaccines).toHaveLength(0)
  })
})

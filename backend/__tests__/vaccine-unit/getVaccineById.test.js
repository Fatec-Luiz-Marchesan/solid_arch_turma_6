const { describe, it, expect, beforeEach } = require('@jest/globals')
const { getVaccineById } = require('../../usecases/vaccine/getVaccineById')

const makeRepo = (vaccine) => ({
  findById: jest.fn(async () => vaccine),
})

const validUser = { _id: 'u1', name: 'Maria' }

const existingVaccine = {
  _id: 'vac1',
  name: 'Antirrábica',
  deletedAt: null,
  user: { _id: 'u1', name: 'Maria' },
}

describe('getVaccineById use case', () => {
  it('retorna vacina com dados válidos', async () => {
    const repo = makeRepo(existingVaccine)
    const r = await getVaccineById({ id: 'vac1', user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(true)
    expect(r.status).toBe(200)
    expect(r.vaccine).toBe(existingVaccine)
  })

  it('retorna 401 sem usuário', async () => {
    const repo = makeRepo(existingVaccine)
    const r = await getVaccineById({ id: 'vac1', user: null, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(401)
    expect(repo.findById).not.toHaveBeenCalled()
  })

  it('retorna 422 sem id', async () => {
    const repo = makeRepo(existingVaccine)
    const r = await getVaccineById({ id: undefined, user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(422)
    expect(repo.findById).not.toHaveBeenCalled()
  })

  it('retorna 404 quando vacina não encontrada', async () => {
    const repo = makeRepo(null)
    const r = await getVaccineById({ id: 'vac-inexistente', user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(404)
    expect(r.errors).toContain('Vacina não encontrada!')
  })

  it('retorna 404 quando vacina está deletada', async () => {
    const repo = makeRepo({ ...existingVaccine, deletedAt: new Date() })
    const r = await getVaccineById({ id: 'vac1', user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(404)
  })

  it('retorna 403 quando usuário não é dono', async () => {
    const repo = makeRepo(existingVaccine)
    const r = await getVaccineById({
      id: 'vac1',
      user: { _id: 'outro-user', name: 'João' },
      VaccineRepository: repo,
    })
    expect(r.success).toBe(false)
    expect(r.status).toBe(403)
    expect(r.errors).toContain('Acesso negado!')
  })
})

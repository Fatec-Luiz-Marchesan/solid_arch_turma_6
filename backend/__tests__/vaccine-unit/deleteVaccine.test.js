const { describe, it, expect, beforeEach } = require('@jest/globals')
const { deleteVaccine } = require('../../usecases/vaccine/deleteVaccine')

const existingVaccine = {
  _id: 'vac1',
  name: 'Antirrábica',
  deletedAt: null,
  user: { _id: 'u1', name: 'Maria' },
}

const makeRepo = (vaccine = existingVaccine) => ({
  findById: jest.fn(async () => vaccine),
  update: jest.fn(async (id, data) => ({ ...vaccine, ...data })),
})

const validUser = { _id: 'u1', name: 'Maria' }

describe('deleteVaccine use case', () => {
  it('faz soft delete com sucesso', async () => {
    const repo = makeRepo()
    const r = await deleteVaccine({ id: 'vac1', user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(true)
    expect(r.status).toBe(200)
    expect(r.message).toBe('Vacina removida com sucesso!')
    expect(repo.update).toHaveBeenCalledWith('vac1', expect.objectContaining({ deletedAt: expect.any(Date) }))
  })

  it('retorna 401 sem usuário', async () => {
    const repo = makeRepo()
    const r = await deleteVaccine({ id: 'vac1', user: null, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(401)
    expect(repo.findById).not.toHaveBeenCalled()
  })

  it('retorna 422 sem id', async () => {
    const repo = makeRepo()
    const r = await deleteVaccine({ id: undefined, user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(422)
  })

  it('retorna 404 quando vacina não existe', async () => {
    const repo = makeRepo(null)
    const r = await deleteVaccine({ id: 'vac-x', user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(404)
  })

  it('retorna 404 quando vacina já está deletada', async () => {
    const repo = makeRepo({ ...existingVaccine, deletedAt: new Date() })
    const r = await deleteVaccine({ id: 'vac1', user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(404)
  })

  it('retorna 403 quando usuário não é dono', async () => {
    const repo = makeRepo()
    const r = await deleteVaccine({
      id: 'vac1',
      user: { _id: 'outro', name: 'João' },
      VaccineRepository: repo,
    })
    expect(r.success).toBe(false)
    expect(r.status).toBe(403)
    expect(r.errors).toContain('Acesso negado!')
    expect(repo.update).not.toHaveBeenCalled()
  })
})

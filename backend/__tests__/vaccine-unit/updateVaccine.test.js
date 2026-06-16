const { describe, it, expect, beforeEach } = require('@jest/globals')
const { updateVaccine } = require('../../usecases/vaccine/updateVaccine')

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

describe('updateVaccine use case', () => {
  it('atualiza vacina com dados válidos', async () => {
    const repo = makeRepo()
    const r = await updateVaccine({
      id: 'vac1',
      data: { status: 'overdue', notes: 'Atrasada.' },
      user: validUser,
      VaccineRepository: repo,
    })
    expect(r.success).toBe(true)
    expect(r.status).toBe(200)
    expect(repo.update).toHaveBeenCalledWith('vac1', { status: 'overdue', notes: 'Atrasada.' })
  })

  it('retorna 401 sem usuário', async () => {
    const repo = makeRepo()
    const r = await updateVaccine({ id: 'vac1', data: {}, user: null, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(401)
    expect(repo.findById).not.toHaveBeenCalled()
  })

  it('retorna 422 sem id', async () => {
    const repo = makeRepo()
    const r = await updateVaccine({ id: undefined, data: {}, user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(422)
  })

  it('retorna 404 quando vacina não existe', async () => {
    const repo = makeRepo(null)
    const r = await updateVaccine({ id: 'vac-x', data: { status: 'overdue' }, user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(404)
  })

  it('retorna 404 quando vacina deletada', async () => {
    const repo = makeRepo({ ...existingVaccine, deletedAt: new Date() })
    const r = await updateVaccine({ id: 'vac1', data: { status: 'overdue' }, user: validUser, VaccineRepository: repo })
    expect(r.success).toBe(false)
    expect(r.status).toBe(404)
  })

  it('retorna 403 quando usuário não é dono', async () => {
    const repo = makeRepo()
    const r = await updateVaccine({
      id: 'vac1',
      data: { status: 'overdue' },
      user: { _id: 'outro', name: 'João' },
      VaccineRepository: repo,
    })
    expect(r.success).toBe(false)
    expect(r.status).toBe(403)
  })

  it('retorna 422 com dados inválidos', async () => {
    const repo = makeRepo()
    const r = await updateVaccine({
      id: 'vac1',
      data: { status: 'invalido' },
      user: validUser,
      VaccineRepository: repo,
    })
    expect(r.success).toBe(false)
    expect(r.status).toBe(422)
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('ignora campos não permitidos no update', async () => {
    const repo = makeRepo()
    await updateVaccine({
      id: 'vac1',
      data: { status: 'overdue', petId: 'novo-pet', user: { _id: 'hacker' } },
      user: validUser,
      VaccineRepository: repo,
    })
    const updateArgs = repo.update.mock.calls[0][1]
    expect(updateArgs).not.toHaveProperty('petId')
    expect(updateArgs).not.toHaveProperty('user')
  })
})

const { describe, it, expect, beforeEach } = require('@jest/globals')

jest.mock('../../helpers/get-token', () => () => 'fake-token')
jest.mock('../../helpers/get-user-by-token', () => jest.fn())
jest.mock('../../usecases/vaccine/createVaccine', () => ({ createVaccine: jest.fn() }))
jest.mock('../../usecases/vaccine/listVaccines', () => ({ listVaccines: jest.fn() }))
jest.mock('../../usecases/vaccine/getVaccineById', () => ({ getVaccineById: jest.fn() }))
jest.mock('../../usecases/vaccine/updateVaccine', () => ({ updateVaccine: jest.fn() }))
jest.mock('../../usecases/vaccine/deleteVaccine', () => ({ deleteVaccine: jest.fn() }))

const getUserByToken = require('../../helpers/get-user-by-token')
const { createVaccine } = require('../../usecases/vaccine/createVaccine')
const { listVaccines } = require('../../usecases/vaccine/listVaccines')
const { getVaccineById } = require('../../usecases/vaccine/getVaccineById')
const { updateVaccine } = require('../../usecases/vaccine/updateVaccine')
const { deleteVaccine } = require('../../usecases/vaccine/deleteVaccine')
const VaccineController = require('../../controllers/VaccineController')
const {
  setRepository,
  resetRepository,
} = require('../../controllers/VaccineController')

const makeRes = () => {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  return res
}

const fakeUser = { _id: 'u1', name: 'Maria' }

describe('VaccineController — testes de unidade', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getUserByToken.mockResolvedValue(fakeUser)
  })

  describe('create', () => {
    it('retorna 201 com sucesso', async () => {
      createVaccine.mockResolvedValueOnce({
        success: true,
        status: 201,
        vaccine: { _id: 'v1', name: 'Antirrábica' },
      })
      const req = { body: { name: 'Antirrábica', petId: 'p1', applicationDate: '2024-06-01' } }
      const res = makeRes()

      await VaccineController.create(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Vacina registrada com sucesso!' })
      )
    })

    it('retorna erro quando use case falha (422)', async () => {
      createVaccine.mockResolvedValueOnce({
        success: false,
        status: 422,
        errors: ['O nome da vacina é obrigatório!'],
      })
      const req = { body: {} }
      const res = makeRes()

      await VaccineController.create(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith({ message: 'O nome da vacina é obrigatório!' })
    })

    it('retorna 401 quando use case retorna não autenticado', async () => {
      createVaccine.mockResolvedValueOnce({
        success: false,
        status: 401,
        errors: ['Usuário não autenticado!'],
      })
      const req = { body: {} }
      const res = makeRes()

      await VaccineController.create(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })
  })

  describe('list', () => {
    it('retorna 200 com lista de vacinas', async () => {
      listVaccines.mockResolvedValueOnce({
        success: true,
        status: 200,
        vaccines: [{ _id: 'v1' }, { _id: 'v2' }],
      })
      const req = { query: {} }
      const res = makeRes()

      await VaccineController.list(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ vaccines: [{ _id: 'v1' }, { _id: 'v2' }] })
    })

    it('retorna 401 quando use case falha', async () => {
      listVaccines.mockResolvedValueOnce({
        success: false,
        status: 401,
        errors: ['Usuário não autenticado!'],
      })
      const req = { query: {} }
      const res = makeRes()

      await VaccineController.list(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('passa petId para o use case quando informado na query', async () => {
      listVaccines.mockResolvedValueOnce({ success: true, status: 200, vaccines: [] })
      const req = { query: { petId: 'pet1' } }
      const res = makeRes()

      await VaccineController.list(req, res)

      expect(listVaccines).toHaveBeenCalledWith(
        expect.objectContaining({ petId: 'pet1' })
      )
    })
  })

  describe('getById', () => {
    it('retorna 200 com vacina encontrada', async () => {
      getVaccineById.mockResolvedValueOnce({
        success: true,
        status: 200,
        vaccine: { _id: 'v1', name: 'Antirrábica' },
      })
      const req = { params: { id: 'v1' } }
      const res = makeRes()

      await VaccineController.getById(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ vaccine: expect.objectContaining({ _id: 'v1' }) })
    })

    it('retorna 404 quando vacina não encontrada', async () => {
      getVaccineById.mockResolvedValueOnce({
        success: false,
        status: 404,
        errors: ['Vacina não encontrada!'],
      })
      const req = { params: { id: 'vac-x' } }
      const res = makeRes()

      await VaccineController.getById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('retorna 403 quando acesso negado', async () => {
      getVaccineById.mockResolvedValueOnce({
        success: false,
        status: 403,
        errors: ['Acesso negado!'],
      })
      const req = { params: { id: 'v1' } }
      const res = makeRes()

      await VaccineController.getById(req, res)

      expect(res.status).toHaveBeenCalledWith(403)
    })
  })

  describe('update', () => {
    it('retorna 200 quando atualiza com sucesso', async () => {
      updateVaccine.mockResolvedValueOnce({
        success: true,
        status: 200,
        vaccine: { _id: 'v1', status: 'overdue' },
      })
      const req = { params: { id: 'v1' }, body: { status: 'overdue' } }
      const res = makeRes()

      await VaccineController.update(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Vacina atualizada com sucesso!' })
      )
    })

    it('retorna erro quando use case falha', async () => {
      updateVaccine.mockResolvedValueOnce({
        success: false,
        status: 422,
        errors: ['Status inválido!'],
      })
      const req = { params: { id: 'v1' }, body: { status: 'errado' } }
      const res = makeRes()

      await VaccineController.update(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
    })
  })

  describe('delete', () => {
    it('retorna 200 quando deleta com sucesso', async () => {
      deleteVaccine.mockResolvedValueOnce({
        success: true,
        status: 200,
        message: 'Vacina removida com sucesso!',
      })
      const req = { params: { id: 'v1' } }
      const res = makeRes()

      await VaccineController.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ message: 'Vacina removida com sucesso!' })
    })

    it('retorna 403 quando acesso negado', async () => {
      deleteVaccine.mockResolvedValueOnce({
        success: false,
        status: 403,
        errors: ['Acesso negado!'],
      })
      const req = { params: { id: 'v1' } }
      const res = makeRes()

      await VaccineController.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(403)
    })

    it('retorna 404 quando vacina não existe', async () => {
      deleteVaccine.mockResolvedValueOnce({
        success: false,
        status: 404,
        errors: ['Vacina não encontrada!'],
      })
      const req = { params: { id: 'vac-x' } }
      const res = makeRes()

      await VaccineController.delete(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('setRepository / resetRepository', () => {
    it('setRepository substitui o repositório ativo', () => {
      const fakeRepo = { create: jest.fn(), findById: jest.fn() }
      expect(() => setRepository(fakeRepo)).not.toThrow()
    })

    it('setRepository com null usa o repositório padrão', () => {
      expect(() => setRepository(null)).not.toThrow()
    })

    it('resetRepository restaura o repositório padrão sem erros', () => {
      expect(() => resetRepository()).not.toThrow()
    })
  })
})

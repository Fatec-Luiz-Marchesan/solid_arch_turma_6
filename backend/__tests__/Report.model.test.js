/**
 * __tests__/Report.model.test.js
 *
 * Testes unitários do Model Report. Quer dizer que ele vai testar unidade por unidade!
 * TDD: valida que o schema Mongoose reforça (enforça é um termo meio do inglês, fica com muita
 * cara de faria limer, eu acho feio) as regras de negócio no nível
 * de persistência, independente do Controller/Use Case.
 */

const { connectTestDb, disconnectTestDb, clearTestDb } = require('./testDb')
const { Report, REASONS, STATUS } = require('../models/Report')
const mongoose = require('mongoose')

beforeAll(connectTestDb)
afterEach(clearTestDb)
afterAll(disconnectTestDb)

// Dados válidos de base para reutilizar nos testes então se já estão aqui, usar novamente!
const validReportData = () => ({
  reason: 'maus-tratos',
  description: 'Descrição com pelo menos dez caracteres.',
  targetType: 'pet',
  targetId: new mongoose.Types.ObjectId(),
  reporter: {
    _id: new mongoose.Types.ObjectId(),
    name: 'Usuário Teste',
  },
})

describe('Report Model - campos obrigatórios', () => {
  test('salva um reporte válido com sucesso', async () => {
    const report = new Report(validReportData())
    const saved  = await report.save()

    expect(saved._id).toBeDefined()
    expect(saved.status).toBe('open') // default
    expect(saved.createdAt).toBeDefined()
  })

  test('falha sem reason', async () => {
    const data = validReportData()
    delete data.reason
    await expect(new Report(data).save()).rejects.toThrow(/reason/)
  })

  test('falha sem description', async () => {
    const data = validReportData()
    delete data.description
    await expect(new Report(data).save()).rejects.toThrow(/description/)
  })

  test('falha sem targetType', async () => {
    const data = validReportData()
    delete data.targetType
    await expect(new Report(data).save()).rejects.toThrow(/targetType/)
  })

  test('falha sem targetId', async () => {
    const data = validReportData()
    delete data.targetId
    await expect(new Report(data).save()).rejects.toThrow(/targetId/)
  })

  test('falha sem reporter._id', async () => {
    const data = validReportData()
    delete data.reporter._id
    await expect(new Report(data).save()).rejects.toThrow()
  })
})

describe('Report Model - enums', () => {
  test('rejeita reason fora do enum', async () => {
    const data = { ...validReportData(), reason: 'motivo-invalido' }
    await expect(new Report(data).save()).rejects.toThrow(/reason/)
  })

  test('rejeita targetType fora do enum', async () => {
    const data = { ...validReportData(), targetType: 'comentario' }
    await expect(new Report(data).save()).rejects.toThrow(/targetType/)
  })

  test('rejeita status fora do enum', async () => {
    const data = { ...validReportData(), status: 'invalido' }
    await expect(new Report(data).save()).rejects.toThrow(/status/)
  })

  test('REASONS exporta todos os motivos esperados', () => {
    expect(REASONS).toEqual(
      expect.arrayContaining([
        'maus-tratos',
        'informacao-falsa',
        'spam',
        'comportamento-abusivo',
        'outro',
      ]),
    )
  })

  test('STATUS exporta todos os estados esperados', () => {
    expect(STATUS).toEqual(
      expect.arrayContaining(['open', 'reviewing', 'resolved', 'dismissed']),
    )
  })
})

describe('Report Model - comprimento da description', () => {
  test('rejeita description com menos de 10 caracteres', async () => {
    const data = { ...validReportData(), description: 'curto' }
    await expect(new Report(data).save()).rejects.toThrow(/description/)
  })

  test('rejeita description com mais de 1000 caracteres', async () => {
    const data = { ...validReportData(), description: 'a'.repeat(1001) }
    await expect(new Report(data).save()).rejects.toThrow(/description/)
  })

  test('aceita description exatamente no limite mínimo (10 chars)', async () => {
    const data = { ...validReportData(), description: '1234567890' }
    const saved = await new Report(data).save()
    expect(saved._id).toBeDefined()
  })
})

describe('Report Model - targetType user', () => {
  test('salva reporte com targetType user', async () => {
    const data = { ...validReportData(), targetType: 'user' }
    const saved = await new Report(data).save()
    expect(saved.targetType).toBe('user')
  })
})

/**
 * __tests__/Report.usecases.test.js
 *
 * Testes unitários dos Use Cases de Report.
 * TDD: testa as regras de negócio isoladas do Express.
 * Todos automatizados, pra você não ter que ficar digitando!
 */

const { connectTestDb, disconnectTestDb, clearTestDb } = require('./testDb')
const { Report } = require('../models/Report')
const createReport       = require('../usecases/CreateReport')
const listReports        = require('../usecases/ListReports')
const updateReportStatus = require('../usecases/UpdateReportStatus')
const mongoose = require('mongoose')

beforeAll(connectTestDb)
afterEach(clearTestDb)
afterAll(disconnectTestDb)

const fakeReporter = () => ({
  _id: new mongoose.Types.ObjectId(),
  name: 'Maria Silva',
})

const fakePetId = () => new mongoose.Types.ObjectId().toString()

// ─── CreateReport ──────────────────────────────────────────────────────────────

describe('CreateReport', () => {
  test('cria um reporte válido e persiste no banco', async () => {
    const reporter = fakeReporter()
    const targetId = fakePetId()

    const report = await createReport.execute({
      reason: 'spam',
      description: 'Anuncio duplicado repetidamente.',
      targetType: 'pet',
      targetId,
      reporter,
    })

    expect(report._id).toBeDefined()
    expect(report.reason).toBe('spam')
    expect(report.status).toBe('open')
    expect(report.reporter.name).toBe('Maria Silva')
  })

  test('lança erro se usuário tenta reportar a si mesmo', async () => {
    const reporter = fakeReporter()

    await expect(
      createReport.execute({
        reason: 'outro',
        description: 'Tentando se reportar por algum motivo.',
        targetType: 'user',
        targetId: reporter._id.toString(),
        reporter,
      }),
    ).rejects.toThrow('Você não pode reportar a si mesmo.')
  })

  test('permite reportar outro usuário', async () => {
    const reporter = fakeReporter()
    const outroUserId = fakePetId()

    const report = await createReport.execute({
      reason: 'comportamento-abusivo',
      description: 'Mensagens ofensivas repetidas.',
      targetType: 'user',
      targetId: outroUserId,
      reporter,
    })

    expect(report.targetType).toBe('user')
    expect(report._id).toBeDefined()
  })

  test('lança erro do Mongoose para reason inválida', async () => {
    await expect(
      createReport.execute({
        reason: 'motivo-inexistente',
        description: 'Alguma descrição válida aqui.',
        targetType: 'pet',
        targetId: fakePetId(),
        reporter: fakeReporter(),
      }),
    ).rejects.toThrow()
  })
})

// ─── ListReports ───────────────────────────────────────────────────────────────

describe('ListReports', () => {
  const seedReports = async () => {
    const petId  = new mongoose.Types.ObjectId()
    const userId = new mongoose.Types.ObjectId()

    await Report.create([
      {
        reason: 'spam',
        description: 'Primeiro reporte de spam sobre pet.',
        targetType: 'pet',
        targetId: petId,
        reporter: { _id: new mongoose.Types.ObjectId(), name: 'Ana' },
        status: 'open',
      },
      {
        reason: 'maus-tratos',
        description: 'Segundo reporte sobre usuario especifico.',
        targetType: 'user',
        targetId: userId,
        reporter: { _id: new mongoose.Types.ObjectId(), name: 'Carlos' },
        status: 'resolved',
      },
      {
        reason: 'informacao-falsa',
        description: 'Terceiro reporte com informacoes incorretas.',
        targetType: 'pet',
        targetId: petId,
        reporter: { _id: new mongoose.Types.ObjectId(), name: 'Bruno' },
        status: 'open',
      },
    ])

    return { petId, userId }
  }

  test('retorna todos os reportes sem filtro', async () => {
    await seedReports()
    const reports = await listReports.execute()
    expect(reports).toHaveLength(3)
  })

  test('filtra por targetType', async () => {
    await seedReports()
    const reports = await listReports.execute({ targetType: 'pet' })
    expect(reports).toHaveLength(2)
    reports.forEach((r) => expect(r.targetType).toBe('pet'))
  })

  test('filtra por status', async () => {
    await seedReports()
    const reports = await listReports.execute({ status: 'resolved' })
    expect(reports).toHaveLength(1)
    expect(reports[0].status).toBe('resolved')
  })

  test('filtra por targetId', async () => {
    const { petId } = await seedReports()
    const reports = await listReports.execute({ targetId: petId.toString() })
    expect(reports).toHaveLength(2)
  })

  test('retorna lista vazia quando nao ha reportes', async () => {
    const reports = await listReports.execute()
    expect(reports).toHaveLength(0)
  })

  test('retorna ordenado por mais recente (createdAt desc)', async () => {
    await seedReports()
    const reports = await listReports.execute()
    // O terceiro criado deve ser o primeiro da lista
    expect(reports[0].reason).toBe('informacao-falsa')
  })

  // --- Segurança: prevenção de NoSQL injection (CodeQL js/sql-injection) --- parte do Cebolão!

  test('ignora targetType que não seja string (objeto de operador Mongo)', async () => {
    await seedReports()
    const reports = await listReports.execute({
      targetType: { $ne: null }, // tentativa de injection via objeto
    })
    // Filtro inválido é descartado -> comporta-se como "sem filtro"
    expect(reports).toHaveLength(3)
  })

  test('ignora targetId que não seja string', async () => {
    await seedReports()
    const reports = await listReports.execute({
      targetId: { $ne: null },
    })
    expect(reports).toHaveLength(3)
  })

  test('ignora targetId com formato inválido (não-ObjectId)', async () => {
    await seedReports()
    const reports = await listReports.execute({
      targetId: 'nao-e-um-objectid',
    })
    expect(reports).toHaveLength(3)
  })

  test('ignora status fora do enum permitido', async () => {
    await seedReports()
    const reports = await listReports.execute({
      status: { $gt: '' },
    })
    expect(reports).toHaveLength(3)
  })

  test('ignora targetType com valor string fora do enum', async () => {
    await seedReports()
    const reports = await listReports.execute({
      targetType: 'comentario', // não é 'pet' nem 'user'
    })
    expect(reports).toHaveLength(3)
  })
})

// ─── UpdateReportStatus ─ O status do report aqui né! O quê você esperava?

describe('UpdateReportStatus', () => {
  let existingReport

  beforeEach(async () => {
    existingReport = await Report.create({
      reason: 'outro',
      description: 'Reporte para testar atualização de status.',
      targetType: 'pet',
      targetId: new mongoose.Types.ObjectId(),
      reporter: { _id: new mongoose.Types.ObjectId(), name: 'Teste' },
    })
  })

  test('atualiza o status com sucesso', async () => {
    const updated = await updateReportStatus.execute(
      existingReport._id.toString(),
      'reviewing',
    )
    expect(updated.status).toBe('reviewing')
  })

  test('atualiza para resolved', async () => {
    const updated = await updateReportStatus.execute(
      existingReport._id.toString(),
      'resolved',
    )
    expect(updated.status).toBe('resolved')
  })

  test('atualiza para dismissed', async () => {
    const updated = await updateReportStatus.execute(
      existingReport._id.toString(),
      'dismissed',
    )
    expect(updated.status).toBe('dismissed')
  })

  test('lança erro para status inválido', async () => {
    await expect(
      updateReportStatus.execute(existingReport._id.toString(), 'arquivado'),
    ).rejects.toThrow(/Status inválido/)
  })

  test('lança erro para ID inválido (formato errado)', async () => {
    await expect(
      updateReportStatus.execute('nao-e-um-id', 'open'),
    ).rejects.toThrow('ID de reporte inválido.')
  })

  test('lança erro quando reporte não existe (ID válido mas inexistente)', async () => {
    const idInexistente = new mongoose.Types.ObjectId().toString()
    await expect(
      updateReportStatus.execute(idInexistente, 'open'),
    ).rejects.toThrow('Reporte não encontrado.')
  })
})

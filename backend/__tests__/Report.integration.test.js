/**
 * __tests__/Report.integration.test.js
 *
 * Testes de integração das rotas de Report (Controller + Router + Use Cases).
 * Usa supertest para simular chamadas HTTP sem subir um servidor de fato.
 * O banco é o MongoDB in-memory (testDb.js).
 *
 * Os tokens JWT são gerados diretamente (sem precisar de POST /users/login)
 * para manter os testes focados na funcionalidade de Report.
 * O JWT é muito necessário aqui pois ele faz a camada de segurança, do cebolão!
 */

const request  = require('supertest')
const express  = require('express')
const jwt      = require('jsonwebtoken')
const mongoose = require('mongoose')

const { connectTestDb, disconnectTestDb, clearTestDb } = require('./testDb')
const { Report } = require('../models/Report')
const ReportRouters = require('../routers/ReportRouters')

// ─── App mínimo para os testes (sem Socket.io, sem rate limiter global) ───────
// Isso garante que os testes de integração sejam rápidos e focados.
// pra não ficar usando processamento com o que não precisa!

const app = express()
app.use(express.json())
app.use('/reports', ReportRouters)

// ─── Helpers de autenticação ─────────────────────────────────────────────────

const JWT_SECRET = 'nossosecret' // mesmo default de AppConfig

function makeToken(userId, name = 'Usuário Teste') {
  return jwt.sign({ id: userId, name }, JWT_SECRET)
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

// ─── Setup / teardown ────────────────────────────────────────────────────────

beforeAll(connectTestDb)
afterEach(clearTestDb)
afterAll(disconnectTestDb)

// ─── POST /reports ────────────────────────────────────────────────────────────

describe('POST /reports', () => {
  let userId, token, validPayload

  beforeEach(() => {
    userId = new mongoose.Types.ObjectId().toString()
    token  = makeToken(userId)
    validPayload = {
      reason: 'maus-tratos',
      description: 'Observei sinais claros de maus-tratos ao animal.',
      targetType: 'pet',
      targetId: new mongoose.Types.ObjectId().toString(),
    }
  })

  test('201 - cria reporte válido', async () => {
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send(validPayload)

    expect(res.status).toBe(201)
    expect(res.body.message).toBe('Reporte enviado com sucesso!')
    expect(res.body.report).toMatchObject({
      reason: 'maus-tratos',
      status: 'open',
    })
  })

  test('401 - sem token retorna acesso negado', async () => {
    const res = await request(app).post('/reports').send(validPayload)
    expect(res.status).toBe(401)
  })

  test('422 - sem reason', async () => {
    const { reason, ...sem } = validPayload
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send(sem)
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/motivo/)
  })

  test('422 - reason inválida', async () => {
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send({ ...validPayload, reason: 'xablau' })
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/Motivo inválido/)
  })

  test('422 - description ausente', async () => {
    const { description, ...sem } = validPayload
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send(sem)
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/descrição/)
  })

  test('422 - description com menos de 10 caracteres', async () => {
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send({ ...validPayload, description: 'curto' })
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/mínimo 10/)
  })

  test('422 - description com mais de 1000 caracteres', async () => {
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send({ ...validPayload, description: 'a'.repeat(1001) })
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/1000/)
  })

  test('422 - targetType ausente', async () => {
    const { targetType, ...sem } = validPayload
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send(sem)
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/tipo do alvo/)
  })

  test('422 - targetType inválido', async () => {
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send({ ...validPayload, targetType: 'comentario' })
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/tipo do alvo/)
  })

  test('422 - targetId ausente', async () => {
    const { targetId, ...sem } = validPayload
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send(sem)
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/ID do alvo/)
  })

  test('422 - targetId inválido (formato errado)', async () => {
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send({ ...validPayload, targetId: 'nao-e-um-objectid' })
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/ID do alvo/)
  })

  test('422 - usuário tentando reportar a si mesmo', async () => {
    const res = await request(app)
      .post('/reports')
      .set(authHeader(token))
      .send({ ...validPayload, targetType: 'user', targetId: userId })
    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/reportar a si mesmo/)
  })
})

// ─── GET /reports ─ Olha o GET aqui! Você sabe usar o POSTMAN?

describe('GET /reports', () => {
  let token

  beforeEach(async () => {
    const userId = new mongoose.Types.ObjectId()
    token = makeToken(userId.toString())

    await Report.create([
      {
        reason: 'spam',
        description: 'Primeiro reporte listagem com texto suficiente.',
        targetType: 'pet',
        targetId: new mongoose.Types.ObjectId(),
        reporter: { _id: userId, name: 'Teste' },
        status: 'open',
      },
      {
        reason: 'outro',
        description: 'Segundo reporte listagem com texto suficiente.',
        targetType: 'user',
        targetId: new mongoose.Types.ObjectId(),
        reporter: { _id: userId, name: 'Teste' },
        status: 'resolved',
      },
    ])
  })

  test('200 - lista todos os reportes', async () => {
    const res = await request(app)
      .get('/reports')
      .set(authHeader(token))

    expect(res.status).toBe(200)
    expect(res.body.reports).toHaveLength(2)
  })

  test('200 - filtra por targetType=pet', async () => {
    const res = await request(app)
      .get('/reports?targetType=pet')
      .set(authHeader(token))

    expect(res.status).toBe(200)
    expect(res.body.reports).toHaveLength(1)
    expect(res.body.reports[0].targetType).toBe('pet')
  })

  test('200 - filtra por status=resolved', async () => {
    const res = await request(app)
      .get('/reports?status=resolved')
      .set(authHeader(token))

    expect(res.status).toBe(200)
    expect(res.body.reports).toHaveLength(1)
    expect(res.body.reports[0].status).toBe('resolved')
  })

  test('401 - sem token', async () => {
    const res = await request(app).get('/reports')
    expect(res.status).toBe(401)
  })

  test('200 - querystring de injection (?targetType[$ne]=null) é tratada com segurança', async () => {
    // Express faz parse de "targetType[$ne]=null" como
    // req.query.targetType = { '$ne': 'null' } (um objeto, não string).
    // O Controller/Use Case devem descartar esse filtro em vez de
    // repassá-lo ao Mongoose - e a rota deve responder normalmente.
    // Você sabe usar rotas né!
    const res = await request(app)
      .get('/reports?targetType[$ne]=null')
      .set(authHeader(token))

    expect(res.status).toBe(200)
    expect(res.body.reports).toHaveLength(2) // nenhum filtro foi aplicado
  })
})

// ─── PATCH /reports/:id/status ─ São os Status dos Tests!

describe('PATCH /reports/:id/status', () => {
  let token, report

  beforeEach(async () => {
    const userId = new mongoose.Types.ObjectId()
    token = makeToken(userId.toString())

    report = await Report.create({
      reason: 'spam',
      description: 'Reporte para testar PATCH de status via HTTP.',
      targetType: 'pet',
      targetId: new mongoose.Types.ObjectId(),
      reporter: { _id: userId, name: 'Teste' },
    })
  })

  test('200 - atualiza status para reviewing', async () => {
    const res = await request(app)
      .patch(`/reports/${report._id}/status`)
      .set(authHeader(token))
      .send({ status: 'reviewing' })

    expect(res.status).toBe(200)
    expect(res.body.report.status).toBe('reviewing')
    expect(res.body.message).toMatch(/atualizado/)
  })

  test('200 - atualiza status para resolved', async () => {
    const res = await request(app)
      .patch(`/reports/${report._id}/status`)
      .set(authHeader(token))
      .send({ status: 'resolved' })

    expect(res.status).toBe(200)
    expect(res.body.report.status).toBe('resolved')
  })

  test('422 - status ausente no body', async () => {
    const res = await request(app)
      .patch(`/reports/${report._id}/status`)
      .set(authHeader(token))
      .send({})

    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/status/)
  })

  test('422 - status inválido', async () => {
    const res = await request(app)
      .patch(`/reports/${report._id}/status`)
      .set(authHeader(token))
      .send({ status: 'cancelado' })

    expect(res.status).toBe(422)
    expect(res.body.message).toMatch(/Status inválido/)
  })

  test('404 - reporte não encontrado', async () => {
    const idInexistente = new mongoose.Types.ObjectId().toString()
    const res = await request(app)
      .patch(`/reports/${idInexistente}/status`)
      .set(authHeader(token))
      .send({ status: 'resolved' })

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/não encontrado/)
  })

  test('422 - ID com formato inválido', async () => {
    const res = await request(app)
      .patch('/reports/id-invalido/status')
      .set(authHeader(token))
      .send({ status: 'resolved' })

    expect(res.status).toBe(422)
  })

  test('401 - sem token', async () => {
    const res = await request(app)
      .patch(`/reports/${report._id}/status`)
      .send({ status: 'resolved' })

    expect(res.status).toBe(401)
  })
})

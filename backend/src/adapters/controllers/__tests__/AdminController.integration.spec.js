// backend/src/adapters/controllers/__tests__/AdminController.integration.spec.js
const request = require('supertest')
const app = require('../../../external/frameworks/app')

describe('Contrato da API de Admin (integração)', () => {
  const validAdmin = {
    name: 'Root Admin',
    email: 'root@admin.com',
    password: '123456',
  }

  it('POST /admins/create deve criar um admin e retornar 201 sem expor a senha', async () => {
    const res = await request(app).post('/admins/create').send(validAdmin)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('admin')
    expect(res.body.admin.email).toBe('root@admin.com')
    expect(res.body.admin.password).toBeUndefined()
  })

  it('POST /admins/create sem email deve retornar 422 (validação de schema)', async () => {
    const res = await request(app)
      .post('/admins/create')
      .send({ name: 'Sem Email', password: '123456' })

    expect(res.status).toBe(422)
    expect(res.body.message).toBe('O email é obrigatório!')
  })

  it('POST /admins/create com senha curta deve retornar 422', async () => {
    const res = await request(app)
      .post('/admins/create')
      .send({ name: 'Senha Curta', email: 'curta@admin.com', password: '123' })

    expect(res.status).toBe(422)
    expect(res.body.message).toBe('A senha deve ter no mínimo 6 caracteres!')
  })

  it('POST /admins/create com email duplicado deve retornar 409', async () => {
    await request(app).post('/admins/create').send(validAdmin)
    const res = await request(app).post('/admins/create').send(validAdmin)

    expect(res.status).toBe(409)
    expect(res.body.message).toBe('Já existe um admin com este email!')
  })

  it('GET /admins deve retornar 200 e a lista de admins', async () => {
    await request(app).post('/admins/create').send(validAdmin)
    const res = await request(app).get('/admins')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('admins')
    expect(Array.isArray(res.body.admins)).toBe(true)
    expect(res.body.admins).toHaveLength(1)
    expect(res.body.admins[0].password).toBeUndefined()
  })
})
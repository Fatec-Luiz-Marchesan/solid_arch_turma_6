const request = require('supertest')
const app = require('../../../external/frameworks/app')
const { makeAuthToken } = require('./helpers/test-factory')

describe('Contrato da API de Pets (integracao)', () => {
    it('GET /pets deve retornar 200 e uma lista de pets', async () => {
        const res = await request(app).get('/pets')
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('pets')
        expect(Array.isArray(res.body.pets)).toBe(true)
    })

    it('GET /pets deve retornar lista vazia quando nao há pets', async () => {
        const res = await request(app).get('/pets')

        expect(res.status).toBe(200)
        expect(res.body.pets).toHaveLength(0)
    })

    it('POST /pets/create sem token deve retornar 401', async () => {
        const res = await request(app).post('/pets/create')
            .send({ name: 'Rex', age: 2, weight: 8, color: 'preto' })
        expect(res.status).toBe(401)
    })

    it('GET /pets/:id inexistente nao deve retornar 200', async () => {
        const res = await request(app).get('/pets/64b8f0c2e1a2b3c4d5e6f7a8')
        expect(res.status).not.toBe(200)
    })
})

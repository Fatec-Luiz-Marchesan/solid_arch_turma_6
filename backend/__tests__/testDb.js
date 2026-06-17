/**
 * testDb.js
 *
 * Sobe um MongoDB em memória (mongodb-memory-server) antes dos testes e
 * derruba depois. Fica mais fácil né! Do quê tentar montar um servidor apenas pra testar
 * 
 * Isso garante que os testes:
 *   - Nunca tocam o banco de dados real/de desenvolvimento.
 *   - Rodam em qualquer máquina/CI sem precisar de um Mongo instalado.
 *   - São completamente isolados entre arquivos de teste.
 *   - E fica mais leve também!
 *
 * Uso nos arquivos de teste:
 *   const { connectTestDb, disconnectTestDb, clearTestDb } = require('./testDb')
 *   beforeAll(connectTestDb)
 *   afterEach(clearTestDb)
 *   afterAll(disconnectTestDb)
 */

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongod

async function connectTestDb() {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
}

async function disconnectTestDb() {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
}

async function clearTestDb() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

// e mais um module exports! Você tem que ter este aqui se não o módulo não é exportado!
module.exports = { connectTestDb, disconnectTestDb, clearTestDb }

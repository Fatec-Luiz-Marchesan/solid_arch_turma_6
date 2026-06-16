/**
 * Smoke test do adapter de tempo real (Task 1 - Socket.io é só pra teste tá e não o cara do Mortal Kombat)
 *
 * Objetivo: provar que o SocketIOAdapter funciona de ponta a ponta - (igual a propaganda mentirosa da meta
 * sobre o whatsapp, encriptação de ponta a ponta! Lembrando que nem nosso professor Icoma confia na encriptação 
 * do whatsapp e olha que ele é Cientista de dados! Imagina eu que sou meio paranóico! E já hackeei um celular
 * ao vivo durante a feira da ETEC!)
  */
const http = require('http')
const express = require('express')
const { io: ioClient } = require('socket.io-client')
const { SocketIOAdapter } = require('./index')

const PORT = 5050
const ROOM = 'smoke-test-room'

async function main() {
  const app = express()
  const server = http.createServer(app)

  const realtimeNotifier = new SocketIOAdapter()
  realtimeNotifier.init(server, { corsOrigin: '*' })

  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`[smoke-test] servidor de teste ouvindo na porta ${PORT}`)

  const client = ioClient(`http://localhost:${PORT}`, {
    transports: ['websocket'],
  })

  const result = await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ ok: false, reason: 'timeout esperando o evento pet:scheduled' })
    }, 5000)

    client.on('connect', () => {
      console.log('[smoke-test] cliente conectado, entrando na sala...')
      client.emit('join', ROOM)

      // pequena espera para garantir que o join chegou antes do emit só pra garantia sabe! A pressa não ajuda muito!
      setTimeout(() => {
        realtimeNotifier.emit(
          'pet:scheduled',
          { petName: 'Rex', message: 'PoC ok' },
          ROOM,
        )
      }, 200)
    })

    client.on('pet:scheduled', (payload) => {
      clearTimeout(timeout)
      resolve({ ok: true, payload })
    })

    client.on('connect_error', (err) => {
      clearTimeout(timeout)
      resolve({ ok: false, reason: `connect_error: ${err.message}` })
    })
  })

  client.close()
  server.close()

  if (!result.ok) {
    console.error(`[smoke-test] FALHOU: ${result.reason}`)
    process.exit(1)
  }

  console.log('[smoke-test] OK - evento recebido:', result.payload)
  process.exit(0)
}

main().catch((err) => {
  console.error('[smoke-test] erro inesperado:', err)
  process.exit(1)
})
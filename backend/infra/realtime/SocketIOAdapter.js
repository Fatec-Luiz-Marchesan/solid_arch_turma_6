const { Server } = require('socket.io')
const RealtimeNotifierPort = require('./RealtimeNotifierPort')

/**
 * Implementação concreta de RealtimeNotifierPort usando Socket.io. Aqui que o Socket funciona de verdade!
 * mas não tenta colocar uma lampada aqui tá! Nos anos 2000 alguém deve ter feito um applet pra isso, mas era
 * pesado, ruim e cheio de falhas de segurança
 * Este é o único arquivo do projeto que importa 'socket.io' diretamente.
 * (esse aqui literalmente o mandachuva da burega toda!)
 * Se um dia o projeto precisar trocar Socket.io por outra biblioteca de
 * tempo real, basta criar um novo Adapter que implemente o mesmo
  */
class SocketIOAdapter extends RealtimeNotifierPort {
  constructor() {
    super()
    this.io = null
  }

  /**
   * @param {import('http').Server} httpServer
   * @param {object} [options]
   */
  init(httpServer, options = {}) {
    if (this.io) {
      return this.io
    }

    this.io = new Server(httpServer, {
      cors: {
        origin: options.corsOrigin || 'http://localhost:3000',
        credentials: true,
      },
    })

    this.io.on('connection', (socket) => {
      console.log(`[socket.io] cliente conectado: ${socket.id}`)

      // Um cliente pode entrar em uma "sala" para receber notificações
      // direcionadas (ex: sala = id do usuário, ou id do pet Aqui que o seu celular apita que nem louco
      // e você se torna um zumbi escravo de notificações, antes era com redes sociais agora com a rede do seu pet!)
      socket.on('join', (room) => {
        if (!room) return
        socket.join(room)
        console.log(`[socket.io] ${socket.id} entrou na sala "${room}"`)
      })

      socket.on('leave', (room) => {
        if (!room) return
        socket.leave(room)
      })

      socket.on('disconnect', () => {
        console.log(`[socket.io] cliente desconectado: ${socket.id}`)
      })
    })

    return this.io
  }

  /**
   * @inheritdoc
   */
  emit(event, payload, room = null) {
    if (!this.io) {
      // Em ambientes de teste/CI sem servidor de socket, a chamada não deve
      // derrubar a aplicação - apenas não emite nada. (é so pra testar! ninguém quer derrubar o ambiente em produção!)
      console.warn(
        `[socket.io] emit("${event}") ignorado: adapter não inicializado`,
      )
      return
    }

    if (room) {
      this.io.to(room).emit(event, payload)
    } else {
      this.io.emit(event, payload)
    }
  }
}

module.exports = SocketIOAdapter

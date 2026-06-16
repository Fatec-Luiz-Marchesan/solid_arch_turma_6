/**
 * RealtimeNotifierPort
 *
 * Esta é a "porta" (interface né! Não bem uma porta de verdade ou aquela que você escaneia com o wireshark)
 *  que a camada de Controllers/Use Cases conhece.
 * Ela NÃO sabe nada sobre Socket.io, WebSockets, ou qualquer detalhe de
 * infraestrutura. Isso é o que permite respeitar o Dependency Inversion
 * Principle: a camada interna depende de uma abstração, (lembre-se muito usada, como uma faca de 2 legumes já
 * dizia Vicente Matheus. Mas também um mal que assola os programadores ruins que não valorizam o stack mais baixo) e a implementação
 * concreta (SocketIOAdapter) é injetada a partir da camada mais externa.
 *
 * Qualquer nova tecnologia de tempo real (ex: trocar Socket.io por outra lib)
 * só precisa implementar este mesmo contrato, sem alterar Controllers,
 * Use Cases ou Models.
 */
class RealtimeNotifierPort {
  /**
   Emite um evento para todos os clientes conectados (assim como a replicação do multiplayer que funciona em um jogo online),
   ou para uma sala específica (room) quando informado.
   
   @param {string} event - nome do evento (ex: 'pet:scheduled')
   @param {object} payload - dados enviados ao(s) cliente(s)
   @param {string|null} room - sala destino (opcional). Se null, broadcast geral.
   */
  // eslint-disable-next-line no-unused-vars
  emit(event, payload, room = null) {
    throw new Error('RealtimeNotifierPort.emit() não implementado')
  }
}

module.exports = RealtimeNotifierPort

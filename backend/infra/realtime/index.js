const SocketIOAdapter = require('./SocketIOAdapter')

/**
 * Singleton do adapter de tempo real. (para fazer o real time funcionar! O quê você esperava? Duuh!)
 *
 * Controllers importam apenas esta instância (`realtimeNotifier`) e chamam
 * `.emit(...)`. Eles não sabem - e não precisam saber (as vezes é melhor não saber mesmo já dizia o filósofo) 
 * - que por trás existe Socket.io. Isso mantém a camada de Use Cases/Entidades livre de qualquer
 * referência à tecnologia escolhida (Dependency Inversion Principle).
 */
const realtimeNotifier = new SocketIOAdapter()

module.exports = { realtimeNotifier, SocketIOAdapter }

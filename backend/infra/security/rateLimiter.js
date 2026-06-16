/**
 * Rate limiting (infra/security)
 *
 * Adapter de seguranca baseado em `express-rate-limit`, plugado como
 * middleware do Express - mesma ideia de infra/config e infra/realtime:
 * Controllers, Models e Use Cases não sabem que este middleware existe.
 *
 * Resolve os alertas do CodeQL "Missing rate limiting"
 * (js/missing-rate-limiting) nas rotas que fazem autorização
 * (helpers/check-token) e/ou acesso ao banco (PetRouters e UserRouters).
 *
 * - apiLimiter: aplicado globalmente (ver index.js), cobre todas as rotas
 *   de /pets e /users.
 * - authLimiter: limite mais restrito para as rotas de login/registro
 *   (ver routers/UserRouters.js), para mitigar brute-force / credential
 *   stuffing.
 */

const rateLimit = require('express-rate-limit')

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // até 300 requisições por IP, por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas requisições. Tente novamente em alguns minutos.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // até 20 tentativas de login/registro por IP, por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas. Tente novamente em alguns minutos.' },
})

module.exports = { apiLimiter, authLimiter }

const express = require('express')
const cors = require('cors')
const http = require('http')

// Porta de configuração (ver infra/config). Quem injeta os valores reais
// (porta, Mongo URI, CORS origin etc.) é o ambiente externo - localmente
// pode ser o .env / shell, dentro do docker-compose são as variáveis de
// ambiente do serviço "backend".
const AppConfig = require('./infra/config')

const app = express()

// Config JSON response
app.use(express.json())

// Solve CORS
app.use(cors({ credentials: true, origin: AppConfig.corsOrigin }))

// Public folder for images and Socket.io PoC page
app.use(express.static('public'))

// Rate limiting (infra/security) - mitiga brute-force / abuso das rotas
// que fazem autorização e acesso ao banco (PetRouters e UserRouters).
// Aplicado globalmente, antes das rotas, como qualquer outro middleware
// de infraestrutura do Express. Sabe quando aquele scriptkid tenta fazer um bruteforce em uma porta
// e fica semanas tentando forçar com um dicionário que é um arquivo de texto de 10 gigas! É pra evitar isso!
const { apiLimiter } = require('./infra/security/rateLimiter')
app.use(apiLimiter)

// Healthcheck simples - usado pelo HEALTHCHECK do Dockerfile/docker-compose
// e pelo smoke test de Docker (ver scripts/docker-smoke-test.sh). Não
// depende de nenhuma camada de negócio, só confirma que o processo Node
// está de pé e respondendo. É tipo um checkup de saúde do dockerfile
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'getapet-backend',
    env: AppConfig.nodeEnv,
    timestamp: new Date().toISOString(),
  })
})

// Routes
const PetRoutes    = require('./routers/PetRouters')
const UserRoutes   = require('./routers/UserRouters')
const ReportRoutes = require('./routers/ReportRouters')

app.use('/pets',    PetRoutes)
app.use('/users',   UserRoutes)
app.use('/reports', ReportRoutes)

// Conexão real com o MongoDB (Task 89 - bugfix).
// Consertando parte do código que ficou bugado! Agora que está funcionando, tente não mexer!
const db = require('./db/conn')
db.connectDb().catch((err) => {
  console.error('Falha ao conectar no MongoDB:', err.message)
})

// Servidor HTTP "puro", necessario para o Socket.io poder
// fazer o upgrade da conexao (HTTP -> WebSocket) no mesmo socket
// usado pelo Express. (falta um S aí né pois a porta 80 já está muito manjada! sabe aquele
// protocolinho que foi desenvolvido no CERN o Grande Colisor de Hadrons e a camada de segurança desenvolvida
// no meio dos anos 90 por uma empresa tal de Netscape RIP.)
const server = http.createServer(app)

// Plugando o adapter de tempo real (Socket.io) como um plugin externo.
// Nenhum Model, Use Case ou Controller precisa conhecer este import -
// eles recebem apenas a instancia `realtimeNotifier` (ver infra/realtime).
const { realtimeNotifier } = require('./infra/realtime')
realtimeNotifier.init(server, { corsOrigin: AppConfig.corsOrigin })

server.listen(AppConfig.port, () => {
  console.log(`Servidor rodando na porta ${AppConfig.port} (HTTP + Socket.io)`)
})

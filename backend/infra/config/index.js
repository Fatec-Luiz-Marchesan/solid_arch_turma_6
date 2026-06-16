/**
 * AppConfig
 *
 * Esta é a "porta" de configuração da aplicação (mesma ideia do
 * RealtimeNotifierPort em infra/realtime, só que para variáveis de ambiente).
 *
 * Controllers, Models e Use Cases NUNCA leem `process.env` diretamente.
 * Eles recebem valores já resolvidos a partir deste módulo (via db/conn,
 * helpers de token, index.js, etc).
 *
 * É esse contrato simples - variáveis de ambiente com valores padrão para
 * desenvolvimento local fora de containers - que permite ao Docker (ou a
 * qualquer outro orquestrador: Kubernetes, PM2, systemd...) configurar a
 * aplicação "de fora para dentro", sem que o código de negócio precise saber
 * que existe um container, uma rede Docker chamada "mongo", etc.
 * (Dependency Inversion Principle: o núcleo depende desta abstração, e quem
 * implementa/fornece os valores concretos é o ambiente externo - aqui, o
 * docker-compose.)
 *
 * Se um dia o projeto trocar Docker por outra forma de empacotar/rodar a
 * aplicação, só essas variáveis de ambiente (ou os defaults abaixo) mudam -
 * nenhuma linha dentro de controllers/models precisa ser tocada.
 */

const AppConfig = {
  // Porta HTTP onde o Express + Socket.io ficam escutando.
  port: Number(process.env.PORT) || 5000,

  // String de conexão do MongoDB. Em desenvolvimento local (sem Docker) usa
  // o Mongo da máquina; dentro do docker-compose o serviço "mongo" injeta
  // MONGO_URI=mongodb://mongo:27017/getapetref via variável de ambiente.
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/getapetref',

  // Origem permitida pelo CORS (tanto para o Express quanto para o
  // Socket.io). O docker-compose pode sobrescrever quando o frontend roda
  // em outro host/porta.
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Segredo usado para assinar/verificar os tokens JWT.
  // ATENÇÃO: o valor "nossosecret" é apenas o default de desenvolvimento
  // (mantido para não quebrar quem já está rodando o projeto fora do
  // Docker). Em produção, defina JWT_SECRET via variável de ambiente
  // (ex: no .env consumido pelo docker-compose).
  jwtSecret: process.env.JWT_SECRET || 'nossosecret',

  // Ambiente de execução (development | production | test).
  nodeEnv: process.env.NODE_ENV || 'development',
}

module.exports = AppConfig

# syntax=docker/dockerfile:1
#
# Dockerfile do backend (Node.js / Express / Mongoose)
#
# Este arquivo NÃO conhece Controllers, Models ou Use Cases - ele só sabe
# instalar dependências e rodar `node index.js` (ou `npm start` em dev).
# Toda a configuração que varia entre ambientes (porta, Mongo URI, CORS,
# JWT secret) é passada via variáveis de ambiente e lida pela "porta" em
# backend/infra/config (ver esse arquivo para detalhes do Dependency
# Inversion Principle aplicado aqui).
#
# Build multi-estágio com dois alvos:
#   - development -> usado pelo docker-compose.yml em ambiente local,
#                     com hot-reload via nodemon e código montado por volume.
#   - production   -> imagem enxuta (só deps de produção), usada em CI
#                     e como base para deploy.


# Base: arquivos de manifesto + WORKDIR comuns aos demais estágios
FROM node:20-slim AS base
WORKDIR /usr/src/app
COPY package*.json ./


# Dependências completas (inclui devDependencies: nodemon, socket.io-client)
FROM base AS dependencies
RUN npm install


# Dependências de produção apenas
FROM base AS dependencies-prod
RUN npm install --omit=dev


# Estágio de desenvolvimento
# - código-fonte é montado via bind mount pelo docker-compose
# - nodemon reinicia o servidor a cada alteração
FROM base AS development
ENV NODE_ENV=development
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["npm", "run", "start"]


# Estágio de produção (alvo padrão deste Dockerfile)
# - somente dependências de produção
# - roda `node index.js` diretamente, sem nodemon
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies-prod /usr/src/app/node_modules ./node_modules
COPY . .

# Garante que as pastas de upload existam mesmo numa imagem "limpa"
# (em runtime, o docker-compose normalmente monta um volume sobre elas).
RUN mkdir -p public/images/pets public/images/users

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "index.js"]

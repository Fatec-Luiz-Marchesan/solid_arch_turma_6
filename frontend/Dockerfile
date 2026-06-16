# syntax=docker/dockerfile:1
#
# Dockerfile do frontend (React / CRA)
#
# Igual ao backend, este Dockerfile é só "infraestrutura": ele não conhece
# Pet, User, Diet etc. - apenas instala dependências e roda o servidor de
# desenvolvimento (CRA) ou serve os arquivos estáticos já buildados.
#
#   - development -> usado pelo docker-compose.yml, com hot-reload do CRA
#                     e código montado por volume.
#   - production   -> build estático servido por Nginx (útil para validar
#                     o build de produção em CI/ambientes de homologação).

FROM node:20-slim AS base
WORKDIR /usr/src/app
COPY package*.json ./

FROM base AS dependencies
RUN npm install

############################
# Estágio de desenvolvimento (CRA dev server com hot-reload)
############################
FROM base AS development
ENV NODE_ENV=development
# Necessário para o CRA detectar mudanças de arquivos quando o código
# está em um volume montado (especialmente em Windows/Mac).
ENV CHOKIDAR_USEPOLLING=true
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

############################
# Build de produção (gera os estáticos)
############################
FROM dependencies AS build
COPY . .
RUN npm run build

############################
# Estágio de produção (alvo padrão): Nginx servindo os estáticos
############################
FROM nginx:1.27-alpine AS production
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

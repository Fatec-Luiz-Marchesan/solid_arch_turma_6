#!/usr/bin/env bash
#
# Prova de Conceito (PoC) da integração com Docker.
#
# Objetivo: provar, de ponta a ponta, que a imagem de produção do backend
# (backend/Dockerfile, alvo "production") sobe corretamente dentro de um
# container, conecta no MongoDB (também containerizado) usando apenas
# variáveis de ambiente (backend/infra/config) e responde por HTTP.
#
# Mesma ideia do `infra/realtime/socket-smoke-test.js` (PoC da Task 1 /
# Socket.io), mas para a tecnologia Docker: aqui o "cliente" é o `curl`,
# e o "servidor" é o stack `docker-compose.ci.yml`.
#
# Endpoint de exemplo: como o módulo "Diet" citado no template da Task 95
# não existe neste projeto (que é de adoção de Pets), usamos o equivalente
# mais próximo já existente: `GET /pets` (PetController.getAll) - o mesmo
# tipo de substituição já feito na Task 1, que usou o evento `pet:scheduled`
# no lugar do módulo "Review" citado no template original.
#
# Uso:
#   ./scripts/docker-smoke-test.sh
#
# Requer Docker + Docker Compose v2 (`docker compose ...`) instalados.

set -euo pipefail

COMPOSE_FILE="docker-compose.ci.yml"
BASE_URL="http://localhost:5000"
MAX_RETRIES=30
SLEEP_SECONDS=2

cd "$(dirname "$0")/.."

cleanup() {
  echo "[docker-smoke-test] encerrando e removendo containers..."
  docker compose -f "$COMPOSE_FILE" down -v >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "[docker-smoke-test] buildando e subindo backend + mongo (alvo: production)..."
docker compose -f "$COMPOSE_FILE" up --build -d

echo "[docker-smoke-test] aguardando GET ${BASE_URL}/health responder 200..."
for i in $(seq 1 "$MAX_RETRIES"); do
  if curl --silent --fail --output /dev/null "${BASE_URL}/health"; then
    echo "[docker-smoke-test] /health OK (tentativa ${i})"
    break
  fi

  if [ "$i" -eq "$MAX_RETRIES" ]; then
    echo "[docker-smoke-test] FALHOU: /health não respondeu após $((MAX_RETRIES * SLEEP_SECONDS))s"
    docker compose -f "$COMPOSE_FILE" logs backend
    exit 1
  fi

  sleep "$SLEEP_SECONDS"
done

echo "[docker-smoke-test] checando GET ${BASE_URL}/pets (endpoint de exemplo - substitui 'Diet')..."
PETS_RESPONSE=$(curl --silent --fail "${BASE_URL}/pets")

if echo "$PETS_RESPONSE" | grep -q '"pets"'; then
  echo "[docker-smoke-test] OK - /pets respondeu com a chave \"pets\": ${PETS_RESPONSE}"
else
  echo "[docker-smoke-test] FALHOU: resposta inesperada de /pets: ${PETS_RESPONSE}"
  docker compose -f "$COMPOSE_FILE" logs backend
  exit 1
fi

echo "[docker-smoke-test] PoC concluída com sucesso!"

#!/usr/bin/env bash
#
# restore-database.sh — Restaura um backup gerado por backup-database.sh
# (formato custom do pg_dump, -Fc) em um banco PostgreSQL + PostGIS
# novo ou existente.
#
# Uso:
#   ./restore-database.sh <caminho-do-arquivo.backup>
#
# Variáveis de ambiente esperadas (mesmas de backup-database.sh):
#   DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/../../../.env}"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a && source "$ENV_FILE" && set +a
fi

: "${DATABASE_HOST:?Defina DATABASE_HOST}"
: "${DATABASE_PORT:?Defina DATABASE_PORT}"
: "${DATABASE_NAME:?Defina DATABASE_NAME}"
: "${DATABASE_USER:?Defina DATABASE_USER}"
: "${DATABASE_PASSWORD:?Defina DATABASE_PASSWORD}"

BACKUP_FILE="${1:?Uso: ./restore-database.sh <caminho-do-arquivo.backup>}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Erro: arquivo de backup não encontrado: $BACKUP_FILE" >&2
  exit 1
fi

echo "⚠️  Este script irá restaurar '$BACKUP_FILE' em '$DATABASE_NAME' @ $DATABASE_HOST:$DATABASE_PORT."
echo "Isso pode SOBRESCREVER dados existentes nesse banco."
read -rp "Confirma? Digite 'sim' para continuar: " CONFIRMATION

if [ "$CONFIRMATION" != "sim" ]; then
  echo "Cancelado."
  exit 0
fi

echo "Garantindo que as extensões necessárias existam antes da restauração..."
PGPASSWORD="$DATABASE_PASSWORD" psql \
  --host="$DATABASE_HOST" \
  --port="$DATABASE_PORT" \
  --username="$DATABASE_USER" \
  --dbname="$DATABASE_NAME" \
  --command='CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS postgis;'

echo "Restaurando '$BACKUP_FILE'..."

PGPASSWORD="$DATABASE_PASSWORD" pg_restore \
  --host="$DATABASE_HOST" \
  --port="$DATABASE_PORT" \
  --username="$DATABASE_USER" \
  --dbname="$DATABASE_NAME" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --verbose \
  "$BACKUP_FILE"

echo ""
echo "Restauração concluída."
echo ""
echo "Validando integridade básica (contagem de tabelas esperadas)..."

TABLE_COUNT=$(PGPASSWORD="$DATABASE_PASSWORD" psql \
  --host="$DATABASE_HOST" \
  --port="$DATABASE_PORT" \
  --username="$DATABASE_USER" \
  --dbname="$DATABASE_NAME" \
  --tuples-only --command="SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d '[:space:]')

echo "Tabelas encontradas no schema 'public': $TABLE_COUNT (esperado: 8 — country, location, migration_route, migration_flow, migration_event, data_source, statistics, app_user)"

if [ "$TABLE_COUNT" -lt 8 ]; then
  echo "⚠️  Atenção: número de tabelas menor que o esperado. Verifique o log de restauração acima."
  exit 1
fi

echo "✅ Restauração validada com sucesso."

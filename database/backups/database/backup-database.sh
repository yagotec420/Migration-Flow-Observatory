#!/usr/bin/env bash
#
# backup-database.sh — Backup completo do PostgreSQL + PostGIS do
# Migration Flow Observatory, usando pg_dump em formato custom
# (-Fc), que preserva estrutura, dados, índices, constraints e
# extensões (incluindo PostGIS), e permite restauração seletiva.
#
# Uso:
#   ./backup-database.sh
#
# Variáveis de ambiente esperadas (carregadas de um .env na raiz do
# projeto ou de database/.env — NUNCA hardcoded neste script):
#   DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/../../../.env}"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a && source "$ENV_FILE" && set +a
fi

: "${DATABASE_HOST:?Defina DATABASE_HOST (ex: no .env da raiz do projeto)}"
: "${DATABASE_PORT:?Defina DATABASE_PORT}"
: "${DATABASE_NAME:?Defina DATABASE_NAME}"
: "${DATABASE_USER:?Defina DATABASE_USER}"
: "${DATABASE_PASSWORD:?Defina DATABASE_PASSWORD}"

BACKUP_DIR="$SCRIPT_DIR"
TIMESTAMP="$(date +%F)"
BACKUP_FILE="$BACKUP_DIR/migration-flow-database-${TIMESTAMP}.backup"

echo "Iniciando backup de '$DATABASE_NAME' em $DATABASE_HOST:$DATABASE_PORT..."

PGPASSWORD="$DATABASE_PASSWORD" pg_dump \
  --host="$DATABASE_HOST" \
  --port="$DATABASE_PORT" \
  --username="$DATABASE_USER" \
  --dbname="$DATABASE_NAME" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --verbose \
  --file="$BACKUP_FILE"

echo ""
echo "Backup concluído: $BACKUP_FILE"
echo "Tamanho: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""
echo "Para restaurar, use: ./restore-database.sh \"$BACKUP_FILE\""

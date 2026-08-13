#!/usr/bin/env bash
#
# create-full-backup.sh — Gera um backup completo do projeto
# (código + documentação + configurações), excluindo segredos e
# artefatos de build/dependências.
#
# Uso (a partir da raiz do projeto):
#   bash database/scripts/create-full-backup.sh
#
# Gera: database/backups/project/migration-flow-complete-final-backup.zip

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/database/backups/project"
OUTPUT_FILE="$OUTPUT_DIR/migration-flow-complete-final-backup.zip"

mkdir -p "$OUTPUT_DIR"

echo "Gerando backup completo do projeto a partir de: $PROJECT_ROOT"

cd "$PROJECT_ROOT/.."
PROJECT_DIR_NAME="$(basename "$PROJECT_ROOT")"

zip -r "$OUTPUT_FILE" "$PROJECT_DIR_NAME" \
  -x "*/node_modules/*" \
  -x "*/dist/*" \
  -x "*/.git/*" \
  -x "*/coverage/*" \
  -x "*.env" \
  -x "*/database/backups/*" \
  -x "*.DS_Store"

echo ""
echo "Backup completo gerado: $OUTPUT_FILE"
echo "Tamanho: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo ""
echo "Verificação de segurança — confirmando que nenhum .env real foi incluído:"
if unzip -l "$OUTPUT_FILE" | grep -E "\.env$" | grep -v "\.env\.example"; then
  echo "❌ ALERTA: um arquivo .env real foi encontrado no backup! Revise antes de distribuir." >&2
  exit 1
else
  echo "✅ Nenhum .env real encontrado — apenas .env.example, como esperado."
fi

# Snapshot de 2026-08-01 (Etapa 3 — Banco de Dados)

Este é o snapshot correspondente à data em que a Etapa 3 (Banco de Dados) foi implementada.

**Contém:**
- `migration-flow-complete-backup.zip` — cópia completa do projeto neste momento (código de arquitetura, backend e banco; documentação; configurações), gerada com `database/scripts/create-full-backup.sh` e disponibilizada para download junto com a entrega desta etapa.

**Não contém (e por quê):**
- `migration-flow-database-2026-08-01.backup` — o dump real do PostgreSQL não pôde ser gerado neste snapshot porque o ambiente de implementação não teve acesso a um servidor PostgreSQL ativo (sem rede para subir o container via `docker compose up`). Para gerar este arquivo, rode `docker compose up -d` na raiz do projeto e depois `database/backups/database/backup-database.sh` em um ambiente com o banco no ar.

Este README documenta exatamente o que está e o que não está neste snapshot, para que ninguém presuma incorretamente que um backup de banco "vazio" ou "falso" está presente aqui.

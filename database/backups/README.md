# Backups

Sistema de backup e restauração do Migration Flow Observatory, cobrindo tanto o banco de dados quanto o projeto completo.

## `database/` — backup do PostgreSQL + PostGIS

| Arquivo | Função |
|---|---|
| `backup-database.sh` | Roda `pg_dump` em formato custom (`-Fc`), gerando `migration-flow-database-YYYY-MM-DD.backup` nesta mesma pasta |
| `restore-database.sh` | Roda `pg_restore` a partir de um `.backup`, recriando extensões (`uuid-ossp`, `postgis`) e validando a contagem de tabelas ao final |

Ambos os scripts leem `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD` de um arquivo `.env` (por padrão, o `.env` da raiz do projeto) — **nenhuma credencial é hardcoded**.

```bash
cd database/backups/database
./backup-database.sh
./restore-database.sh migration-flow-database-2026-08-01.backup
```

> ⚠️ Nenhum arquivo `.backup` real está incluído neste repositório. Gerá-lo requer um PostgreSQL ativo (via `docker compose up`, ver README raiz) — o ambiente em que este projeto foi implementado não tinha acesso a um servidor de banco real. Rodar `backup-database.sh` localmente, após subir o banco, produz o arquivo real.

## `project/` — backup completo da aplicação

Contém (ou, quando gerado localmente, deve conter) `migration-flow-complete-backup.zip`: uma cópia compactada de todo o projeto (`backend/`, `database/`, `docs/`, documentação raiz, `docker-compose.yml`, `.env.example`) — tudo necessário para reconstituir o projeto do zero em outra máquina, exceto segredos reais (que nunca vão para o backup — apenas `.env.example`).

Para gerar localmente:

```bash
# a partir da raiz do projeto
bash database/scripts/create-full-backup.sh
```

Ver `database/scripts/create-full-backup.sh` para o script gerador, e [`BACKUP_RESTORE_GUIDE.md`](../../BACKUP_RESTORE_GUIDE.md) (raiz do projeto) para o passo a passo completo de restauração.

## Convenção de versionamento

Para múltiplos backups ao longo do tempo, a convenção recomendada é uma pasta por data dentro de `database/backups/archive/`:

```
database/backups/archive/
├── 2026-08-01/
│   ├── migration-flow-database-2026-08-01.backup
│   └── migration-flow-complete-backup-2026-08-01.zip
├── 2026-09-15/
│   └── ...
```

Esta pasta contém um exemplo real de snapshot (`2026-08-01/`, a data em que esta etapa foi implementada) — ver `archive/2026-08-01/README.md` para o que ele contém e o que ainda depende de um ambiente com PostgreSQL ativo para ser gerado por completo.

## Segurança

- Nenhum script contém senhas — todas as credenciais vêm de variáveis de ambiente (`.env`, que já está no `.gitignore` raiz).
- `restore-database.sh` pede confirmação explícita (`digite 'sim'`) antes de sobrescrever um banco, para evitar restauração acidental em produção.
- O backup completo da aplicação nunca inclui `.env` (apenas `.env.example`) — verificado no próprio script gerador (`database/scripts/create-full-backup.sh`).

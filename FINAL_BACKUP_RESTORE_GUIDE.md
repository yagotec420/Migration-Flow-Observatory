# Guia de restauração final

O arquivo `database/backups/project/migration-flow-complete-final-backup.zip` contém código, documentação, migrations, seeds e arquivos `.env.example`; segredos e dependências instaladas são excluídos.

## Restaurar o projeto

1. Extraia o ZIP e entre em `migration-flow-observatory`.
2. Crie `.env` a partir de `.env.example`; repita para `backend`, `database` e `frontend`. Defina uma senha real em `POSTGRES_PASSWORD` e mantenha `DATABASE_URL` sincronizada.
3. Execute `docker compose up -d` e aguarde o healthcheck.
4. Em `database`, execute `npm install`, `npm run generate`, `npm run migrate:deploy` e `npm run seed`.
5. Em `backend`, execute `npm install` e `npm run dev`.
6. Em `frontend`, execute `npm install` e `npm run dev`.

## Restaurar dump PostgreSQL/PostGIS

Para um dump gerado pelos scripts de banco, configure as variáveis documentadas em `database/backups/README.md` e execute `database/backups/database/restore-database.sh`. A restauração sobrescreve dados apenas após confirmação explícita.

## Criar novo backup

Em ambiente Bash, na raiz do projeto: `bash database/scripts/create-full-backup.sh`. O script exclui `.env`, `node_modules`, `dist`, cobertura e backups anteriores antes de verificar que nenhum segredo foi incluído.

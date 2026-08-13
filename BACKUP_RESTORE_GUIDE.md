# Guia de Backup e Restauração

Este guia explica como restaurar o Migration Flow Observatory por completo — código e banco de dados — em uma máquina ou servidor novo, anos após a criação deste backup se necessário.

## Visão geral

| O que | Onde | Como |
|---|---|---|
| Código + documentação | `database/backups/project/migration-flow-complete-backup.zip` | Descompactar |
| Banco de dados (estrutura + dados) | `database/backups/database/*.backup` | `pg_restore` via `restore-database.sh` |

## 1. Restaurar o código

```bash
unzip migration-flow-complete-backup.zip
cd migration-flow-observatory
```

Instalar dependências de cada módulo:

```bash
cd backend && npm install && cd ..
cd database && npm install && cd ..
```

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env                    # raiz — usado pelo docker-compose
cp backend/.env.example backend/.env    # backend
cp database/.env.example database/.env  # Prisma CLI
```

Edite os três arquivos `.env` e defina uma senha real em `POSTGRES_PASSWORD`/`DATABASE_URL` (mantenha os três sincronizados — mesma senha, mesmo host/porta).

## 3. Subir o banco

```bash
docker compose up -d
docker compose logs -f postgres   # aguarde "database system is ready to accept connections"
```

## 4. Restaurar o backup do banco (se houver um `.backup` para restaurar)

```bash
cd database/backups/database
./restore-database.sh migration-flow-database-YYYY-MM-DD.backup
```

O script pede confirmação explícita antes de sobrescrever qualquer dado existente.

**Se não houver um backup de banco disponível** (ambiente novo, sem dados prévios), pule esta etapa e vá direto para o passo 5 — a estrutura será criada do zero pela migration.

## 5. Aplicar a estrutura do banco (schema)

Necessário sempre que não houver um backup de dados para restaurar (passo 4), ou como validação após restaurar:

```bash
cd database
npm run generate
npm run migrate:deploy
# ou, sem o Prisma CLI: npm run migrate:apply-manual
```

## 6. Popular dados de exemplo (opcional, apenas para ambientes novos sem backup de dados)

```bash
cd database
npm run seed
```

## 7. Executar o backend

```bash
cd backend
npm run build
npm start
# ou, em desenvolvimento: npm run dev
```

Verifique: `curl http://localhost:3333/health` deve retornar `{ "success": true, "data": { "status": "ok", ... } }`.

## 8. (Quando o frontend existir — Etapa 4)

Sem instruções ainda — a Etapa 4 não foi implementada. Ver `docs/roadmap.md`.

---

## Checklist de validação pós-restauração

- [ ] `docker compose ps` mostra o container do Postgres como `healthy`
- [ ] `psql "$DATABASE_URL" -c "\dt"` lista as 8 tabelas esperadas
- [ ] `psql "$DATABASE_URL" -c "SELECT postgis_version();"` retorna uma versão (confirma que a extensão PostGIS está ativa)
- [ ] `curl http://localhost:3333/health` responde com sucesso
- [ ] `curl http://localhost:3333/api/v1/dashboard` responde com dados (Mock, a menos que `PostgresDataProvider` tenha sido ativado manualmente — ver `database/docs/integration-review.md`)

## Notas de segurança

- Nenhum backup gerado por este projeto contém senhas reais — os scripts de backup (`database/backups/database/*.sh`) leem credenciais de variáveis de ambiente, nunca as escrevem em arquivo.
- O backup completo do projeto (`create-full-backup.sh`) exclui explicitamente qualquer `.env` real, incluindo apenas os `.env.example`.
- Ao restaurar em um servidor de produção real, troque todas as senhas padrão dos arquivos `.env.example` antes de expor o serviço publicamente.

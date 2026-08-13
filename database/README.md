# Database — Migration Flow Observatory

Infraestrutura de dados do projeto: PostgreSQL 16 + PostGIS, modelado via Prisma ORM.

> ⚠️ Os dados de seed são fictícios/estimados para fins educacionais. Ver aviso completo no README raiz do projeto.

## Stack

PostgreSQL 16 · PostGIS 3.4 · Prisma ORM · Docker Compose

## Pré-requisitos

- Docker + Docker Compose
- Node.js 20+
- Acesso à internet para `npm install` (não disponível no ambiente em que este projeto foi originalmente montado — ver `docs/migrations.md`)

## Subindo o banco

```bash
# a partir da raiz do projeto
cp .env.example .env
# edite .env e defina POSTGRES_PASSWORD

docker compose up -d
docker compose logs -f postgres   # aguarde o healthcheck ficar "healthy"
```

## Aplicando o schema

```bash
cd database
cp .env.example .env   # DATABASE_URL deve bater com o .env da raiz
npm install
npm run generate          # gera o Prisma Client em backend/node_modules/.prisma/client
npm run migrate:deploy    # aplica as migrations (usa database/migrations/)
npm run seed               # popula países, rotas e fluxos de exemplo
```

Alternativa sem Prisma CLI (aplicação manual do SQL, útil se `npm install` não tiver rede disponível):

```bash
npm run migrate:apply-manual
# equivalente a: psql "$DATABASE_URL" -f migrations/00001_initial_database_structure/migration.sql
```

## Estrutura

```
database/
├── prisma/schema.prisma        # fonte única de verdade do modelo de dados
├── migrations/                 # SQL versionado (aplicado via Prisma Migrate ou psql)
├── seeds/seed.ts                 # dados fictícios iniciais (países, rotas, fluxos)
├── scripts/                     # scripts utilitários (reservado)
├── diagrams/                    # ERD (Mermaid + imagem renderizada)
├── docker/docker-compose.yml    # PostgreSQL + PostGIS (espelhado na raiz do projeto)
├── backups/                     # scripts e artefatos de backup/restauração (ver backups/README.md)
├── docs/                        # documentação técnica detalhada (ver abaixo)
└── package.json                  # scripts do Prisma CLI (generate/migrate/seed)
```

## Documentação

- [`docs/model.md`](./docs/model.md) — modelagem completa, tabelas e relacionamentos
- [`docs/postgis.md`](./docs/postgis.md) — decisões espaciais e exemplos de consulta
- [`docs/migrations.md`](./docs/migrations.md) — como as migrations foram criadas e como aplicá-las
- [`docs/seeds.md`](./docs/seeds.md) — dados de seed e como estendê-los
- [`docs/performance.md`](./docs/performance.md) — índices e estratégia para grandes volumes
- [`docs/integration-review.md`](./docs/integration-review.md) — como o banco se encaixa no backend existente (Etapa 2), incluindo o conflito de granularidade identificado e sua resolução

## Compatibilidade com o backend

Este módulo não altera nenhum arquivo do backend além de um novo Provider aditivo (`backend/src/providers/postgres/PostgresDataProvider.ts`). Ver `docs/integration-review.md` e `handoff/HANDOFF_ETAPA_03_DATABASE.md` (raiz) para os detalhes completos.

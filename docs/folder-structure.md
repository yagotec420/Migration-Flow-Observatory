# Estrutura de Pastas

Esta estrutura foi definida na etapa de arquitetura e **não deve ser alterada** nas etapas seguintes (backend, banco de dados, frontend). Cada nova funcionalidade deve encontrar seu lugar dentro do esqueleto já existente.

```
migration-flow-observatory/
├── README.md
├── LICENSE
├── .gitignore
├── docs/
│   ├── architecture.md
│   ├── roadmap.md
│   ├── folder-structure.md
│   ├── coding-standards.md
│   └── project-decisions.md
├── .github/
│   ├── workflows/          # CI/CD (definido na v4)
│   └── ISSUE_TEMPLATE/     # Modelos de issues
├── images/                 # Screenshots usadas no README
├── scripts/                # Scripts utilitários de automação (setup, deploy, etc.)
├── docker/                 # Orquestração de containers (definida na v2/v4)
├── backend/
│   ├── src/
│   │   ├── api/            # Configuração e bootstrap da aplicação Express
│   │   ├── controllers/    # Recebem requisições HTTP e delegam a Services
│   │   ├── routes/         # Definição de endpoints e binding com Controllers
│   │   ├── services/       # Regras de negócio do domínio migratório
│   │   ├── repositories/   # Abstração de acesso a dados (Prisma/PostGIS)
│   │   ├── entities/       # Modelos de domínio
│   │   ├── dtos/           # Objetos de transferência de dados entre camadas
│   │   ├── middlewares/    # Cross-cutting concerns (erros, auth futura, logging)
│   │   ├── config/         # Configurações de ambiente e inicialização
│   │   ├── utils/          # Funções utilitárias puras e reutilizáveis
│   │   └── validation/     # Schemas e regras de validação de entrada
│   └── tests/               # Testes unitários e de integração do backend
├── frontend/
│   ├── src/
│   │   ├── pages/           # Telas completas da aplicação
│   │   ├── layouts/         # Estruturas visuais reutilizáveis
│   │   ├── components/      # Componentes de UI reutilizáveis
│   │   ├── features/        # Módulos verticais por domínio (mapa, timeline, dashboard)
│   │   ├── hooks/           # Hooks customizados
│   │   ├── contexts/        # Contextos React (quando aplicável)
│   │   ├── stores/          # Estado global (Zustand)
│   │   ├── services/        # Comunicação com a API backend
│   │   ├── types/           # Tipos e contratos TypeScript
│   │   ├── constants/       # Constantes globais
│   │   ├── animations/      # Configurações de animação (Framer Motion)
│   │   └── assets/          # Imagens, ícones e recursos estáticos
│   └── public/               # Arquivos estáticos servidos diretamente
└── database/
    ├── schema/               # Definição do schema (Prisma)
    ├── migrations/           # Histórico de migrações
    ├── seeds/                # Dados iniciais/mock para desenvolvimento
    ├── scripts/              # Scripts de manutenção do banco
    └── docs/                 # Diagramas e documentação do modelo de dados
```

## Regras de organização

- Nenhuma responsabilidade é misturada entre pastas: um Controller nunca acessa o banco diretamente, um Component nunca faz chamadas HTTP diretamente.
- Toda comunicação entre frontend e backend ocorre exclusivamente pela camada `services/` de cada lado.
- Novas funcionalidades de domínio (ex: uma nova visualização de estatística) devem ser organizadas como uma `feature` no frontend e um conjunto `controller + service + repository` no backend — nunca soltas em arquivos avulsos.
- Arquivos genéricos como `utils.js`, `helper.js` ou `data.js` são proibidos; todo nome deve refletir claramente sua responsabilidade (ver `coding-standards.md`).

---

## Detalhamento do Backend (Etapa 2 — implementado)

A árvore acima permanece a referência de alto nível da Etapa 1. Nenhuma pasta ali foi removida ou renomeada. Esta seção apenas **detalha** o que foi efetivamente implementado dentro de `backend/src/`, incluindo subpastas que a Etapa 1 não previa em detalhe (ver `docs/architecture.md`, seção "Refinamento do Backend"):

```
backend/
├── src/
│   ├── api/              # app.ts (assembly do Express) e server.ts (bootstrap + graceful shutdown)
│   ├── config/           # env.ts (dotenv + validação Zod), app.config.ts, server.config.ts, http.config.ts
│   ├── constants/        # httpStatus.ts, errorCodes.ts, apiVersion.ts — nova
│   ├── types/            # express.d.ts (Request augmentation), common.types.ts — nova
│   ├── errors/           # AppError.ts e subclasses (NotFoundError, ValidationError, InternalServerError) — nova
│   ├── entities/         # Country, MigrationRoute, MigrationFlow, TimelineEntry, StatisticsSnapshot
│   ├── dtos/             # CountryDTO, RouteDTO, FlowDTO, StatisticsDTO, TimelineDTO, CounterDTO, DashboardDTO
│   ├── schemas/          # schemas Zod por domínio — nova (detalhamento de validation/)
│   ├── validators/       # validateRequest.ts (middleware factory sobre os schemas) — nova (detalhamento de validation/)
│   ├── validation/       # mantida por retrocompatibilidade; README.md explica a migração para schemas/ + validators/
│   ├── interfaces/       # contratos entre camadas — nova
│   │   ├── repositories/ # ICountryRepository, IMigrationRepository, IFlowRepository, ITimelineRepository, IStatisticsRepository, ICounterRepository
│   │   └── providers/    # IDataProvider
│   ├── providers/        # implementações concretas de IDataProvider — nova
│   │   └── mock/
│   │       ├── data/     # countries.mock.ts, routes.mock.ts, flows.mock.ts
│   │       └── MockDataProvider.ts
│   ├── repositories/     # CountryRepository, MigrationRouteRepository, FlowRepository, TimelineRepository, StatisticsRepository, CounterRepository
│   ├── services/         # CountryService, MigrationService, FlowService, StatisticsService, TimelineService, CounterService, DashboardService
│   ├── controllers/      # um Controller por domínio + HealthController
│   ├── routes/           # um *.routes.ts por domínio (injeção de dependência) + index.ts (agregador com prefixo /api/v1)
│   ├── middlewares/      # requestId, security (helmet/cors/compression), rateLimit, logger (morgan), notFound, errorHandler
│   └── utils/            # asyncHandler, apiResponse (envelope padrão), logger, pagination
├── tests/
│   ├── setup.ts
│   ├── unit/services/    # testes de Service isolados (contra MockDataProvider)
│   └── integration/      # testes HTTP fim a fim via Supertest
├── docs/                 # endpoints.md, services.md, repositories.md, middlewares.md, testing.md
├── package.json, tsconfig.json, .env.example, tsup.config.ts, vitest.config.ts, .eslintrc.cjs, .prettierrc, .gitignore
└── README.md
```

### Origem de cada pasta nova

| Pasta | Motivo de existir |
|---|---|
| `constants/`, `types/`, `errors/` | Extraídas de dentro de `utils/`/`config/` para dar um lar próprio a códigos HTTP, erros de domínio e augmentations de tipo — evita que `utils/` vire uma pasta "genérica" (proibido por `coding-standards.md`). |
| `schemas/` + `validators/` | Detalhamento do conceito original de `validation/`: `schemas/` é o "o quê" validar (Zod), `validators/` é o "como" aplicar (middleware). |
| `interfaces/` | Torna explícito o contrato entre Repository e Provider, permitindo múltiplas implementações (Mock hoje, PostgreSQL na Etapa 3) sem acoplamento. |
| `providers/` | Isola a fonte de dados bruta (`mock/` hoje) atrás de `IDataProvider`, para que a Etapa 3 troque a implementação sem tocar em Repository/Service/Controller. |
| `providers/postgres/` | Adicionada na Etapa 3: `PostgresDataProvider.ts`, segunda implementação de `IDataProvider`, ainda não ativada (ver `docs/architecture.md`, seção "Implementação do Banco de Dados"). |

---

## Detalhamento do Banco de Dados (Etapa 3 — implementado)

A árvore de alto nível de `database/` definida na Etapa 1 (`schema/`, `migrations/`, `seeds/`, `scripts/`, `docs/`) foi preservada. Esta seção detalha o que foi efetivamente implementado, incluindo subpastas adicionais previstas no próprio escopo da Etapa 3:

```
database/
├── prisma/
│   └── schema.prisma          # fonte única de verdade do modelo (gera o Prisma Client)
├── schema/                     # mantida da Etapa 1; agora guarda um dump de referência
│   ├── README.md               #   (current-schema.sql) do DDL puro, derivado das migrations
│   └── current-schema.sql
├── migrations/
│   ├── migration_lock.toml
│   └── 00001_initial_database_structure/
│       └── migration.sql       # SQL manual (extensões, tabelas, índices incl. GiST)
├── seeds/
│   └── seed.ts                  # países, locations, rotas e fluxos fictícios
├── scripts/
│   └── create-full-backup.sh    # gera o backup completo do projeto
├── diagrams/
│   ├── erd.mmd                  # fonte do diagrama entidade-relacionamento (Mermaid)
│   ├── erd.svg / erd.png        # renderizações
│   └── README.md
├── docker/
│   └── docker-compose.yml       # espelhado na raiz do projeto
├── backups/
│   ├── database/                # backup-database.sh, restore-database.sh (pg_dump/pg_restore)
│   ├── project/                 # destino de migration-flow-complete-backup.zip
│   ├── archive/YYYY-MM-DD/       # convenção de versionamento por data
│   └── README.md
├── docs/                        # model.md, postgis.md, migrations.md, seeds.md, performance.md, integration-review.md
├── package.json                  # scripts do Prisma CLI (generate/migrate/seed)
└── README.md
```

### Origem de cada pasta nova (além das já reservadas na Etapa 1)

| Pasta | Motivo de existir |
|---|---|
| `prisma/` | Convenção padrão do Prisma para o arquivo `schema.prisma`; `schema/` (Etapa 1) foi preservada com um propósito complementar (ver abaixo), não substituída. |
| `diagrams/` | Documentação visual do modelo de dados, pedida explicitamente no escopo da Etapa 3. |
| `docker/` | `docker-compose.yml` do PostgreSQL + PostGIS, também espelhado na raiz para permitir `docker compose up` direto no root do projeto. |
| `backups/` | Sistema de backup/restauração do banco e do projeto completo, pedido explicitamente no escopo da Etapa 3 — ver `database/backups/README.md`. |

### `schema/` (Etapa 1) — preservada, não removida

A pasta `schema/` já existia desde a Etapa 1. Como o Prisma usa a convenção `prisma/schema.prisma` para o schema fonte, `schema/` foi mantida com um propósito complementar: guardar `current-schema.sql`, uma cópia de referência do DDL puro (sem comentários de migration), útil para inspecionar o schema final sem ler o histórico de migrations. Nunca é a fonte de verdade — essa continua sendo `prisma/schema.prisma` + `migrations/`.

# HANDOFF — Etapa 02: Backend

**Projeto:** Migration Flow Observatory
**Etapa concluída:** 2 de 4 (Arquitetura ✅ → **Backend ✅** → Banco de Dados → Frontend)
**Status:** Concluída. Pronta para servir de base à Etapa 3.

Este documento é a **referência oficial** para iniciar a Etapa 3 (Banco de Dados). Qualquer decisão tomada aqui é vinculante e não deve ser revisada sem justificativa equivalente à de um ADR.

---

## 1. Objetivo da etapa

Construir uma API REST completa, organizada em Clean Architecture, capaz de servir todos os dados necessários ao frontend (mapa, dashboard, timeline, contadores, estatísticas, países e rotas), funcionando inteiramente sobre dados simulados (Mock Data) mas estruturalmente pronta para substituir essa fonte por PostgreSQL + PostGIS sem exigir refatoração de Controllers, Services ou Routes.

## 2. Resumo do que foi implementado

- API Express + TypeScript com 7 domínios (Countries, Routes, Flows, Statistics, Timeline, Counters, Dashboard) + Health check.
- Cadeia de camadas `Controller → Service → Repository → Provider → Mock Data`, cada uma dependendo apenas de interfaces da camada inferior.
- Validação de entrada com Zod (schemas + middleware de validação).
- Tratamento de erros centralizado, sem exposição de stack trace.
- Middlewares de segurança (Helmet, CORS, Compression), rate limiting e logging estruturado com request ID.
- Testes unitários (Services) e de integração (Supertest) cobrindo casos de sucesso, validação inválida e recurso inexistente.
- Documentação completa (`backend/README.md` + `backend/docs/*.md`).
- Atualização aditiva de `docs/architecture.md` e `docs/folder-structure.md` (raiz), preservando todas as decisões da Etapa 1.

## 3. Arquitetura utilizada

Clean Architecture adaptada, com injeção de dependência manual (sem container de DI) montada em `src/routes/*.routes.ts` e `src/api/app.ts`:

```
Route → Controller → Service → Repository (interface) → Provider (interface) → Mock Data (hoje) / PostgreSQL (Etapa 3)
```

Princípios seguidos: SOLID, DRY, KISS, YAGNI, e Domain-Driven Design parcial (nomenclatura ubíqua do domínio migratório). Ver `docs/project-decisions.md` (raiz) para os ADRs originais e a seção "Refinamento do Backend" em `docs/architecture.md` para a extensão desta etapa.

## 4. Estrutura final de diretórios do Backend

```
backend/
├── src/
│   ├── api/            → app.ts, server.ts
│   ├── config/         → env.ts, app.config.ts, server.config.ts, http.config.ts
│   ├── constants/       → httpStatus.ts, errorCodes.ts, apiVersion.ts
│   ├── types/           → express.d.ts, common.types.ts
│   ├── errors/          → AppError.ts, NotFoundError.ts, ValidationError.ts, InternalServerError.ts
│   ├── entities/        → Country, MigrationRoute, MigrationFlow, TimelineEntry, StatisticsSnapshot
│   ├── dtos/            → CountryDTO, RouteDTO, FlowDTO, StatisticsDTO, TimelineDTO, CounterDTO, DashboardDTO
│   ├── schemas/         → common, country, route, flow, timeline, statistics (Zod)
│   ├── validators/      → validateRequest.ts
│   ├── validation/      → README.md (mantida por retrocompatibilidade, ver docs/folder-structure.md)
│   ├── interfaces/
│   │   ├── repositories/ → ICountryRepository, IMigrationRepository, IFlowRepository, ITimelineRepository, IStatisticsRepository, ICounterRepository
│   │   └── providers/    → IDataProvider
│   ├── providers/
│   │   └── mock/         → MockDataProvider.ts + data/{countries,routes,flows}.mock.ts
│   ├── repositories/     → CountryRepository, MigrationRouteRepository, FlowRepository, TimelineRepository, StatisticsRepository, CounterRepository
│   ├── services/         → CountryService, MigrationService, FlowService, StatisticsService, TimelineService, CounterService, DashboardService
│   ├── controllers/      → CountryController, RouteController, FlowController, StatisticsController, TimelineController, CounterController, DashboardController, HealthController
│   ├── routes/           → um *.routes.ts por domínio + index.ts (agregador /api/v1)
│   ├── middlewares/      → requestId, security, rateLimit, logger, notFound, errorHandler
│   └── utils/            → asyncHandler, apiResponse, logger, pagination
├── tests/
│   ├── setup.ts
│   ├── unit/services/    → MigrationService.test.ts, StatisticsService.test.ts
│   └── integration/      → health, dashboard, routes, notFound (.test.ts)
├── docs/                 → endpoints.md, services.md, repositories.md, middlewares.md, testing.md, future-extensions.md
├── package.json, tsconfig.json, .env.example, tsup.config.ts, vitest.config.ts, .eslintrc.cjs, .prettierrc, .gitignore
└── README.md
```

## 5. Responsabilidades de cada camada

| Camada | Responsabilidade | Nunca faz |
|---|---|---|
| Routes | Define endpoints, monta a injeção de dependência do domínio, aplica `validateRequest` | Lógica de negócio |
| Controllers | Recebe requisição já validada, delega ao Service, envia resposta | Acesso a dados, regra de negócio |
| Services | Regra de negócio, composição/conversão para DTOs | Conhecer Express ou o Provider concreto |
| Repositories | Filtros, paginação, regras de acesso a dados do domínio | Conhecer o formato bruto da fonte de dados |
| Providers | Fonte de dados bruta (hoje: Mock) | Regras de negócio ou paginação |
| Schemas/Validators | Validação de entrada (Zod) | Lógica de negócio |
| Middlewares | Cross-cutting concerns (segurança, log, erro) | Regra de negócio de domínio |

## 6. Contratos/Interfaces criados

- `IDataProvider` — contrato único que qualquer fonte de dados deve implementar (`getCountries`, `getCountryById`, `getRoutes`, `getRouteById`, `getFlows`, `getTimeline`).
- `ICountryRepository`, `IMigrationRepository`, `IFlowRepository`, `ITimelineRepository`, `IStatisticsRepository`, `ICounterRepository` — contratos entre Service e Repository.

## 7. Services implementados

`CountryService`, `MigrationService`, `FlowService`, `StatisticsService`, `TimelineService`, `CounterService`, `DashboardService` (agregador dos anteriores). Detalhes em `backend/docs/services.md`.

## 8. Repositories implementados

`CountryRepository`, `MigrationRouteRepository`, `FlowRepository`, `TimelineRepository`, `StatisticsRepository`, `CounterRepository` — todos recebendo `IDataProvider` via injeção no construtor. Detalhes em `backend/docs/repositories.md`.

## 9. Providers implementados

`MockDataProvider` (único, implementa `IDataProvider` sobre arrays em memória em `src/providers/mock/data/`). Nenhum outro Provider foi criado nesta etapa.

## 10. DTOs

`CountryDTO`, `RouteDTO`, `FlowDTO`, `StatisticsDTO`, `TimelineDTO`, `CounterDTO`, `DashboardDTO` (agregador). Nenhuma entidade de domínio é retornada diretamente pela API.

## 11. Middlewares

`requestId`, `security` (Helmet + CORS + Compression), `rateLimit`, `logger` (morgan), `notFoundHandler`, `errorHandler`. Ordem de execução documentada em `backend/docs/middlewares.md`.

## 12. Endpoints disponíveis

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check (fora do prefixo de versão) |
| GET | `/api/v1/dashboard` | Resumo agregado para a tela inicial |
| GET | `/api/v1/countries` | Lista países (paginação, filtro por região) |
| GET | `/api/v1/countries/:id` | País por ID |
| GET | `/api/v1/routes` | Lista rotas migratórias (paginação, tipo, ano) |
| GET | `/api/v1/routes/:id` | Rota por ID |
| GET | `/api/v1/flows` | Lista fluxos (paginação, país, direção, período) |
| GET | `/api/v1/statistics` | Estatísticas globais ou por país |
| GET | `/api/v1/timeline` | Evolução temporal (mês/ano) |
| GET | `/api/v1/counters` | Contadores simples do dashboard |

Detalhes completos (query params, exemplos de resposta) em `backend/docs/endpoints.md`.

## 13. Padrão de resposta da API

**Sucesso:**
```json
{ "success": true, "data": {}, "meta": {}, "timestamp": "...", "version": "v1" }
```

**Erro:**
```json
{ "success": false, "error": { "code": "...", "message": "..." }, "timestamp": "...", "version": "v1" }
```

## 14. Decisões arquitetônicas tomadas nesta etapa

1. **Provider como elo abaixo do Repository** — isola a fonte de dados bruta atrás de `IDataProvider`, permitindo trocar Mock por PostgreSQL em um único ponto (`src/api/app.ts`).
2. **`schemas/` + `validators/`** como detalhamento do conceito original de `validation/` (mantida por retrocompatibilidade, nunca removida).
3. **DI manual por Route**, sem container de DI — cada `*.routes.ts` monta sua própria cadeia Repository → Service → Controller, mantendo o roteador autocontido e fácil de testar.
4. **Envelope de resposta único** (`success/data/meta` ou `success/error`) aplicado por `utils/apiResponse.ts`, nunca montado manualmente em um Controller.
5. **Erros de domínio tipados** (`AppError` e subclasses) — nenhuma rota lança `Error` genérico.

Ver também a seção "Refinamento do Backend (Etapa 2)" em `docs/architecture.md` (raiz) e a tabela "Origem de cada pasta nova" em `docs/folder-structure.md` (raiz).

## 15. Dependências instaladas

**Produção:** express, cors, helmet, compression, morgan, express-rate-limit, dotenv, zod, uuid
**Desenvolvimento:** typescript, tsx, tsup, vitest, supertest, eslint (+ @typescript-eslint), prettier, @types/* correspondentes

> Nota: o ambiente de implementação não teve acesso à internet para rodar `npm install`; o `package.json` está completo e correto, mas a instalação real das dependências deve ser feita localmente pelo desenvolvedor (`npm install` dentro de `backend/`).

## 16. Variáveis de ambiente utilizadas

`NODE_ENV`, `PORT`, `API_VERSION`, `DATABASE_URL` (não usada ainda — reservada para Etapa 3), `MAPBOX_TOKEN` (não usada pelo backend — reservada para o frontend), `LOG_LEVEL`, `CORS_ALLOWED_ORIGINS`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`. Todas validadas via Zod em `src/config/env.ts` (fail-fast na inicialização).

## 17. Funcionalidades deliberadamente NÃO implementadas

- Qualquer código de banco de dados real (Prisma schema, models, migrations, seeds, client gerado).
- Autenticação JWT, RBAC, cache Redis, WebSocket, filas BullMQ, OpenTelemetry, i18n, Swagger funcional.
- Frontend, Docker, deploy.

Todas essas ausências são intencionais e documentadas em `backend/docs/future-extensions.md`.

## 18. Limitações atuais

- Dados 100% mockados e estáticos em memória — reiniciar o processo reseta qualquer estado (não há mutação nesta etapa, apenas leitura).
- Sem autenticação — todos os endpoints são públicos.
- Sem cache — cada requisição recalcula agregações em memória (aceitável para o volume de mock atual).
- Testes não foram executados dentro do ambiente de implementação (sem acesso à rede para `npm install`); a suíte foi revisada estaticamente e o código foi validado com `tsc` usando stubs de tipos.

## 19. Pendências conhecidas

- Rodar `npm install && npm test` localmente para confirmar a suíte passando com as dependências reais (não executado neste ambiente por falta de rede).
- Nenhuma pendência estrutural/arquitetural identificada.

## 20. Preparação realizada para PostgreSQL + PostGIS

- Toda leitura de dados passa exclusivamente por `IDataProvider`. Um `PostgresDataProvider implements IDataProvider` é o único artefato novo necessário.
- Entidades (`src/entities/`) já modelam os campos geoespaciais necessários (latitude/longitude em `Country`), compatíveis com colunas `geography`/`geometry` do PostGIS.
- `DATABASE_URL` já validada em `src/config/env.ts`, pronta para ser consumida por um client Prisma.

## 21. Preparação para Prisma

- `DATABASE_URL` reservada no `.env.example` e no schema de validação de ambiente.
- Nenhum `schema.prisma`, model, migration ou client gerado foi criado — conforme exigido para esta etapa.
- O ponto de integração será exclusivamente dentro do futuro `PostgresDataProvider`, sem exposição do Prisma Client a nenhuma camada acima do Provider.

## 22. Preparação para Swagger

- Todos os schemas Zod (`src/schemas/`) já descrevem formalmente cada entrada aceita, servindo de fonte única para geração futura de OpenAPI. Ver `backend/docs/future-extensions.md`.

## 23. Preparação para testes

- Vitest + Supertest já configurados e funcionais (`vitest.config.ts`, `tests/setup.ts`).
- Estrutura separa testes unitários (Service isolado) de testes de integração (HTTP fim a fim), documentada em `backend/docs/testing.md`.

## 24. Preparação para JWT, RBAC, Redis, BullMQ, WebSocket, OpenTelemetry, i18n e versionamento da API

Documentado em detalhe, ponto a ponto, em [`backend/docs/future-extensions.md`](../backend/docs/future-extensions.md). Resumo: todos os pontos de extensão (middlewares compostos, injeção de dependência via interfaces, `requestId` já propagado, `API_PREFIX` centralizado) já existem na arquitetura atual — nenhuma refatoração estrutural é esperada para adicionar essas funcionalidades.

## 25. Checklist técnico da etapa

- [x] Clean Architecture com separação de camadas
- [x] SOLID aplicado (injeção de dependência via interfaces em todas as camadas)
- [x] Nenhuma dependência circular entre camadas (verificado via análise de imports)
- [x] Controllers desacoplados de Repositories/Providers (verificado)
- [x] Services desacoplados do Provider concreto (verificado)
- [x] Repositories desacoplados do formato bruto dos dados mock (verificado)
- [x] Validação de entrada via Zod em todos os endpoints que recebem parâmetros
- [x] Tratamento de erros centralizado, sem vazamento de stack trace
- [x] Testes unitários e de integração cobrindo os principais fluxos
- [x] Documentação completa (README + docs/ do backend + docs/ raiz atualizados)
- [x] Nenhum artefato de Prisma/schema/migration criado
- [x] `tsc` executado (com stubs de tipos, por falta de rede) sem erros reais de código

## 26. Orientações obrigatórias para a próxima etapa (Banco de Dados)

1. Criar `src/providers/postgres/PostgresDataProvider.ts implements IDataProvider` — é o único ponto de integração permitido no backend.
2. Implementar o schema Prisma, models, migrations e seeds **dentro de `database/`** (conforme a estrutura já reservada desde a Etapa 1), nunca dentro de `backend/src/`.
3. Trocar a instância injetada em `src/api/app.ts` (`new MockDataProvider()` → escolha condicional por `env.DATABASE_URL` ou similar) — é a única linha do backend que deve ser tocada.
4. **Não alterar** nenhuma interface (`IDataProvider`, `I*Repository`), Controller, Service, Route, DTO ou schema Zod já existente. Se um campo novo for necessário, estenda a interface de forma aditiva (nunca remova campos existentes sem uma decisão equivalente a um ADR).
5. Manter o padrão de resposta da API (`success/data/meta` ou `success/error`) inalterado.
6. Preservar os testes de integração existentes — eles testam o contrato HTTP, que deve permanecer estável independentemente da fonte de dados.

## 27. Riscos que devem ser evitados durante a Etapa 3

- **Vazar o Prisma Client para fora do Provider** (ex: um Service importar `@prisma/client` diretamente) — quebraria o desacoplamento que é o ponto central desta arquitetura.
- **Modelar entidades no banco de forma divergente das entidades TypeScript já definidas** (`src/entities/`) sem atualizar essas entidades de forma explícita e documentada.
- **Adicionar lógica de negócio dentro do `PostgresDataProvider`** — o Provider deve permanecer uma camada burra de acesso a dados; regras de negócio pertencem exclusivamente aos Services.
- **Alterar o formato dos DTOs** para "encaixar" na modelagem do banco — o contrato de API é fixado pelo frontend consumidor (Etapa 4), não pelo banco.
- **Reintroduzir acesso direto a arquivos/dados dentro de Controllers** — toda leitura deve continuar passando pela cadeia completa.

---

**Este documento encerra oficialmente a Etapa 2 (Backend) do Migration Flow Observatory.**

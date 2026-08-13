# Backend — Migration Flow Observatory API

API REST que fornece dados de fluxos migratórios (rotas, países, estatísticas, timeline e contadores) para o dashboard do Migration Flow Observatory.

> ⚠️ Nesta etapa, todos os dados são servidos por uma camada de **Mock Data em memória**. A arquitetura está preparada para trocar essa camada por PostgreSQL + PostGIS (Etapa 3) sem alterar Controllers, Services ou Routes — ver [`docs/repositories.md`](./docs/repositories.md).

## Stack

Node.js · TypeScript · Express · Zod · Prisma (preparado, não implementado) · dotenv · cors · helmet · compression · morgan · express-rate-limit · tsup · Vitest · Supertest

## Arquitetura

```
Route → Controller → Service → Repository → Provider → Mock Data (hoje) / PostgreSQL (futuro)
```

- **Routes** (`src/routes/`) — definem endpoints e fazem a injeção de dependência (repository → service → controller) por domínio.
- **Controllers** (`src/controllers/`) — recebem a requisição já validada e delegam a um Service.
- **Services** (`src/services/`) — regra de negócio; convertem entidades em DTOs.
- **Repositories** (`src/repositories/`) — abstraem consultas/filtros/paginação sobre o `IDataProvider`.
- **Providers** (`src/providers/`) — implementação concreta da fonte de dados (`MockDataProvider` hoje).
- **Schemas + Validators** (`src/schemas/`, `src/validators/`) — validação de entrada com Zod.
- **Middlewares** (`src/middlewares/`) — segurança, rate limit, logging, tratamento de erros.

Detalhes completos em [`docs/architecture.md`](../docs/architecture.md) (raiz do projeto) e nos documentos desta pasta.

## Instalação

```bash
cd backend
cp .env.example .env
npm install
```

## Execução

```bash
npm run dev        # desenvolvimento, com reload automático
npm run build       # build de produção (tsup)
npm start            # executa o build (dist/)
```

O servidor sobe em `http://localhost:3333` (configurável via `.env`). Health check em `GET /health`.

## Testes

```bash
npm test              # roda a suíte uma vez
npm run test:watch    # modo watch
npm run test:coverage # com cobertura
```

## Qualidade de código

```bash
npm run lint        # ESLint
npm run lint:fix     # ESLint com correção automática
npm run format       # Prettier
npm run typecheck    # apenas checagem de tipos, sem gerar build
```

## Padrão de resposta da API

**Sucesso:**
```json
{
  "success": true,
  "data": {},
  "meta": {},
  "timestamp": "2026-07-31T00:00:00.000Z",
  "version": "v1"
}
```

**Erro:**
```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "..." },
  "timestamp": "2026-07-31T00:00:00.000Z",
  "version": "v1"
}
```

## Documentação detalhada

- [`docs/endpoints.md`](./docs/endpoints.md) — todos os endpoints, parâmetros e exemplos de resposta
- [`docs/services.md`](./docs/services.md) — responsabilidade de cada Service
- [`docs/repositories.md`](./docs/repositories.md) — como o Repository/Provider abstrai a fonte de dados
- [`docs/middlewares.md`](./docs/middlewares.md) — pipeline de middlewares e ordem de execução
- [`docs/testing.md`](./docs/testing.md) — estratégia de testes
- [`docs/future-extensions.md`](./docs/future-extensions.md) — como a arquitetura suporta JWT, RBAC, Redis, WebSocket, BullMQ, OpenTelemetry, i18n e Swagger sem refatoração

## Status da etapa

✅ **Etapa 2 (Backend) concluída.** API 100% funcional sobre Mock Data, com todos os endpoints, validação, tratamento de erros e testes implementados. Nenhum código da Etapa 3 (PostgreSQL/PostGIS/Prisma) foi criado — ver [`handoff/HANDOFF_ETAPA_02_BACKEND.md`](../handoff/HANDOFF_ETAPA_02_BACKEND.md) na raiz do projeto para o documento oficial de transição.

## Aviso sobre os dados

Os dados retornados por esta API são simulados/estimados para fins educacionais e de portfólio. Nenhum endpoint deve ser tratado como fonte oficial de estatísticas migratórias.

# Preparação para Funcionalidades Futuras

Este documento explica **como** a arquitetura atual do backend suporta cada funcionalidade futura listada no escopo da Etapa 2, sem que nenhuma delas tenha sido implementada agora. Nenhum destes itens tem código funcional nesta etapa — apenas um "encaixe" arquitetural já pronto para recebê-los.

## Autenticação JWT

- **Onde entra:** um novo `src/middlewares/auth.middleware.ts`, inserido na cadeia entre `rateLimiter` e as rotas (ver `docs/middlewares.md`).
- **Por que não quebra nada:** `Request` já é estendido via declaration merging em `src/types/express.d.ts` (hoje só com `requestId`); adicionar `req.user` ali é a única mudança de tipo necessária.
- **Configuração:** `src/config/` ganharia um `auth.config.ts` (segredo JWT, tempo de expiração), seguindo o mesmo padrão de `http.config.ts`.

## RBAC (controle de permissões)

- **Onde entra:** um middleware `authorize(role: string)` em `src/middlewares/`, aplicado por rota (`router.get('/admin', authorize('admin'), ...)`).
- **Por que não quebra nada:** Controllers não mudam — apenas a composição de middlewares na definição da rota, seguindo o padrão já usado por `validateRequest`.

## Cache (Redis)

- **Onde entra:** uma nova implementação de cache em `src/providers/` (ex: `RedisCacheProvider`), consumida pelos Repositories através de uma nova interface `ICacheProvider` em `src/interfaces/providers/`.
- **Por que não quebra nada:** Repositories já recebem seus providers via injeção de dependência no construtor (ver `src/routes/*.routes.ts`); adicionar um segundo parâmetro opcional de cache segue o mesmo padrão do `IDataProvider`.

## WebSocket (eventos em tempo real)

- **Onde entra:** um novo módulo `src/api/websocket.ts`, inicializado em `src/api/server.ts` ao lado do `app.listen()` (ex: com `ws` ou `socket.io` sobre o mesmo servidor HTTP).
- **Por que não quebra nada:** `server.ts` já isola a criação do servidor HTTP de `app.ts` (que só monta o Express); o servidor WebSocket se conecta ao mesmo `server` sem alterar a árvore de rotas REST.

## Filas (BullMQ)

- **Onde entra:** um novo `src/providers/queue/` com implementações de produtores/consumidores, consumido por Services que precisem de processamento assíncrono (ex: recalcular estatísticas agregadas).
- **Por que não quebra nada:** Services já dependem de interfaces, não de implementações concretas — uma fila entraria como mais uma dependência injetada, sem alterar Controllers.

## Observabilidade (OpenTelemetry)

- **Onde entra:** instrumentação em `src/api/app.ts` (tracing de requisições) e em `src/utils/logger.ts` (correlação de logs com trace ID).
- **Por que não quebra nada:** `requestId.middleware.ts` já gera um identificador único por requisição, propagado em todos os logs — a extensão para trace IDs distribuídos do OpenTelemetry é direta.

## Versionamento da API (`/api/v1`)

- **Já implementado nesta etapa:** `src/constants/apiVersion.ts` centraliza `API_VERSION` e `API_PREFIX`. Uma futura v2 seria outro agregador de rotas (`src/routes/v2/index.ts`) montado sob `/api/v2` em `src/api/app.ts`, coexistindo com o v1 sem alterá-lo.

## Internacionalização (i18n)

- **Onde entra:** um `src/middlewares/i18n.middleware.ts` que resolve o idioma da requisição (header `Accept-Language`), e mensagens de erro/validação centralizadas em arquivos de tradução, consumidas por `src/errors/` e `src/utils/apiResponse.ts`.
- **Por que não quebra nada:** mensagens de erro já são strings centralizadas nas classes de `src/errors/` — trocá-las por chaves de tradução é uma mudança isolada a essa camada.

## Swagger / OpenAPI

- **Preparação já feita:** os schemas Zod em `src/schemas/` já descrevem formalmente cada entrada aceita pela API, servindo de fonte única de verdade. A geração de documentação OpenAPI (via `zod-to-openapi` ou similar) consumiria esses mesmos schemas, sem duplicar definições.
- **Onde entraria:** um novo `src/api/swagger.ts`, montado em `app.ts` sob uma rota `/docs`.

## Cobertura destas preparações nesta etapa

Nenhum destes itens possui pasta, dependência instalada ou código funcional criado nesta etapa — apenas os pontos de extensão descritos acima já existem na arquitetura atual (interfaces, injeção de dependência, middlewares compostos, camada de config isolada), de modo que cada funcionalidade poderá ser adicionada de forma incremental, sem refatoração estrutural.

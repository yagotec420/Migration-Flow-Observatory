# Middlewares

## Ordem de execução (definida em `src/api/app.ts`)

1. **`requestId`** — gera/propaga um `X-Request-Id`, usado em todos os logs subsequentes da requisição.
2. **`securityMiddlewares`** (Helmet, CORS, Compression) — cabeçalhos de segurança, política de origem e compressão de resposta.
3. **`requestLogger`** (morgan) — log estruturado de cada requisição, incluindo o `requestId`.
4. **`express.json()` / `express.urlencoded()`** — parsing do corpo da requisição.
5. **`rateLimiter`** — limita requisições por IP na janela configurada (`RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS`).
6. Rotas (`/health`, `/api/v1/*`) — cada rota aplica seu próprio `validateRequest(schema)` antes de chegar ao Controller.
7. **`notFoundHandler`** — captura qualquer rota não definida (404 padronizado).
8. **`errorHandler`** — último middleware da cadeia; captura qualquer erro lançado por Controllers/Services/Repositories.

## Por que a ordem importa

- `requestId` precisa vir **antes** de `requestLogger`, para que o log já inclua o ID.
- `rateLimiter` vem **depois** do parsing do corpo, mas **antes** das rotas, para rejeitar excesso de tráfego o quanto antes.
- `notFoundHandler` e `errorHandler` são sempre os **últimos** — Express só executa middlewares de erro (4 parâmetros) quando registrados por último.

## Tratamento de erros

Todo erro de domínio deve ser lançado como uma subclasse de `AppError` (`src/errors/`). O `errorHandler` nunca expõe stack trace ao cliente — apenas loga internamente (`utils/logger.ts`) e retorna o envelope de erro padronizado.

| Classe | Quando usar |
|---|---|
| `NotFoundError` | Recurso específico não encontrado (ex: país com ID inválido) |
| `ValidationError` | Entrada inválida (normalmente lançado automaticamente por `validateRequest`) |
| `InternalServerError` | Falhas inesperadas de infraestrutura |

## Preparação para autenticação futura (Etapa 3+)

O middleware de autenticação/JWT ainda não existe. Quando for implementado, deve ser inserido **entre** `rateLimiter` e as rotas, seguindo o mesmo padrão: um middleware puro em `src/middlewares/`, configurado via `src/config/`, sem lógica de negócio.

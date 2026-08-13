# Endpoints da API

Base URL: `http://localhost:3333`
Prefixo de versão: `/api/v1` (exceto `/health`)

Todos os endpoints retornam o [padrão de resposta](../README.md#padrão-de-resposta-da-api) da API.

---

## Health

### `GET /health`

Verifica se a API está no ar. Não usa o prefixo `/api/v1` (convenção de health checks para orquestradores).

**Resposta:**
```json
{
  "success": true,
  "data": { "status": "ok", "service": "Migration Flow Observatory API", "version": "v1", "uptimeSeconds": 12.3 }
}
```

---

## Dashboard

### `GET /api/v1/dashboard`

Retorna um resumo agregado: contadores, estatísticas globais, timeline recente (últimos 6 meses) e rotas em destaque. Pensado para carregar a tela inicial do dashboard em uma única requisição.

---

## Países

### `GET /api/v1/countries`

**Query params:** `page` (padrão 1), `limit` (padrão 20, máx. 100), `region` (opcional)

### `GET /api/v1/countries/:id`

Retorna um país específico ou `404 NOT_FOUND`.

---

## Rotas migratórias

### `GET /api/v1/routes`

**Query params:** `page`, `limit`, `type` (`departure` | `return` | `transit`), `year`

### `GET /api/v1/routes/:id`

Retorna uma rota específica, com os países de origem/destino já enriquecidos (nome, ISO code, coordenadas).

---

## Fluxos

### `GET /api/v1/flows`

**Query params:** `page`, `limit`, `countryId`, `direction` (`outbound` | `inbound`), `startDate`, `endDate` (ISO 8601)

---

## Estatísticas

### `GET /api/v1/statistics`

**Query params:** `countryId` (opcional — se ausente, retorna estatísticas globais)

Retorna totais de entrada/saída, saldo migratório e as rotas de maior volume.

---

## Timeline

### `GET /api/v1/timeline`

**Query params:** `countryId`, `granularity` (`month` padrão | `year`), `startDate`, `endDate`

Retorna a evolução histórica de entradas/saídas/saldo por período.

---

## Contadores

### `GET /api/v1/counters`

Retorna indicadores simples para os cards do dashboard (total de países monitorados, rotas mapeadas, pessoas estimadas nos fluxos).

---

## Erros comuns

| Status | Código | Quando ocorre |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Query/params fora do schema Zod esperado |
| 404 | `NOT_FOUND` | Recurso inexistente ou rota HTTP inexistente |
| 429 | `RATE_LIMIT_EXCEEDED` | Limite de requisições excedido |
| 500 | `INTERNAL_ERROR` | Erro inesperado (nunca expõe stack trace) |

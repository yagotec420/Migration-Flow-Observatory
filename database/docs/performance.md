# Performance

## Índices criados

| Tabela | Índice | Motivo |
|---|---|---|
| `country` | `iso_code` (único) | Lookup direto por código ISO (usado pelo seed e por qualquer integração futura) |
| `country` | `continent` | Filtros por região no endpoint `GET /countries?region=` |
| `location` | `country_id` | Join `Country → Location` |
| `location` | `type` | Filtro por granularidade (cidade/país/região) |
| `location` | `geometry` (**GiST**) | Consultas espaciais (`ST_DWithin`, `ST_Distance`) — ver `docs/postgis.md` |
| `migration_route` | `origin_location_id`, `destination_location_id` | Joins de rota |
| `migration_route` | `status` | Filtrar rotas ativas/inativas |
| `migration_flow` | `route_id` | Join `Route → Flow` |
| `migration_flow` | `(year, month)` composto | Filtros temporais — o padrão de consulta mais comum do dashboard/timeline |
| `migration_flow` | `flow_type` | Filtro por EXIT/RETURN/TRANSIT |
| `migration_flow` | `source_id` | Join com `DataSource` |
| `migration_event` | `location_id`, `date` | Consultas de eventos por local/período |
| `statistics` | `country_id`, `period`, `metric` | Consultas de dashboard pré-agregadas |
| `app_user` | `email` (único) | Login futuro |

## Por que um índice composto em `(year, month)` e não dois separados

A maioria das consultas de dashboard/timeline filtra por período completo (ano E mês), nunca apenas por mês isoladamente (mês 6 de qual ano?). Um índice composto `(year, month)` atende exatamente esse padrão de acesso com uma única leitura de índice; dois índices separados exigiriam o planejador do Postgres combinar bitmaps de dois índices, sendo menos eficiente para este caso de uso específico.

## Preparação para milhões de registros

- **`migration_flow` é a tabela que mais cresce** (um registro por rota/período/tipo). Os índices em `route_id` e `(year, month)` garantem que consultas de dashboard (que sempre filtram por período e/ou rota) não façam full table scan mesmo com dezenas de milhões de linhas.
- **Particionamento por ano** (`PARTITION BY RANGE (year)`) é o próximo passo natural quando o volume justificar — o schema já isola `year`/`month` como colunas próprias (em vez de um único `DATE`), o que facilita a criação de partições por ano sem migração de dados complexa. Não implementado nesta etapa por ainda não haver volume real que justifique a complexidade operacional adicional.
- **Statistics como cache de agregação**: a tabela `statistics` existe precisamente para evitar recalcular `SUM`/`AVG` sobre milhões de linhas de `migration_flow` a cada requisição do dashboard — um job (fora do escopo desta etapa) pode recalculá-la periodicamente.

## Consultas por período, país, rota e localização

Todas as quatro consultas mencionadas no escopo desta etapa já têm índice de suporte direto:

- **Por período** → `migration_flow_year_month_idx`
- **Por país** → via `location.country_id` (índice) + join, ou diretamente em `statistics.country_id`
- **Por rota** → `migration_flow_route_id_idx`
- **Por localização** → `location_geometry_gist_idx` (proximidade) ou `location.country_id` (associação simples)

## O que não foi otimizado nesta etapa (e por quê)

- **Connection pooling** (PgBouncer) — decisão de infraestrutura de implantação, não de modelagem; documentado como pendência para a Etapa de Deploy (v4 no roadmap raiz).
- **Read replicas** — só se justifica com carga real de leitura medida; prematuro nesta fase de portfólio.
- **Materialized views** para `statistics` — considerado, mas descartado por ora: uma tabela normal populada por job assíncrono é mais simples de explicar e testar nesta etapa; pode evoluir para materialized view sem quebrar o contrato de `IStatisticsRepository` no backend.

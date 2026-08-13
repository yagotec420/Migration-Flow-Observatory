# Componentes

| Componente | Responsabilidade |
| --- | --- |
| `MigrationMap` | Renderiza rotas com Deck.gl e tooltip de contrato `RouteDTO`. |
| `MetricCard` | KPI animado com Framer Motion e indicador LIVE. |
| `LineChart` | Gráfico SVG de saídas e retornos baseado em `TimelineDTO`. |
| `Filters` | Filtros locais que formam consultas para rotas. |
| `TimelineControls` | Granularidade, slider e play/pause do período. |

Componentes não fazem `fetch`; dados remotos chegam por hooks React Query.

# Services

Toda regra de negócio do backend vive nesta camada. Um Service nunca conhece Express (`req`/`res`) nem a fonte de dados concreta (Mock ou, futuramente, Postgres) — ele depende apenas das interfaces em `src/interfaces/repositories/`.

| Service | Responsabilidade | Depende de |
|---|---|---|
| `CountryService` | Lista e busca países, convertendo `Country` (entidade) em `CountryDTO` | `ICountryRepository` |
| `MigrationService` | Lista e busca rotas migratórias, enriquecendo cada rota com os dados completos dos países de origem/destino | `IMigrationRepository`, `ICountryRepository` |
| `FlowService` | Lista fluxos migratórios mensais, resolvendo o nome do país para cada fluxo | `IFlowRepository`, `ICountryRepository` |
| `StatisticsService` | Calcula/formata snapshot de estatísticas (globais ou por país) | `IStatisticsRepository` |
| `TimelineService` | Formata a evolução temporal, incluindo o rótulo legível do período (`"Mar/2024"`) | `ITimelineRepository` |
| `CounterService` | Formata os contadores simples do dashboard | `ICounterRepository` |
| `DashboardService` | Agrega os demais Services em um único DTO (`DashboardDTO`) para a tela inicial | `CounterService`, `StatisticsService`, `TimelineService`, `MigrationService` |

## Por que Services não acessam o Provider diretamente

Um Service depende de uma **interface** de Repository (`IMigrationRepository`, por exemplo), nunca de uma classe concreta. Isso permite:

1. Testar um Service com um repository mock/fake em memória, sem tocar em HTTP nem no `MockDataProvider` real (ver `docs/testing.md`).
2. Trocar o Repository por uma implementação que consulte PostgreSQL (Etapa 3) sem alterar uma linha sequer dos Services.

## Regra de composição

Services podem depender de outros Services (como `DashboardService` faz), mas **nunca** o inverso de um Controller: um Service nunca importa nada de `src/controllers/`.

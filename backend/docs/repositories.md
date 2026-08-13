# Repositories e Providers

## A cadeia completa

```
Repository (interface)  →  Repository (implementação)  →  Provider (interface)  →  Provider (implementação)
ICountryRepository          CountryRepository                IDataProvider           MockDataProvider
```

- **Repository** aplica filtros, paginação e regras de acesso a dados específicas do domínio (ex: filtrar rotas por tipo e ano).
- **Provider** é a fonte de dados bruta — hoje um array em memória (`src/providers/mock/data/*.mock.ts`), amanhã uma consulta Prisma/PostgreSQL.

## Por que essa camada extra existe

Sem o Provider, o Repository teria a lógica de "onde os dados vivem" (JSON em memória) misturada com a lógica de "como filtrar/paginar". Separando as duas:

- O **Repository** pode ser 100% reaproveitado quando o Provider mudar — a lógica de paginação e filtro não muda se os dados vierem do Postgres em vez de um array.
- O **Provider** fica extremamente simples: apenas busca dados brutos, sem saber o que será feito com eles depois.

## Como trocar Mock por PostgreSQL na Etapa 3

1. Criar `src/providers/postgres/PostgresDataProvider.ts implements IDataProvider`, usando o Prisma Client internamente.
2. Trocar a linha `new MockDataProvider()` em `src/api/app.ts` por `new PostgresDataProvider()` (ou uma escolha condicional via variável de ambiente).
3. Nenhum Repository, Service, Controller ou Route precisa ser alterado — todos dependem apenas de `IDataProvider`.

## Repositories existentes

| Repository | Interface | Provider usado |
|---|---|---|
| `CountryRepository` | `ICountryRepository` | `IDataProvider.getCountries / getCountryById` |
| `MigrationRouteRepository` | `IMigrationRepository` | `IDataProvider.getRoutes / getRouteById` |
| `FlowRepository` | `IFlowRepository` | `IDataProvider.getFlows` |
| `TimelineRepository` | `ITimelineRepository` | `IDataProvider.getTimeline` |
| `StatisticsRepository` | `IStatisticsRepository` | `IDataProvider.getFlows + getRoutes` (agregação) |
| `CounterRepository` | `ICounterRepository` | `IDataProvider.getCountries + getRoutes + getFlows` |

## Sobre os dados mockados

Os arquivos em `src/providers/mock/data/` representam estimativas ilustrativas de fluxos migratórios relacionados ao Irã, criadas para fins de demonstração técnica. Não devem ser tratados como estatística oficial (ver aviso no README raiz do projeto).

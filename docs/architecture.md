# Arquitetura

## Visão geral

O **Migration Flow Observatory** é dividido em três módulos independentes, cada um com sua própria responsabilidade, ciclo de vida e possibilidade de evolução isolada:

```
┌─────────────────┐        HTTP/REST         ┌─────────────────┐        SQL/PostGIS       ┌─────────────────┐
│   frontend/      │ ───────────────────────▶ │    backend/      │ ───────────────────────▶ │   database/      │
│  React + TS      │ ◀─────────────────────── │  Node + Express  │ ◀─────────────────────── │  PostgreSQL      │
│  Deck.gl/Mapbox   │        JSON              │  TypeScript      │        Prisma ORM         │  + PostGIS       │
└─────────────────┘                          └─────────────────┘                          └─────────────────┘
```

Nenhum módulo conhece detalhes internos do outro. Toda comunicação passa por contratos explícitos (APIs REST no caso do frontend, e o schema/Prisma Client no caso do backend). Isso significa que o backend pode ser reescrito em outra linguagem, ou o frontend substituído por outro framework, sem que o restante do sistema precise mudar — desde que o contrato de API seja mantido.

## Por que essa separação

- **Testabilidade**: cada módulo pode ser testado isoladamente, com mocks no lugar dos outros módulos.
- **Escalabilidade de time**: equipes diferentes podem trabalhar em paralelo sem conflitos.
- **Escalabilidade técnica**: o backend pode ser escalado horizontalmente sem impacto no frontend, e vice-versa.
- **Portfólio**: demonstra domínio de arquitetura desacoplada, um dos pontos mais avaliados em processos seletivos para vagas senior/staff.

## Camadas do backend (Clean Architecture)

O backend segue uma adaptação pragmática de Clean Architecture / Arquitetura em Camadas:

1. **Routes** — definem os endpoints HTTP e delegam para os Controllers. Não contêm lógica de negócio.
2. **Controllers** — recebem a requisição HTTP, validam entrada (via camada de Validation) e chamam Services. Não acessam o banco diretamente.
3. **Services** — contêm a lógica de negócio (regras sobre fluxos migratórios, estatísticas, agregações). Não conhecem detalhes de HTTP nem de SQL.
4. **Repositories** — abstraem o acesso a dados (Prisma/PostGIS). São a única camada que "sabe" como os dados são persistidos.
5. **Entities / DTOs** — representam os modelos de domínio e os objetos de transferência entre camadas.
6. **Middlewares** — cross-cutting concerns (autenticação futura, tratamento de erros, logging).

Essa cadeia (`Route → Controller → Service → Repository`) garante que a lógica de negócio nunca fique acoplada a detalhes de infraestrutura (Express, Prisma), facilitando testes e futuras trocas de tecnologia.

## Camadas do frontend

- **Pages** — telas completas, compostas por Layouts e Components.
- **Layouts** — estruturas visuais reutilizáveis (ex: shell do dashboard).
- **Components** — blocos de UI reutilizáveis e sem estado de negócio.
- **Features** — módulos verticais que agrupam componentes, hooks e lógica específica de um domínio (ex: `features/migration-map`, `features/timeline`).
- **Stores (Zustand)** — estado global do cliente (filtros ativos, UI state).
- **Services** — camada de comunicação com a API backend (via React Query).
- **Hooks** — lógica reutilizável de estado e efeitos.
- **Types** — contratos TypeScript compartilhados entre features.

## Fluxo de dados de um fluxo migratório (exemplo conceitual)

1. O usuário aplica um filtro no dashboard (ex: período, país).
2. O `store` (Zustand) atualiza o estado do filtro.
3. Um hook via React Query dispara uma chamada a um `service` do frontend.
4. O `service` chama o endpoint REST correspondente no backend.
5. O `Controller` do backend valida a requisição e delega ao `Service`.
6. O `Service` aplica regras de negócio e consulta o `Repository`.
7. O `Repository` consulta o PostgreSQL/PostGIS via Prisma.
8. Os dados retornam pela mesma cadeia até serem renderizados no mapa (Deck.gl/Mapbox) e nos gráficos do dashboard.

Na fase atual (v1), as etapas 4 a 7 são substituídas por **dados simulados (mock data)**, mantendo o mesmo contrato de resposta que a API real terá futuramente — garantindo que a troca de mock para dados reais não exija alterações no frontend.

## Princípios adotados

- **SOLID** — cada classe/módulo com responsabilidade única, aberto para extensão e fechado para modificação.
- **DRY** — nenhuma lógica duplicada entre camadas.
- **KISS** — soluções simples antes de soluções "espertas".
- **YAGNI** — nada é construído antes de ser necessário (por isso o backend real só chega na v2).
- **Domain-Driven Design (parcial)** — a linguagem ubíqua do domínio (rotas migratórias, fluxos, estatísticas) é refletida diretamente nos nomes de entidades e serviços.

## Nota sobre a natureza dos dados

Este projeto tem finalidade educacional e de demonstração técnica. Os dados utilizados representam estimativas com base em fontes públicas quando disponíveis, e dados simulados quando não há API em tempo real acessível. O sistema nunca deve ser apresentado como fonte oficial de estatísticas migratórias.

---

## Refinamento do Backend (Etapa 2)

A seção original acima definiu a cadeia `Route → Controller → Service → Repository`. Na implementação do backend (Etapa 2), essa cadeia foi **estendida** — não alterada — com um elo adicional abaixo do Repository:

```
Route → Controller → Service → Repository (interface) → Provider (interface) → Mock Data (hoje) / PostgreSQL (Etapa 3)
```

### Por que um Provider além do Repository

O Repository continua sendo a camada que aplica filtros, paginação e regras de acesso a dados do domínio (exatamente como já descrito acima). O Provider é a camada que sabe **de onde** os dados brutos vêm — hoje, arrays em memória (`src/providers/mock/data/*.mock.ts`); na Etapa 3, consultas Prisma/PostgreSQL.

Essa separação significa que:

- O Repository é 100% reaproveitável quando a fonte de dados mudar — a lógica de paginação/filtro não depende de onde os dados residem.
- O Provider é isolado atrás de uma única interface (`IDataProvider`, em `src/interfaces/providers/`), então a troca de Mock por PostgreSQL na Etapa 3 acontece em um único ponto (`src/api/app.ts`), sem alterar Repository, Service, Controller ou Route.

### Subpastas adicionadas em `backend/src/`

Para suportar essa cadeia com responsabilidade única em cada arquivo, as seguintes subpastas foram adicionadas dentro de `backend/src/` (detalhes em `docs/folder-structure.md`): `constants/`, `types/`, `errors/`, `schemas/`, `validators/`, `interfaces/` (com `repositories/` e `providers/`) e `providers/` (com `mock/`). Nenhuma pasta da Etapa 1 foi removida ou renomeada.

### Compatibilidade com a Etapa 3 (Banco de Dados)

O backend está 100% funcional sobre `MockDataProvider`. Quando o banco PostgreSQL + PostGIS for implementado, a única mudança estrutural prevista é a criação de `src/providers/postgres/PostgresDataProvider.ts implements IDataProvider` e a troca da instância injetada em `src/api/app.ts`. Nenhum Controller, Service, Repository, Route, DTO ou schema Zod precisa mudar.

---

## Implementação do Banco de Dados (Etapa 3)

A Etapa 3 criou o módulo `database/` (PostgreSQL + PostGIS + Prisma) e o `PostgresDataProvider.ts` previsto na seção anterior — sem alterar nenhum arquivo já existente do backend além dessa única adição.

### Modelo normalizado vs. entidades de domínio do backend

O schema do banco (`database/prisma/schema.prisma`) modela o domínio com mais granularidade do que as entidades TypeScript da Etapa 2: `Country → Location → MigrationRoute → MigrationFlow`, com a geografia (PostGIS) vivendo em `Location`, não em `Country`, e o volume/período/tipo de movimento vivendo em `MigrationFlow`, não em `MigrationRoute`. Isso diverge da estrutura "achatada" das entidades de domínio (`backend/src/entities/`), que foram desenhadas na Etapa 2 a partir do formato do Mock Data.

Essa diferença é esperada e não é um defeito: um Provider existe exatamente para absorver esse tipo de diferença. `PostgresDataProvider` agrega/traduz o modelo normalizado do banco para o formato exato que `IDataProvider` já exige — a análise completa, conflito por conflito, está em `database/docs/integration-review.md`.

### Por que o Provider Postgres não foi ativado nesta etapa

`backend/src/api/app.ts` continua instanciando `MockDataProvider` por padrão. Trocar essa instância por `PostgresDataProvider` seria uma alteração em um arquivo já existente do backend — fora do escopo autorizado da Etapa 3 (que proibia alterar backend/controllers/services/repositories). A ativação real fica documentada como o próximo passo, de responsabilidade explícita de quem decidir ligá-la em um ambiente com PostgreSQL disponível.

### PostGIS

A extensão PostGIS foi adicionada ao datasource do Prisma (`extensions = [postgis]`, com o preview feature `postgresqlExtensions`). A coluna espacial (`location.geometry`) é modelada como `Unsupported("geometry(Point, 4326)")`, com índice GiST criado manualmente na migration SQL — detalhes em `database/docs/postgis.md`.

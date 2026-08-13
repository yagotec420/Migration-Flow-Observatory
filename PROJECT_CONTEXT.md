# PROJECT_CONTEXT.md

Este arquivo é a referência rápida de contexto do projeto, mantida atualizada a cada etapa. Serve para qualquer pessoa (ou IA) retomar o trabalho sem precisar reler todo o histórico de decisões.

## Objetivo do projeto

**Migration Flow Observatory** é um painel interativo de portfólio que visualiza fluxos migratórios relacionados ao Irã (saídas, retornos, rotas, evolução temporal), com foco em demonstrar engenharia de software de nível sênior para processos seletivos internacionais. Finalidade educacional — nunca uma fonte oficial de estatística migratória (ver aviso no `README.md`).

## Etapas do projeto e status

| Etapa | Escopo | Status |
|---|---|---|
| 1 — Arquitetura | Estrutura de pastas, README, documentação inicial, decisões arquiteturais | ✅ Concluída |
| 2 — Backend | API REST (Node/Express/TypeScript) sobre Mock Data, Clean Architecture | ✅ Concluída |
| 3 — Banco de Dados | PostgreSQL + PostGIS + Prisma, backups, integração com o backend | ✅ Concluída (esta etapa) |
| 4 — Frontend | React + TypeScript + Deck.gl/Mapbox | ⏳ Planejada |

Handoffs detalhados de cada etapa concluída: `handoff/HANDOFF_ETAPA_02_BACKEND.md`, `handoff/HANDOFF_ETAPA_03_DATABASE.md`.

## Arquitetura atual

```
Frontend (Etapa 4, não implementado)
        │  HTTP/REST
        ▼
Backend (Node/Express/TypeScript, Etapa 2)
  Route → Controller → Service → Repository → Provider
                                                  │
                                    ┌─────────────┴─────────────┐
                                    ▼                           ▼
                          MockDataProvider (ativo)   PostgresDataProvider (pronto, não ativado)
                                                                  │
                                                                  ▼
                                              PostgreSQL + PostGIS (Etapa 3)
```

A troca de `MockDataProvider` por `PostgresDataProvider` em `backend/src/api/app.ts` é a única linha do backend que resta tocar para ativar o banco real — deliberadamente não feita na Etapa 3, por estar fora do escopo autorizado daquela etapa (que proibia alterar arquivos existentes do backend). Ver `database/docs/integration-review.md`.

## Tecnologias

- **Frontend (planejado):** React, TypeScript, Vite, TailwindCSS, Framer Motion, Deck.gl, Mapbox GL, React Query, Zustand
- **Backend:** Node.js, Express, TypeScript, Zod, Vitest, Supertest
- **Banco:** PostgreSQL 16, PostGIS 3.4, Prisma ORM
- **Infra:** Docker, Docker Compose

## Estrutura de pastas (visão geral)

```
migration-flow-observatory/
├── backend/     # API REST — ver backend/README.md
├── database/    # Schema Prisma, migrations, seeds, backups — ver database/README.md
├── frontend/    # Reservado para a Etapa 4 (ainda vazio)
├── docs/        # Documentação de arquitetura/decisões, atualizada aditivamente a cada etapa
├── handoff/     # Documentos oficiais de transição entre etapas
├── docker-compose.yml   # PostgreSQL + PostGIS
└── README.md
```

Detalhes completos: `docs/folder-structure.md`.

## Como o banco foi implementado

- Modelo normalizado: `Country → Location → MigrationRoute → MigrationFlow`, com `Statistics`, `MigrationEvent`, `DataSource` e `app_user` (reservado) como suporte.
- PostGIS na coluna `location.geometry` (`Point, 4326`), com índice GiST.
- `PostgresDataProvider` (novo, em `backend/src/providers/postgres/`) traduz o modelo normalizado para o formato exato que as entidades de domínio do backend já esperavam — nenhuma interface, Controller, Service ou Repository do backend foi alterada.

## Decisões importantes a preservar

1. Nenhuma etapa reescreve decisões de etapas anteriores — apenas estende aditivamente (ver seções "Refinamento" em `docs/architecture.md`).
2. Toda tradução entre formato de armazenamento e formato de domínio acontece exclusivamente na camada Provider.
3. O envelope de resposta da API (`success/data/meta` ou `success/error`) é fixo e não muda com a fonte de dados.
4. Dados são sempre tratados como estimativas/simulações — nunca como fonte oficial.
5. O Prisma Client é gerado uma única vez (`output` em `backend/node_modules/.prisma/client`) e compartilhado por dois consumidores — `PostgresDataProvider.ts` (via `@prisma/client` normal) e `database/seeds/seed.ts` (via caminho relativo direto, corrigido após validação real — ver `database/docs/migrations.md`).

## Antes de iniciar a Etapa 4 (Frontend)

Leia, nesta ordem: `docs/architecture.md`, `backend/docs/endpoints.md`, `handoff/HANDOFF_ETAPA_03_DATABASE.md`. O frontend deve consumir a API do backend exatamente como documentada — não há necessidade de conhecer o banco diretamente.

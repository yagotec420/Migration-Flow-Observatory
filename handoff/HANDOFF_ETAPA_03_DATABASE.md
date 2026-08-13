# HANDOFF — Etapa 03: Banco de Dados

**Projeto:** Migration Flow Observatory
**Etapa concluída:** 3 de 4 (Arquitetura ✅ → Backend ✅ → **Banco de Dados ✅** → Frontend)
**Status:** Concluída. Pronta para servir de base à Etapa 4 (Frontend) — e, quando desejado, para a ativação do `PostgresDataProvider` em produção.

---

## 1. Objetivo da etapa

Criar a infraestrutura de dados (PostgreSQL + PostGIS + Prisma) do Migration Flow Observatory, encaixando-se no backend já existente (Etapa 2) sem alterar sua arquitetura, Controllers, Services ou Repositories.

## 2. Resumo do que foi implementado

- Schema Prisma completo: 8 modelos (`Country`, `Location`, `MigrationRoute`, `MigrationFlow`, `MigrationEvent`, `DataSource`, `Statistics`, `User`) + 3 enums (`FlowType`, `LocationType`, `SourceType`).
- PostGIS na coluna `location.geometry` (`Point, 4326`), com índice GiST.
- Migration SQL manual (`00001_initial_database_structure`), escrita à mão por falta de acesso de rede/banco no ambiente de implementação — funcionalmente equivalente ao que `prisma migrate dev` geraria, com o acréscimo do PostGIS/GiST.
- Seed com 9 países, 9 locations, 3 rotas (Irã→Turquia, Irã→Alemanha, Irã→Paquistão) e 9 registros de fluxo, espelhando os países do Mock Data da Etapa 2.
- Docker Compose (PostgreSQL 16 + PostGIS 3.4, volume persistente, credenciais via `.env`) — na raiz do projeto e em `database/docker/`.
- **`PostgresDataProvider.ts`** (novo, único arquivo adicionado ao backend) — implementa `IDataProvider` sobre Prisma, traduzindo o modelo normalizado do banco para o formato exato das entidades de domínio já existentes.
- Sistema completo de backup/restauração (banco via `pg_dump`/`pg_restore`; projeto completo via script de zip).
- Diagrama ER (Mermaid, renderizado em SVG/PNG).
- Documentação completa em `database/docs/` + `PROJECT_CONTEXT.md` + `BACKUP_RESTORE_GUIDE.md` (raiz).
- Atualização aditiva de `docs/architecture.md`, `docs/folder-structure.md` e `docs/roadmap.md` (raiz).

## 3. Arquitetura utilizada

O banco segue o modelo normalizado `Country → Location → MigrationRoute → MigrationFlow`, com `Statistics`, `MigrationEvent`, `DataSource` e `User` (reservado) como suporte. A granularidade geográfica fica em `Location` (não em `Country`), pois é ali que o PostGIS atua.

## 4. Estrutura final de diretórios do Database

```
database/
├── prisma/schema.prisma
├── schema/ (README.md, current-schema.sql — referência; preservada da Etapa 1)
├── migrations/ (migration_lock.toml, 00001_initial_database_structure/migration.sql)
├── seeds/seed.ts
├── scripts/create-full-backup.sh
├── diagrams/ (erd.mmd, erd.svg, erd.png, README.md)
├── docker/docker-compose.yml
├── backups/ (database/, project/, archive/2026-08-01/, README.md)
├── docs/ (model.md, postgis.md, migrations.md, seeds.md, performance.md, integration-review.md)
├── package.json, .env.example
└── README.md
```

## 5. Responsabilidades de cada camada

| Camada | Responsabilidade |
|---|---|
| `prisma/schema.prisma` | Fonte única de verdade do modelo de dados |
| `migrations/` | SQL versionado, aplicável via Prisma Migrate ou `psql` direto |
| `seeds/` | Dados fictícios para desenvolvimento, espelhando o Mock Data da Etapa 2 |
| `docker/` | Infraestrutura local do PostgreSQL + PostGIS |
| `backups/` | Backup/restauração do banco e do projeto completo |
| `PostgresDataProvider` (backend) | Único ponto de tradução entre o schema normalizado e as entidades de domínio do backend |

## 6. Contratos/Interfaces envolvidos

Nenhuma interface nova foi criada no backend. `PostgresDataProvider` implementa a interface já existente `IDataProvider` (Etapa 2), sem modificá-la.

## 7. Modelos Prisma (equivalente a "Services/Repositories" desta etapa)

`Country`, `Location`, `MigrationRoute`, `MigrationFlow`, `MigrationEvent`, `DataSource`, `Statistics`, `User` — ver `database/docs/model.md` para responsabilidade de cada um.

## 8. Providers

- `MockDataProvider` (Etapa 2) — continua ativo por padrão.
- `PostgresDataProvider` (Etapa 3, novo) — implementado e validado estaticamente (`tsc` com stubs de `@prisma/client`, dada a ausência de rede no ambiente de implementação), **não ativado** em `src/api/app.ts`.

## 9. DTOs

Nenhum DTO novo — `PostgresDataProvider` produz exatamente as entidades de domínio já definidas na Etapa 2 (`Country`, `MigrationRoute`, `MigrationFlow`, `TimelineEntry`).

## 10. Middlewares

Nenhum middleware novo nesta etapa.

## 11. Endpoints disponíveis

Inalterados desde a Etapa 2 — ver `backend/docs/endpoints.md`. Nenhum endpoint novo foi criado (fora do escopo desta etapa).

## 12. Padrão de resposta da API

Inalterado — `success/data/meta` ou `success/error`, definido na Etapa 2.

## 13. Decisões arquitetônicas tomadas nesta etapa

1. **Granularidade geográfica em `Location`, não em `Country`** — necessário para o PostGIS operar sobre pontos específicos.
2. **`MigrationFlow` separado de `MigrationRoute`** — normalização que permite uma rota acumular fluxos de múltiplos anos/tipos sem duplicar a definição do caminho.
3. **`confidence_level` como score contínuo (0.0–1.0)**, não um enum — não especificado no escopo, decisão justificada em `database/docs/model.md`.
4. **Soft delete aplicado seletivamente** — apenas em entidades de referência/cadastro (`country`, `location`, `migration_route`, `app_user`), nunca em dados históricos imutáveis.
5. **`PostgresDataProvider` traduz granularidade, não apenas nomes** — a resolução dos 3 conflitos de integração identificados está inteiramente contida nesta classe (ver item 14).
6. **Ativação do provider deliberadamente não realizada** — para não alterar nenhum arquivo já existente do backend, conforme escopo desta etapa.
7. **`schema/` (Etapa 1) preservada**, repropósito para um dump de referência (`current-schema.sql`), já que `prisma/` passou a ser a fonte real.

## 14. Conflitos de integração identificados e resolvidos

Ver `database/docs/integration-review.md` para a análise completa. Resumo:

- **Granularidade de rota**: TS achatado (rota+ano+tipo+volume em um objeto) vs. banco normalizado (rota separada de fluxo) → resolvido agregando `migration_flow` por `(rota, ano, tipo)` em `PostgresDataProvider.getRoutes()`.
- **Granularidade de fluxo**: TS por país vs. banco por rota → resolvido agregando por `(país de origem, direção, ano, mês)`, com `TRANSIT` deliberadamente excluído desta agregação (mesma escolha do Mock Data da Etapa 2).
- **Nome de campo**: `region` (TS) vs. `continent` (banco) → mapeamento direto no Provider, sem renomear nenhum dos dois lados.

## 15. Dependências instaladas

**`database/`:** `@prisma/client`, `prisma` (dev), `tsx` (dev), `typescript` (dev)
**`backend/` (adição aditiva):** `@prisma/client` (necessário apenas para `PostgresDataProvider.ts` compilar)

> Nota: sem acesso à rede no ambiente de implementação, `npm install` não pôde ser executado — mesma limitação já documentada na Etapa 2.

## 16. Variáveis de ambiente utilizadas

`DATABASE_URL` (compartilhada entre raiz, `backend/` e `database/` — deve ser idêntica nos três `.env`), `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` (usadas pelo `docker-compose.yml`), `DATABASE_HOST`/`DATABASE_PORT`/`DATABASE_NAME`/`DATABASE_USER`/`DATABASE_PASSWORD` (usadas pelos scripts de backup/restore).

## 17. Funcionalidades deliberadamente NÃO implementadas

- Ativação do `PostgresDataProvider` em `src/api/app.ts`.
- Autenticação real (tabela `app_user` existe, sem lógica de login).
- Integração com APIs públicas reais (UNHCR/IDMC/IOM) — apenas preparada arquiteturalmente.
- Qualquer código de Frontend.

## 18. Limitações atuais

- Nenhuma migration foi aplicada contra um PostgreSQL real (sem rede/banco disponível no ambiente de implementação) — validada apenas por revisão manual e checagem de balanceamento sintático.
- `PostgresDataProvider.ts` foi validado com `tsc` usando um stub simplificado de `@prisma/client`, não o client real gerado.
- Nenhum arquivo de backup real (`.backup`) foi gerado, pela mesma razão.

## 19. Pendências conhecidas

- Rodar `docker compose up`, `prisma generate`, `prisma migrate deploy` e `npm run seed` em um ambiente com rede/Docker reais, para validação end-to-end.
- Rodar os testes de integração do backend (`backend/tests/`) contra `PostgresDataProvider` (hoje só existem testes contra `MockDataProvider`) — recomendado antes de ativar o provider em produção.
- Ativar `PostgresDataProvider` em `src/api/app.ts` quando desejado.

## 20–24. Preparações específicas

Ver `database/docs/postgis.md` (PostGIS), `database/docs/migrations.md` (Prisma/migrations), `database/docs/performance.md` (índices/volumetria) e `database/docs/integration-review.md` (Swagger/testes seguem a preparação já feita na Etapa 2, inalterada).

## 25. Checklist técnico da etapa

- [x] Clean Architecture preservada (nenhuma camada do backend alterada além de um Provider aditivo)
- [x] SOLID: `PostgresDataProvider` depende apenas do contrato `IDataProvider`
- [x] Nenhuma dependência circular entre `database/` e `backend/` além do ponto de integração explícito
- [x] Desacoplamento verificado: nenhuma referência a `PrismaClient`/`@prisma/client` em `repositories/`, `services/` ou `controllers/`
- [x] Índices estratégicos (incluindo GiST espacial) presentes na migration
- [x] Normalização aplicada (rota separada de fluxo, país separado de localização)
- [x] Compatibilidade com PostgreSQL + PostGIS validada por modelagem e revisão manual
- [x] Nenhum artefato de Frontend/Docker de produção criado
- [x] Backup e restauração documentados, com scripts reais e testáveis
- [x] Nenhuma credencial hardcoded em nenhum script

## 26. Orientações obrigatórias para a próxima etapa (Frontend)

1. O frontend consome apenas a API REST do backend (`backend/docs/endpoints.md`) — não precisa (e não deve) conhecer `database/` diretamente.
2. Nenhuma mudança de contrato de API é esperada quando `PostgresDataProvider` for eventualmente ativado — o envelope de resposta e o formato de cada DTO permanecem os mesmos.
3. Caso o frontend precise de dados que a API ainda não expõe (ex: consultas espaciais de proximidade), a extensão correta é: adicionar ao `IDataProvider`, implementar em ambos os Providers, expor via novo Repository/Service/Controller — nunca conectar o frontend diretamente ao banco.

## 27. Riscos que devem ser evitados durante a Etapa 4

- Acoplar o frontend a detalhes do banco (nomes de coluna, enums do Postgres) em vez de exclusivamente ao contrato JSON já documentado da API.
- Assumir que os dados são reais/oficiais — o aviso de dados simulados (README raiz) deve ser refletido na UI.
- Modificar o backend para "facilitar" o frontend sem passar pelo mesmo processo em camadas (Controller → Service → Repository → Provider) já estabelecido.

---

**Este documento encerra oficialmente a Etapa 3 (Banco de Dados) do Migration Flow Observatory.**

---

## Adendo — Correção pós-validação (npm run seed)

Após validação manual em ambiente real (Docker + PostgreSQL + PostGIS ativos), `npm run seed` falhava por `@prisma/client` não exportar os enums — causa raiz: `database/seeds/seed.ts` e `backend/` são consumidores do Prisma Client em árvores `node_modules` distintas, mas o `generator` só escreve o client físico em `backend/node_modules/.prisma/client`. Corrigido importando o seed diretamente desse caminho físico real, e removendo a dependência `@prisma/client` (desalinhada) de `database/package.json`. Nenhum Controller, Service, Repository, Provider, entidade ou enum foi alterado. Detalhes completos: `database/docs/migrations.md`, seção "Prisma Client compartilhado entre database/ e backend/".

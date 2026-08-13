# Migrations

## Por que esta migration foi escrita manualmente

Em um fluxo normal, `npx prisma migrate dev` gera o SQL automaticamente a partir de `schema.prisma`, comparando com o estado atual do banco. O ambiente em que este projeto foi implementado **não teve acesso à internet** para instalar o Prisma CLI nem a um servidor PostgreSQL real para gerar a migration automaticamente.

Por isso, `database/migrations/00001_initial_database_structure/migration.sql` foi escrito manualmente, espelhando exatamente o que o Prisma geraria — com um acréscimo proposital: a extensão PostGIS e o índice GiST (ver `postgis.md`), que o Prisma Migrate não gera sozinho para colunas `Unsupported`.

## Como aplicar

**Opção A — via Prisma Migrate (recomendado, requer rede/CLI instalado):**

```bash
cd database
npm install
npm run migrate:deploy
```

**Opção B — SQL manual direto (não depende do Prisma CLI):**

```bash
npm run migrate:apply-manual
# equivalente a:
psql "$DATABASE_URL" -f migrations/00001_initial_database_structure/migration.sql
```

Ambas as opções resultam no mesmo schema no banco.

## Convenção de nomenclatura

`NNNNN_descricao_em_snake_case` — números sequenciais com 5 dígitos, seguidos de uma descrição curta. Esta primeira migration se chama `00001_initial_database_structure`, conforme pedido no escopo desta etapa.

## Ordem de execução dentro do arquivo

1. Extensões (`uuid-ossp`, `postgis`)
2. Enums (`FlowType`, `LocationType`, `SourceType`)
3. Tabelas na ordem de dependência: `country` → `location` → `migration_route` → `data_source` → `migration_flow` → `migration_event` → `statistics` → `app_user`
4. Índices (incluindo o GiST espacial) criados logo após cada tabela

Essa ordem é obrigatória: uma tabela com `FOREIGN KEY` só pode ser criada depois que a tabela referenciada já existe.

## Ao evoluir o schema no futuro

1. Editar `prisma/schema.prisma`.
2. Gerar a próxima migration (`npx prisma migrate dev --name <nome>` com rede disponível, ou escrever `NNNNN_nome/migration.sql` manualmente seguindo o padrão desta primeira migration).
3. Nunca editar uma migration já aplicada em produção — sempre criar uma nova.

---

## Prisma Client compartilhado entre `database/` e `backend/` (correção pós-validação)

### O problema

Durante a validação manual desta etapa em um ambiente real (Docker + PostgreSQL + PostGIS funcionando), `npm run seed` falhava com:

```
SyntaxError: The requested module '@prisma/client' does not provide an export named 'FlowType'
```

mesmo com `prisma validate`, `prisma generate` e `prisma studio` funcionando normalmente e os enums presentes no schema.

### Causa raiz

O `generator client` deste schema usa um `output` customizado:

```prisma
output = "../../backend/node_modules/.prisma/client"
```

Essa decisão serve corretamente **um** consumidor: `backend/src/providers/postgres/PostgresDataProvider.ts`, cujo `import { PrismaClient } from '@prisma/client'` resolve, via `backend/node_modules`, um `@prisma/client` que É irmão do `.prisma/client` gerado — exatamente a convenção que o pacote `@prisma/client` espera.

`database/seeds/seed.ts` é um **segundo consumidor**, vivendo em outra árvore de `node_modules` (`database/node_modules/`). A cópia de `@prisma/client` instalada ali **não** é irmã do client gerado (que só existe fisicamente em `backend/node_modules/.prisma/client`) — então o `import` do seed resolvia um pacote sem os enums.

`prisma validate/generate/studio` nunca expõem esse problema porque leem o `schema.prisma` diretamente, sem passar pela resolução de módulos do Node a partir de um arquivo consumidor.

### Correção aplicada

- `database/seeds/seed.ts` agora importa diretamente do caminho físico real onde o Prisma escreve o client (`../../backend/node_modules/.prisma/client/index.js`) — o mesmo client que o backend já consome corretamente — em vez de depender da cópia (desalinhada) de `@prisma/client` instalada em `database/`.
- `database/package.json` teve a dependência `@prisma/client` removida — ela nunca era, de fato, o que resolvia o import do seed, e mantê-la ali era enganoso. `@prisma/client` continua sendo dependência apenas de `backend/`, seu único consumidor correto via resolução padrão de `node_modules`.
- Nenhum Controller, Service, Repository, Provider, entidade, enum ou lógica de negócio foi alterado. `schema.prisma` permanece idêntico.

### Por que esta não é uma gambiarra

O caminho usado não é arbitrário: é o local exato, documentado desde a Etapa 3, para onde o próprio `generator client` deste schema escreve o Prisma Client. Apontar o `seed.ts` para esse local é reconhecer explicitamente que ele e o `PostgresDataProvider.ts` consomem a mesma instância física do client — não inventar um atalho para fazer o erro desaparecer.

### Alternativas descartadas

- **Mover o `output` para dentro de `database/`** e fazer o backend importar por caminho relativo: resolveria a causa raiz de forma mais "canônica" segundo a documentação do Prisma, mas exigiria alterar `PostgresDataProvider.ts` — um Provider já implementado e fora de escopo para alteração.
- **Transformar o projeto em um npm workspace** (root `package.json` com `workspaces`, hoisting de `@prisma/client` compartilhado): tecnicamente robusto, mas desproporcional — mudaria a forma como `backend/` e `database/` são instalados, contradizendo a documentação já publicada de instalação independente de cada módulo.

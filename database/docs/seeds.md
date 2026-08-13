# Seeds

## O que o seed cria

`database/seeds/seed.ts` popula, de forma idempotente (`upsert` para países e fonte de dados):

- **1 DataSource**: "Dados Simulados (Portfólio)", `type: MOCK`.
- **9 países**: Irã, Turquia, Alemanha, Paquistão, Armênia, Azerbaijão, Iraque, Estados Unidos, Canadá — conforme pedido explicitamente no escopo desta etapa.
- **9 Locations**: uma capital/cidade de referência por país, com `latitude`/`longitude` e a coluna PostGIS `geometry` preenchida via SQL bruto (ver `docs/postgis.md`).
- **3 rotas**: Irã → Turquia, Irã → Alemanha, Irã → Paquistão — também pedidas explicitamente.
- **9 registros de fluxo**: combinando granularidade diária, mensal e anual, e tipos `EXIT`/`RETURN`/`TRANSIT`, para exercitar toda a modelagem de `migration_flow`.

## Por que os países/rotas espelham o Mock Data da Etapa 2

`backend/src/providers/mock/data/countries.mock.ts` já usa exatamente estes 9 países (mesmos nomes e códigos ISO). Isso é intencional: quem comparar o comportamento da API sobre `MockDataProvider` vs. sobre `PostgresDataProvider` (quando ativado) deve ver números na mesma ordem de grandeza, facilitando validação manual da migração Mock → Postgres.

## Rodando o seed

```bash
cd database
npm install
npm run generate   # gera o Prisma Client (necessário antes do seed)
npm run seed
```

> Nota: `seed.ts` importa o Prisma Client por um caminho relativo direto para `backend/node_modules/.prisma/client`, em vez do specifier `@prisma/client`. Isso é intencional — ver `docs/migrations.md`, seção "Prisma Client compartilhado entre database/ e backend/", para o porquê.

O script é **idempotente para países e fonte de dados** (`upsert` por `isoCode`/`name`), mas **não é idempotente para locations/rotas/fluxos** (`create` puro) — rodar o seed duas vezes duplicará essas entidades. Isso é intencional para manter o script simples nesta etapa; para um ambiente de CI que precise de seeds repetíveis, adicione uma limpeza (`prisma.migrationFlow.deleteMany()` etc.) no início de `main()`.

## Estendendo o seed

Para adicionar novos países/rotas/fluxos fictícios, edite os arrays em `database/seeds/seed.ts` seguindo o mesmo formato. Para dados reais futuros (ver `docs/integration-review.md`), o padrão recomendado é um script de importação **separado** (ex: `database/scripts/import-unhcr.ts`), nunca misturado ao seed de desenvolvimento.

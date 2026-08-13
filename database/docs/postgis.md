# PostGIS

## Onde o PostGIS é usado

Exclusivamente na coluna `location.geometry`, tipada no PostgreSQL como `geometry(Point, 4326)`. SRID `4326` = WGS84, o sistema de coordenadas padrão de GPS/Mapbox/Google Maps — garante que qualquer coordenada gravada aqui seja diretamente compatível com o Mapbox GL do frontend (Etapa 4), sem transformação de projeção.

## Por que a coluna é `Unsupported` no Prisma

O Prisma Client não modela tipos geométricos do PostGIS nativamente. Colunas `Unsupported("...")`:

- Existem na tabela (o SQL de migration as cria normalmente).
- **Não são gerenciáveis via `prisma.location.create({ data: { geometry: ... } })`** — precisam de SQL bruto (`$executeRaw`/`$queryRaw`).
- Continuam disponíveis para consulta via `$queryRaw`, mantendo type-safety no restante do modelo.

Isso é uma limitação conhecida e documentada do Prisma (não uma falha de modelagem) — a alternativa seria abandonar o Prisma para esta tabela, o que quebraria a consistência do restante do schema.

## Como o seed popula a geometria

`database/seeds/seed.ts` cria a `location` normalmente via Prisma Client (sem a coluna `geometry`), e em seguida executa:

```ts
await prisma.$executeRaw`
  UPDATE "location"
  SET "geometry" = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
  WHERE "id" = ${location.id}::uuid
`;
```

`ST_MakePoint(x, y)` espera **(longitude, latitude)**, nessa ordem — um erro comum é inverter para (latitude, longitude).

## Índice espacial

```sql
CREATE INDEX "location_geometry_gist_idx" ON "location" USING GIST ("geometry");
```

Um índice **GiST** (Generalized Search Tree) é o padrão para colunas geométricas no PostGIS — acelera drasticamente operações como `ST_DWithin`, `ST_Distance` e `ST_Contains`, que fariam full table scan sem ele. Esse índice está na migration SQL manual (`database/migrations/00001_initial_database_structure/migration.sql`), pois o Prisma Migrate não o gera automaticamente para colunas `Unsupported`.

## Exemplos de consultas espaciais preparadas para o futuro

Estas consultas **não são usadas nesta etapa** (o `PostgresDataProvider` atual não as chama, pois `IDataProvider` ainda não expõe operações espaciais) — ficam aqui como referência para quando o frontend (Etapa 4) precisar de busca por proximidade:

```sql
-- Localizações num raio de 200km de um ponto (ex: Teerã)
SELECT id, name
FROM location
WHERE ST_DWithin(
  geometry::geography,
  ST_SetSRID(ST_MakePoint(51.389, 35.6892), 4326)::geography,
  200000  -- metros
);

-- Distância entre duas localizações, em km
SELECT ST_Distance(a.geometry::geography, b.geometry::geography) / 1000 AS km
FROM location a, location b
WHERE a.name = 'Teerã' AND b.name = 'Istambul';
```

## Extensão da API para consultas espaciais (fora do escopo desta etapa)

Quando necessário, a extensão apropriada é: adicionar um método a `IDataProvider` (ex: `getLocationsNear(lat, lng, radiusKm)`), implementá-lo apenas em `PostgresDataProvider` (o `MockDataProvider` pode lançar "não suportado" ou calcular distância euclidiana simples em memória), e expor via um novo Repository/Service/Controller — seguindo exatamente o mesmo padrão em camadas já estabelecido.

# Modelagem de Dados

## Diagrama de relacionamento

```
Country ──1:N── Location ──1:N── MigrationRoute ──1:N── MigrationFlow ──N:1── DataSource
   │                │  (origin/destination, 2 FKs)
   │                └──1:N── MigrationEvent
   └──1:N── Statistics
```

Ver `../diagrams/erd.mmd` (fonte Mermaid) e `../diagrams/erd.svg` (renderizado) para a versão visual completa.

## Tabelas

### `country`

País envolvido nos fluxos migratórios. `iso_code` é único (ex: `IR`, `TR`, `DE`). `continent` é o agrupamento geográfico de alto nível (equivalente ao campo `region` já usado nas entidades TypeScript do backend — ver `docs/integration-review.md`).

### `location`

Ponto geográfico específico (cidade, região) — é aqui, e não em `country`, que o PostGIS atua (`geometry`). Cada `location` pertence a um `country`. `type` distingue `CITY`/`COUNTRY`/`REGION` para permitir que uma rota seja modelada tanto entre cidades específicas quanto entre países inteiros, sem duas tabelas separadas.

### `migration_route`

O **caminho** entre duas `location` (origem/destino). Deliberadamente não guarda volume, ano ou tipo de movimento — essas informações variam ao longo do tempo e pertencem a `migration_flow`, permitindo que uma única rota acumule anos e tipos de fluxo diferentes sem duplicar a definição do caminho.

### `migration_flow`

O dado transacional/histórico: quantas pessoas (`amount`), em que rota (`route_id`), em que período (`year`/`month`/`day` opcional), de que tipo (`flow_type`: EXIT/RETURN/TRANSIT), de qual fonte (`source_id`) e com qual `confidence_level` (0.0–1.0 — ver "Por que um score contínuo" abaixo). Nunca é soft-deletado: é histórico imutável.

### `migration_event`

Eventos históricos (crises, conflitos, mudanças políticas) associados opcionalmente a uma `location`, para dar contexto qualitativo a variações nos fluxos.

### `data_source`

Proveniência de cada `migration_flow` (UNHCR, IDMC, IOM, dados simulados). Nome único. Nunca referenciada por nada além de `migration_flow.source_id` — mantém qualquer integração futura com uma API externa isolada desta única tabela.

### `statistics`

Métricas agregadas pré-calculadas (ex: saldo migratório de um país em um período), para acelerar consultas de dashboard sem recalcular agregações pesadas a cada requisição. `country_id` é opcional (permite métricas globais).

### `app_user`

Estrutura reservada para autenticação futura. Nenhuma lógica de autenticação nesta etapa — apenas a tabela existe.

## Por que um score contínuo (`confidence_level`) em vez de um enum

O escopo pedia um campo `confidence_level` sem especificar seus valores possíveis. Optei por um `Float` entre 0.0 e 1.0 (com `CHECK` constraint) em vez de inventar um enum (`LOW`/`MEDIUM`/`HIGH`) não solicitado, porque:

- Um score contínuo permite agregações matemáticas diretas (média ponderada de confiança por rota/período).
- Fontes reais (UNHCR, IOM) frequentemente publicam margens de erro numéricas, não categorias discretas — o campo já nasce compatível com dados reais futuros.

## UUID, timestamps, soft delete e auditoria

- **UUID** (`@db.Uuid`, gerado via `gen_random_uuid()`) como chave primária em todas as tabelas — evita vazamento de contagem/sequência e facilita merge de dados de múltiplas fontes futuras.
- **Timestamps** (`created_at`/`updated_at`) em todas as entidades que podem ser editadas (`country`, `location`, `migration_route`, `app_user`). Tabelas puramente históricas/imutáveis (`migration_flow`, `migration_event`, `statistics`, `data_source`) têm apenas `created_at`, já que nunca são atualizadas — apenas inseridas.
- **Soft delete** (`deleted_at` nullable) aplicado a `country`, `location`, `migration_route` e `app_user` — entidades de referência/cadastro, onde "excluir" normalmente significa "deixar de listar", preservando o histórico de `migration_flow` que aponta para elas. `migration_flow`, `migration_event`, `statistics` e `data_source` não têm soft delete, por serem registros históricos que, uma vez criados, não devem ser ocultáveis individualmente (a decisão de "descontinuar" uma rota já é capturada por `migration_route.status`).

## Relacionamentos (detalhado)

| Relação | Tipo | Observação |
|---|---|---|
| `country` → `location` | 1:N | Um país tem várias localizações |
| `location` → `migration_route` (origem) | 1:N | `origin_location_id` |
| `location` → `migration_route` (destino) | 1:N | `destination_location_id` — relação nomeada separadamente da de origem |
| `location` → `migration_event` | 1:N (opcional) | Um evento pode não ter localização associada |
| `migration_route` → `migration_flow` | 1:N | Uma rota acumula fluxos de vários anos/tipos |
| `data_source` → `migration_flow` | 1:N | Uma fonte alimenta vários fluxos |
| `country` → `statistics` | 1:N (opcional) | Estatística pode ser global (`country_id` nulo) |

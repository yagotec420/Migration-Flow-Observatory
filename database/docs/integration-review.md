# Revisão de Integração: Database ↔ Backend

Esta é a análise formal pedida no escopo da Etapa 3: comparar nomes de entidades, formatos de dados, contratos esperados, repositories e modelos entre `database/` (novo) e `backend/` (Etapa 2, já aprovado), identificando conflitos e documentando a resolução — **sem alterar a arquitetura existente**.

## Método

Toda leitura de dados no backend passa exclusivamente por `IDataProvider` (`backend/src/interfaces/providers/IDataProvider.ts`). Portanto, a única pergunta que importa é: **`PostgresDataProvider` consegue implementar `IDataProvider` produzindo exatamente os mesmos formatos que `MockDataProvider` já produz?** Se sim, a integração é compatível por definição, independentemente de quão diferente seja o schema normalizado por baixo.

## Conflito 1 — Granularidade de `MigrationRoute`

| | Domínio TS (`backend/src/entities/MigrationRoute.ts`) | Banco (`migration_route` + `migration_flow`) |
|---|---|---|
| Estrutura | Um único objeto já traz `type`, `estimatedVolume`, `year` | `migration_route` é só o caminho; `type`/`amount`/`year` vivem em `migration_flow`, N por rota |

**Resolução:** `PostgresDataProvider.getRoutes()` agrupa os `migration_flow` de cada `migration_route` por `(year, flowType)`, somando `amount`, e emite um `MigrationRoute` de domínio por grupo — replicando exatamente o formato que `mockRoutes` já tinha (múltiplos registros para o mesmo par de países, um por ano/tipo). Ver `PostgresDataProvider.groupRouteFlows()`.

**Efeito colateral aceito:** o `id` retornado para esses registros é sintético (`"<routeId>:<year>:<flowType>"`), não uma PK real. Isso é seguro porque `IDataProvider` só exige que um `id` emitido por `getRoutes()` seja resolvível por `getRouteById()` — nunca que corresponda a uma chave primária. `getRouteById()` decompõe o id sintético e refaz a mesma agregação para aquele grupo específico.

## Conflito 2 — Granularidade de `MigrationFlow`

| | Domínio TS (`backend/src/entities/MigrationFlow.ts`) | Banco (`migration_flow`) |
|---|---|---|
| Chave | Por **país** (`countryId` + `direction: 'outbound'\|'inbound'`) | Por **rota** (`routeId` + `flowType: EXIT\|RETURN\|TRANSIT`) |

**Resolução:** `PostgresDataProvider.getFlows()` junta cada `migration_flow` à sua rota → localização de origem → país, e agrega por `(countryId, direction, year, month)`. O mapeamento de tipo é:

- `EXIT` → `outbound` do país de **origem** da rota.
- `RETURN` → `inbound` do país de **origem** da rota (interpretação: "retorno" é sempre em relação ao país nomeado como origem da rota — ex.: a rota "Irã → Turquia" tem seu `RETURN` significando "de volta ao Irã", não "chegada à Turquia").
- `TRANSIT` → **deliberadamente excluído** desta agregação por país. Trânsito não representa entrada/saída de um país específico, e o Mock Data da Etapa 2 também nunca modelou trânsito como fluxo de país (`backend/src/providers/mock/data/flows.mock.ts` só tem `outbound`/`inbound`). Dados de trânsito continuam armazenados e consultáveis diretamente no banco — apenas não são expostos por este método do contrato atual.

**Risco documentado:** se uma futura versão de `IDataProvider` precisar expor trânsito, isso exigirá estender a interface (`FlowDirection` ganharia um terceiro valor, ou um método novo seria adicionado) — uma mudança de contrato aditiva, não uma correção de bug desta etapa.

## Conflito 3 — Nome de campo: `region` (TS) vs `continent` (banco)

Trivial: `PostgresDataProvider.toCountryEntity()` mapeia `region: dbCountry.continent` diretamente. Nenhum dos dois nomes foi alterado — ambos continuam existindo em suas respectivas camadas, e a tradução acontece inteiramente dentro do Provider.

## Verificação: nenhum vazamento de detalhes do banco para cima

```
grep -rn "PrismaClient\|@prisma/client" backend/src/repositories/ backend/src/services/ backend/src/controllers/
```

Nenhuma ocorrência esperada (e confirmada) — `PrismaClient` é conhecido exclusivamente por `PostgresDataProvider.ts`. Repository, Service e Controller continuam trabalhando apenas com as entidades de domínio já existentes, exatamente como definidas na Etapa 2.

## Conclusão

**O banco está pronto para substituir o Mock Repository do backend sem alteração na camada de negócio.** `PostgresDataProvider implements IDataProvider` compila contra a mesma interface que `MockDataProvider` já implementa (validado nesta etapa via `tsc` com stubs de tipo, dada a ausência de rede no ambiente de implementação — ver `handoff/HANDOFF_ETAPA_03_DATABASE.md`). A ativação real (troca da instância em `src/api/app.ts`) foi deliberadamente **não realizada** nesta etapa, por ser uma alteração em um arquivo já existente do backend, fora do escopo autorizado ("não alterar backend/controllers/services/repositories") — fica documentada como o único passo restante, de responsabilidade de quem ativar esta integração em um ambiente com PostgreSQL real disponível.

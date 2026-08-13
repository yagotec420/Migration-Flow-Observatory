# Padrões de Código

## Princípios gerais

Todo código do projeto deve seguir:

- **SOLID** — responsabilidade única, aberto/fechado, substituição de Liskov, segregação de interface, inversão de dependência.
- **DRY** (Don't Repeat Yourself) — lógica nunca duplicada entre camadas ou módulos.
- **KISS** (Keep It Simple) — preferir a solução mais simples que resolve o problema.
- **YAGNI** (You Aren't Gonna Need It) — nada é implementado antes de ser realmente necessário.
- **Clean Code** — nomes descritivos, funções pequenas, baixo acoplamento.
- **Domain-Driven Design** — aplicado onde fizer sentido, especialmente na nomenclatura de entidades e serviços do domínio migratório.

## Nomenclatura

Nomes devem refletir claramente o domínio e a responsabilidade. Exemplos aceitos:

```
MigrationRoute
RouteStatistics
MigrationDashboard
RefugeeCounter
CountryFlow
FlowAnimation
TimelineController
DataRepository
MigrationService
StatisticsController
```

Nomes **proibidos** por serem genéricos e não descritivos:

```
data.js
helper.js
utils2.js
teste.js
novo.js
```

Regra prática: se o nome do arquivo não permite deduzir sua responsabilidade sem abrir o conteúdo, o nome está errado.

## Convenções por camada

| Camada | Convenção de nome | Exemplo |
|---|---|---|
| Controller | `<Domínio>Controller` | `StatisticsController` |
| Service | `<Domínio>Service` | `MigrationService` |
| Repository | `<Domínio>Repository` | `DataRepository` |
| Entity | Substantivo do domínio | `CountryFlow` |
| DTO | `<Domínio>DTO` | `MigrationRouteDTO` |
| Componente React | PascalCase | `MigrationDashboard.tsx` |
| Hook | `use<Funcionalidade>` | `useMigrationData` |
| Store (Zustand) | `use<Domínio>Store` | `useFilterStore` |

## Git e commits

O projeto segue **Conventional Commits**:

```
feat:     nova funcionalidade
fix:      correção de bug
refactor: alteração de código sem mudar comportamento
docs:     alterações de documentação
style:    formatação, sem alteração de lógica
test:     inclusão ou ajuste de testes
chore:    tarefas de manutenção (dependências, configs)
```

Exemplo:

```
feat: adiciona animação de rotas migratórias no mapa
fix: corrige cálculo de estatísticas por período
docs: atualiza roadmap com escopo da v2
```

## Ferramentas de qualidade

- **ESLint** — análise estática e padronização de código.
- **Prettier** — formatação automática consistente.
- **Husky** — hooks de Git para validação antes de commits/pushes.
- **lint-staged** — executa lint apenas nos arquivos alterados, mantendo commits rápidos.

## Regras adicionais

- Nenhum arquivo deve crescer indefinidamente: se uma classe ou componente ultrapassa uma responsabilidade clara, ela deve ser dividida.
- Toda lógica de negócio fica isolada em `services/`, nunca em Controllers ou Components.
- Comunicação entre frontend e backend ocorre apenas via contratos de API tipados (TypeScript), nunca com estruturas de dados improvisadas.

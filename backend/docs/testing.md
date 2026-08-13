# Estratégia de Testes

## Ferramentas

- **Vitest** — test runner e assertions, para testes unitários e de integração.
- **Supertest** — requisições HTTP simuladas contra a instância Express, sem subir uma porta real.

## Estrutura

```
tests/
├── setup.ts                     # setup global (força NODE_ENV=test)
├── unit/
│   └── services/                # testam Services isoladamente
└── integration/                 # testam a API completa via Supertest
```

## Testes unitários (`tests/unit/`)

Testam um Service diretamente, instanciando-o com repositories reais sobre o `MockDataProvider` (já que os dados mockados são determinísticos e não exigem I/O real). Cobrem:

- Regras de filtro e paginação
- Composição de DTOs (ex: enriquecimento de rota com países)
- Erros de domínio (`NotFoundError` lançado corretamente)

Para testar um Service com total isolamento de dados, crie um fake que implemente a interface de Repository correspondente (ex: um `FakeCountryRepository implements ICountryRepository`) em vez de usar o `MockDataProvider` — útil quando o cenário de teste exigir dados muito específicos.

## Testes de integração (`tests/integration/`)

Sobem a aplicação Express completa via `createApp()` (sem `listen()` real) e testam o comportamento HTTP fim a fim:

- Status codes corretos
- Envelope de resposta padrão (`success`, `data`, `meta`/`error`)
- Validação de query params (400 para entrada inválida)
- 404 para recursos e rotas inexistentes

## Rodando os testes

```bash
npm test               # roda uma vez
npm run test:watch      # modo watch (útil durante desenvolvimento)
npm run test:coverage   # com relatório de cobertura (v8)
```

## Convenção de nomenclatura

Todo arquivo de teste segue `<NomeDoArquivo>.test.ts`, espelhando o nome do arquivo testado (`MigrationService.ts` → `MigrationService.test.ts`), conforme `docs/coding-standards.md` na raiz do projeto.

## Ao evoluir para a Etapa 3 (PostgreSQL)

Os testes de integração não devem mudar — eles testam o contrato HTTP, que permanece estável. Os testes unitários de Service também não devem mudar, pois dependem de interfaces, não do Provider. Apenas novos testes de `PostgresDataProvider` (contra um banco de teste, possivelmente com Testcontainers) serão adicionados.

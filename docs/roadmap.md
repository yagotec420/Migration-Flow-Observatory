# Roadmap

Este roadmap organiza o desenvolvimento do **Migration Flow Observatory** em versões incrementais, cada uma entregando valor demonstrável de forma independente.

## v1 — Fundação Visual (Mock Data)

**Objetivo:** ter um dashboard visualmente completo e funcional, alimentado por dados simulados, para validar UX, arquitetura de componentes e visualização geoespacial.

- [ ] Mapa interativo com Deck.gl + Mapbox GL
- [ ] Rotas migratórias animadas
- [ ] Dashboard com estatísticas e indicadores
- [ ] Linha do tempo (evolução temporal dos fluxos)
- [ ] Dados 100% mockados, seguindo o contrato de API já definido

## v2 — Backend e Persistência

**Objetivo:** substituir os mocks por uma API real, mantendo o contrato inalterado.

- [x] API REST em Node.js + Express + TypeScript (Etapa 2)
- [x] Modelagem do banco em PostgreSQL + PostGIS (Etapa 3)
- [x] Integração via Prisma ORM (Etapa 3)
- [x] Migrations e seeds iniciais (Etapa 3)
- [x] Endpoints espelhando exatamente o formato de dados consumido no v1 (Etapa 2)

> Nota: a API continua servindo dados via `MockDataProvider` em produção. `PostgresDataProvider` (Etapa 3) já implementa o mesmo contrato e está pronto para uso, mas sua ativação (troca da instância em `backend/src/api/app.ts`) foi deliberadamente deixada como um passo explícito e separado — ver `database/docs/integration-review.md`.

## v3 — Dados Reais e Recursos Avançados

**Objetivo:** conectar fontes de dados públicas reais e evoluir a experiência do usuário.

- [ ] Integração com bases de dados públicas (ex: UNHCR, IOM, World Bank, quando aplicável)
- [ ] Autenticação de usuários
- [ ] Filtros avançados (período, tipo de fluxo, rota, faixa demográfica)
- [ ] Camadas adicionais de análise geoespacial

## v4 — Produção e Observabilidade

**Objetivo:** tornar o projeto pronto para produção contínua.

- [ ] Deploy automatizado (CI/CD)
- [ ] Monitoramento e logging estruturado
- [ ] Otimização de performance (cache, paginação, lazy loading)
- [ ] Cobertura de testes automatizados (unitários, integração, e2e)

---

## Status atual

| Item | Status |
|---|---|
| Arquitetura global e documentação | ✅ Concluído (Etapa 1) |
| Estrutura de pastas (frontend/backend/database) | ✅ Concluído |
| Backend (API REST sobre Mock Data) | ✅ Concluído (Etapa 2) |
| Banco de Dados (PostgreSQL + PostGIS + Prisma) | ✅ Concluído (Etapa 3) — não ativado em produção |
| Frontend (v1) | ⏳ Planejado (Etapa 4) |
| Dados reais e auth (v3) | ⏳ Planejado |
| Deploy e observabilidade (v4) | ⏳ Planejado |

# Decisões Arquiteturais (ADRs)

Este documento registra as principais decisões técnicas tomadas no projeto e o raciocínio por trás delas. O objetivo é que as próximas etapas (backend, banco de dados, frontend) tenham contexto suficiente para manter consistência, sem precisar revisitar essas escolhas.

---

### ADR-001 — Separação estrita entre frontend, backend e banco de dados

**Decisão:** os três módulos vivem em pastas independentes na raiz do repositório e se comunicam apenas por contratos explícitos (API REST / schema Prisma).

**Motivo:** permite desenvolvimento, teste e deploy independentes; demonstra domínio de arquitetura desacoplada, um critério relevante em avaliações técnicas para vagas senior/staff.

---

### ADR-002 — Início com dados simulados (Mock Data)

**Decisão:** a v1 do projeto usa exclusivamente dados mockados no frontend, seguindo o mesmo formato que a API real (v2) irá retornar.

**Motivo:** permite validar UX, performance de renderização do mapa e da timeline antes de investir em backend e banco de dados. Reduz risco de retrabalho, pois o contrato de dados é definido uma única vez.

---

### ADR-003 — Deck.gl + Mapbox GL para visualização geoespacial

**Decisão:** uso de Deck.gl sobre Mapbox GL para renderizar rotas migratórias e camadas de dados.

**Motivo:** Deck.gl é otimizado para grandes volumes de dados geoespaciais e animações (ex: fluxos migratórios ao longo do tempo), enquanto Mapbox GL fornece a base cartográfica. A combinação é um padrão de mercado para dashboards geoespaciais de alta performance.

---

### ADR-004 — PostgreSQL + PostGIS como banco de dados

**Decisão:** o banco relacional PostgreSQL será usado com a extensão PostGIS para dados geoespaciais.

**Motivo:** PostGIS é o padrão de mercado para consultas espaciais (rotas, distâncias, agregações por região), com suporte maduro e integração direta via Prisma.

---

### ADR-005 — Prisma ORM

**Decisão:** uso do Prisma como camada de acesso a dados no backend.

**Motivo:** tipagem forte alinhada ao TypeScript do backend, migrations versionadas e produtividade no desenvolvimento, mantendo a camada de Repository como única responsável por conhecê-lo.

---

### ADR-006 — Zustand para estado global e React Query para estado de servidor

**Decisão:** Zustand gerencia estado de UI/filtros; React Query gerencia cache e sincronização de dados vindos da API.

**Motivo:** separa claramente estado de cliente (UI) de estado de servidor (dados remotos), evitando lógica de cache manual e reduzindo complexidade dos componentes.

---

### ADR-007 — Documentação e arquitetura antes de código

**Decisão:** esta etapa inicial define exclusivamente arquitetura, estrutura de pastas e documentação — nenhum código de frontend, backend, banco de dados ou infraestrutura é escrito aqui.

**Motivo:** garante que as três etapas seguintes (desenvolvidas de forma independente) partam de uma base estrutural fixa e não exijam retrabalho ou mudanças estruturais no meio do desenvolvimento.

---

### ADR-008 — Transparência sobre a natureza dos dados

**Decisão:** toda documentação e interface deixará explícito que o projeto tem finalidade educacional/portfólio, que os dados podem ser estimativas de fontes públicas e que informações podem ser simuladas na ausência de APIs em tempo real.

**Motivo:** evita que o projeto seja confundido com uma fonte oficial de estatísticas migratórias, e reforça a integridade do trabalho apresentado a recrutadores.

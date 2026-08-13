# Arquitetura do Frontend

O frontend é um cliente React independente que consome exclusivamente `http://localhost:3333/api/v1`. Ele não acessa PostgreSQL, PostGIS, Prisma ou os Providers do backend.

`pages → features/components → hooks (React Query) → services → API`

- `app`: composição de providers e carregamento lazy da página.
- `features`: mapa Deck.gl, filtros e controle de timeline.
- `stores`: somente estado de interface e filtros (Zustand).
- `services`: chamadas HTTP tipadas e centralizadas.
- `types`: espelho dos DTOs públicos da API, nunca dos modelos Prisma.

O mapa usa `ArcLayer` sobre Mapbox GL. Sem `VITE_MAPBOX_TOKEN`, usa um estilo escuro público compatível, preservando a camada Mapbox/Deck.gl.

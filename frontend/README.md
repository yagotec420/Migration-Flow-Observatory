# Frontend — Migration Flow Observatory

Dashboard React + TypeScript para visualização de fluxos migratórios, integrado à API REST do projeto.

## Executar

```bash
cp .env.example .env
npm install
npm run dev
```

Por padrão, o Vite abre em `http://localhost:5173`; o backend deve estar em `http://localhost:3333`. Configure `VITE_MAPBOX_TOKEN` para usar o estilo Mapbox proprietário; sem token, o mapa usa um estilo escuro público.

## Qualidade

```bash
npm run typecheck
npm test
npm run build
```

Documentação técnica: [`docs/`](./docs/).

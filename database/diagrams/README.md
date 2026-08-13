# Diagramas

- `erd.mmd` — fonte do diagrama entidade-relacionamento, em [Mermaid](https://mermaid.js.org/syntax/entityRelationshipDiagram.html). É a fonte editável.
- `erd.svg` / `erd.png` — renderizações do diagrama acima (geradas com `@mermaid-js/mermaid-cli`), para visualização direta no GitHub/README sem precisar de um viewer Mermaid.

## Regenerando após alterar o schema

```bash
npx @mermaid-js/mermaid-cli -i erd.mmd -o erd.svg -b white --scale 2
npx @mermaid-js/mermaid-cli -i erd.mmd -o erd.png -b white --scale 2
```

Sempre que `prisma/schema.prisma` mudar (nova tabela, relacionamento ou coluna relevante), atualize `erd.mmd` na mesma alteração para que o diagrama nunca fique defasado do schema real.

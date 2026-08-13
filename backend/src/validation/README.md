# validation/ (pasta original da Etapa 1)

Esta pasta foi definida na etapa de arquitetura. Na Etapa 2 (Backend), o conceito de validação foi detalhado em duas responsabilidades específicas, mantidas como subpastas irmãs dentro de `src/`:

- `../schemas/` — os schemas Zod (o que deve ser validado em cada entrada).
- `../validators/` — o middleware que aplica esses schemas às requisições (como a validação é executada).

Esta pasta é mantida por retrocompatibilidade com a estrutura original e não é removida, mas não recebe novos arquivos a partir desta etapa.

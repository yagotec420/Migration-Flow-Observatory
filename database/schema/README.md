# schema/

Esta pasta foi reservada desde a Etapa 1 (`docs/folder-structure.md` original). Com a adoção do Prisma, o schema **fonte** passou a viver em `../prisma/schema.prisma` (convenção padrão do Prisma).

Esta pasta é mantida com um propósito complementar: `current-schema.sql` é uma cópia de referência do DDL puro (apenas `CREATE TABLE`/`CREATE INDEX`, sem comentários de migration), útil para quem quiser inspecionar o schema final sem precisar ler o histórico de migrations. Deve ser regenerada sempre que uma nova migration for aplicada — nunca é a fonte de verdade (essa é sempre `prisma/schema.prisma` + `migrations/`).

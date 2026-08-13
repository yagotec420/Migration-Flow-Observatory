/**
 * Seed inicial do Migration Flow Observatory.
 *
 * Executar (com o Prisma Client já gerado): `npm run seed` (ver
 * database/package.json) ou `tsx database/seeds/seed.ts`.
 *
 * Os dados aqui são fictícios/estimados para fins educacionais — ver
 * aviso no README raiz do projeto. Os países e o formato dos fluxos
 * espelham deliberadamente os dados de `backend/src/providers/mock/data/`,
 * para que a migração de Mock → Postgres seja perceptualmente contínua.
 *
 * ── NOTA SOBRE O IMPORT DO PRISMA CLIENT ──────────────────────────
 * O generator em `../prisma/schema.prisma` escreve o client gerado em
 * `backend/node_modules/.prisma/client` (ver comentário no schema —
 * decisão da Etapa 3 para que `PostgresDataProvider.ts` consuma
 * `@prisma/client` normalmente). Esse script roda a partir de
 * `database/`, cuja própria cópia de `@prisma/client` (instalada em
 * `database/node_modules/`) NÃO é irmã desse client gerado — por isso
 * `import { FlowType } from '@prisma/client'` aqui resolveria um
 * pacote sem os enums. Importamos diretamente do caminho físico real
 * onde o Prisma gerou o client (o mesmo que o backend usa), em vez de
 * depender da cópia de `@prisma/client` deste módulo. Ver
 * `database/docs/migrations.md` (seção "Prisma Client compartilhado
 * entre database/ e backend/") para o detalhamento completo.
 */
import {
  PrismaClient,
  FlowType,
  LocationType,
  SourceType,
} from '../../backend/node_modules/.prisma/client/index.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Iniciando seed...');

  const dataSource = await prisma.dataSource.upsert({
    where: { name: 'Dados Simulados (Portfólio)' },
    update: {},
    create: {
      name: 'Dados Simulados (Portfólio)',
      description:
        'Dados fictícios criados para fins educacionais e de demonstração técnica. Não representam estatística oficial.',
      type: SourceType.MOCK,
    },
  });

  const countries = await Promise.all(
    [
      { name: 'Irã', isoCode: 'IR', continent: 'Asia', latitude: 32.4279, longitude: 53.688 },
      { name: 'Turquia', isoCode: 'TR', continent: 'Asia', latitude: 38.9637, longitude: 35.2433 },
      { name: 'Alemanha', isoCode: 'DE', continent: 'Europe', latitude: 51.1657, longitude: 10.4515 },
      { name: 'Paquistão', isoCode: 'PK', continent: 'Asia', latitude: 30.3753, longitude: 69.3451 },
      { name: 'Armênia', isoCode: 'AM', continent: 'Asia', latitude: 40.0691, longitude: 45.0382 },
      { name: 'Azerbaijão', isoCode: 'AZ', continent: 'Asia', latitude: 40.1431, longitude: 47.5769 },
      { name: 'Iraque', isoCode: 'IQ', continent: 'Asia', latitude: 33.2232, longitude: 43.6793 },
      { name: 'Estados Unidos', isoCode: 'US', continent: 'North America', latitude: 37.0902, longitude: -95.7129 },
      { name: 'Canadá', isoCode: 'CA', continent: 'North America', latitude: 56.1304, longitude: -106.3468 },
    ].map((country) =>
      prisma.country.upsert({
        where: { isoCode: country.isoCode },
        update: {},
        create: country,
      }),
    ),
  );

  const findCountry = (isoCode: string) => {
    const country = countries.find((c) => c.isoCode === isoCode);
    if (!country) throw new Error(`País seed não encontrado: ${isoCode}`);
    return country;
  };

  // Uma Location "capital" por país, com geometria PostGIS via SQL bruto
  // (o Prisma Client não escreve colunas Unsupported diretamente).
  const capitalNames: Record<string, string> = {
    IR: 'Teerã',
    TR: 'Istambul',
    DE: 'Berlim',
    PK: 'Islamabade',
    AM: 'Erevã',
    AZ: 'Baku',
    IQ: 'Bagdá',
    US: 'Washington D.C.',
    CA: 'Ottawa',
  };

  const locations: Record<string, { id: string; countryId: string }> = {};

  for (const country of countries) {
    const name = capitalNames[country.isoCode] ?? country.name;
    const location = await prisma.location.create({
      data: {
        countryId: country.id,
        name,
        type: LocationType.CITY,
        latitude: country.latitude,
        longitude: country.longitude,
      },
    });

    // Popula a coluna PostGIS via SQL bruto (Unsupported no Prisma Client).
    await prisma.$executeRaw`
      UPDATE "location"
      SET "geometry" = ST_SetSRID(ST_MakePoint(${country.longitude}, ${country.latitude}), 4326)
      WHERE "id" = ${location.id}::uuid
    `;

    locations[country.isoCode] = { id: location.id, countryId: country.id };
  }

  // Rotas: Irã → Turquia, Irã → Alemanha, Irã → Paquistão (conforme solicitado)
  const routeDefs = [
    { from: 'IR', to: 'TR', name: 'Irã → Turquia' },
    { from: 'IR', to: 'DE', name: 'Irã → Alemanha' },
    { from: 'IR', to: 'PK', name: 'Irã → Paquistão' },
  ];

  const routes: Record<string, string> = {};

  for (const def of routeDefs) {
    const route = await prisma.migrationRoute.create({
      data: {
        originLocationId: locations[def.from]!.id,
        destinationLocationId: locations[def.to]!.id,
        name: def.name,
        description: `Rota migratória estimada de ${def.name}, dado simulado para fins educacionais.`,
        status: 'active',
      },
    });
    routes[`${def.from}-${def.to}`] = route.id;
  }

  // Fluxos fictícios: diário, mensal e anual, cobrindo EXIT e RETURN.
  // Nota: `migration_flow.month` é obrigatório no schema (nunca opcional —
  // ver database/prisma/schema.prisma). Os 3 registros "anuais" abaixo
  // seguem a convenção real de reporte de dados migratórios (ex: UNHCR):
  // um total agregado do ano é registrado com data de fechamento em
  // dezembro, mesmo representando o ano inteiro. Isso satisfaz a
  // obrigatoriedade de `month` sem exigir alterar o schema aprovado.
  const flowSeedData: Array<{
    routeKey: string;
    year: number;
    month: number;
    day?: number;
    amount: number;
    flowType: FlowType;
  }> = [
    { routeKey: 'IR-TR', year: 2024, month: 3, day: 15, amount: 320, flowType: FlowType.EXIT },
    { routeKey: 'IR-TR', year: 2024, month: 3, amount: 8200, flowType: FlowType.EXIT },
    { routeKey: 'IR-TR', year: 2024, month: 12, amount: 42000, flowType: FlowType.EXIT }, // total anual (fechamento em dez/2024)
    { routeKey: 'IR-TR', year: 2024, month: 5, amount: 1900, flowType: FlowType.RETURN },
    { routeKey: 'IR-DE', year: 2024, month: 4, amount: 3100, flowType: FlowType.EXIT },
    { routeKey: 'IR-DE', year: 2024, month: 12, amount: 18500, flowType: FlowType.EXIT }, // total anual (fechamento em dez/2024)
    { routeKey: 'IR-DE', year: 2024, month: 6, amount: 600, flowType: FlowType.RETURN },
    { routeKey: 'IR-PK', year: 2024, month: 2, amount: 2200, flowType: FlowType.EXIT },
    { routeKey: 'IR-PK', year: 2024, month: 12, amount: 11400, flowType: FlowType.TRANSIT }, // total anual (fechamento em dez/2024)
  ];

  for (const flow of flowSeedData) {
    await prisma.migrationFlow.create({
      data: {
        routeId: routes[flow.routeKey]!,
        year: flow.year,
        month: flow.month,
        day: flow.day,
        amount: flow.amount,
        flowType: flow.flowType,
        confidenceLevel: 0.75,
        sourceId: dataSource.id,
      },
    });
  }

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((error) => {
    console.error('Erro ao rodar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, FlowType as PrismaFlowType } from '@prisma/client';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';
import type { Country } from '@/entities/Country.js';
import type { MigrationRoute, MigrationRouteType } from '@/entities/MigrationRoute.js';
import type { MigrationFlow, FlowDirection } from '@/entities/MigrationFlow.js';
import type { TimelineEntry } from '@/entities/TimelineEntry.js';

/**
 * Implementação de IDataProvider sobre PostgreSQL + PostGIS via Prisma.
 *
 * IMPORTANTE — este é o ÚNICO arquivo novo adicionado ao backend na
 * Etapa 3. Nenhum Controller, Service, Repository, Route, DTO ou schema
 * Zod foi alterado. Este Provider apenas passa a existir como uma
 * segunda implementação possível de `IDataProvider`, ao lado de
 * `MockDataProvider` — a troca de qual é usada continua sendo uma
 * decisão de `src/api/app.ts`, e não foi ativada nesta etapa (ver
 * `handoff/HANDOFF_ETAPA_03_DATABASE.md` para o porquê).
 *
 * ## Por que este arquivo faz mais do que "traduzir 1 para 1"
 *
 * O schema normalizado (`database/prisma/schema.prisma`) modela
 * Country → Location → MigrationRoute → MigrationFlow com granularidade
 * geográfica em Location e volume/período em MigrationFlow. As entidades
 * de domínio do backend (`src/entities/`), definidas na Etapa 2 a partir
 * do Mock Data, são propositalmente mais "achatadas": um `MigrationRoute`
 * de domínio já inclui `type`, `estimatedVolume` e `year`; um
 * `MigrationFlow` de domínio é por PAÍS (não por rota).
 *
 * Traduzir uma representação normalizada para uma representação achatada
 * é exatamente a responsabilidade de um Provider — nenhuma tradução
 * acontece em Repository/Service/Controller.
 */
export class PostgresDataProvider implements IDataProvider {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async getCountries(): Promise<Country[]> {
    const countries = await this.prisma.country.findMany({ where: { deletedAt: null } });
    return countries.map(this.toCountryEntity);
  }

  async getCountryById(id: string): Promise<Country | null> {
    const country = await this.prisma.country.findFirst({ where: { id, deletedAt: null } });
    return country ? this.toCountryEntity(country) : null;
  }

  /**
   * Achata `MigrationRoute` (caminho) + `MigrationFlow` (volume/ano/tipo)
   * em um `MigrationRoute` de domínio por combinação (rota, ano, tipo de
   * fluxo) — espelhando o formato de `mockRoutes` da Etapa 2, onde cada
   * combinação já vinha como um registro próprio.
   *
   * O `id` resultante é sintético (`"<routeId>:<year>:<flowType>"`),
   * nunca exposto como chave primária real — apenas como um identificador
   * opaco que `getRouteById` sabe decompor. Isso é seguro porque o
   * contrato `IDataProvider` só exige que um id retornado por `getRoutes`
   * seja resolvível por `getRouteById`, nunca que corresponda a uma PK.
   */
  async getRoutes(): Promise<MigrationRoute[]> {
    const routes = await this.prisma.migrationRoute.findMany({
      where: { deletedAt: null },
      include: {
        origin: { include: { country: true } },
        destination: { include: { country: true } },
        flows: true,
      },
    });

    return routes.flatMap((route) => this.groupRouteFlows(route));
  }

  async getRouteById(id: string): Promise<MigrationRoute | null> {
    const [routeId, yearStr, flowTypeStr] = id.split(':');
    if (!routeId || !yearStr || !flowTypeStr) return null;

    const route = await this.prisma.migrationRoute.findFirst({
      where: { id: routeId, deletedAt: null },
      include: {
        origin: { include: { country: true } },
        destination: { include: { country: true } },
        flows: { where: { year: Number(yearStr), flowType: flowTypeStr as PrismaFlowType } },
      },
    });

    if (!route || route.flows.length === 0) return null;

    const [match] = this.groupRouteFlows(route);
    return match ?? null;
  }

  /**
   * Agrega `MigrationFlow` (por rota) em fluxos por PAÍS, replicando a
   * granularidade de `mockFlows` (Etapa 2). EXIT conta como saída do país
   * de origem da rota; RETURN conta como entrada no país de origem da
   * rota (interpretação: "retorno" é sempre em relação ao país de origem
   * nomeado na rota — ex.: a rota "Irã → Turquia" tem seu RETURN
   * significando "de volta ao Irã"). TRANSIT é deliberadamente omitido
   * desta agregação por país, pois não representa entrada/saída de um
   * país específico — o Mock Data da Etapa 2 também nunca modelou
   * trânsito como fluxo de país (ver `backend/src/providers/mock/data/flows.mock.ts`).
   */
  async getFlows(): Promise<MigrationFlow[]> {
    const flows = await this.prisma.migrationFlow.findMany({
      where: { flowType: { in: [PrismaFlowType.EXIT, PrismaFlowType.RETURN] } },
      include: { route: { include: { origin: true } } },
    });

    const grouped = new Map<string, MigrationFlow>();

    for (const flow of flows) {
      const countryId = flow.route.origin.countryId;
      const direction: FlowDirection = flow.flowType === PrismaFlowType.EXIT ? 'outbound' : 'inbound';
      const key = `${countryId}:${direction}:${flow.year}:${flow.month}`;

      const existing = grouped.get(key);
      if (existing) {
        existing.estimatedPeople += flow.amount;
      } else {
        grouped.set(key, {
          id: key,
          countryId,
          direction,
          year: flow.year,
          month: flow.month,
          estimatedPeople: flow.amount,
        });
      }
    }

    return Array.from(grouped.values());
  }

  /**
   * Reaproveita a mesma lógica de agregação de `getFlows()` (chamando-a
   * diretamente) para construir a timeline global — mantendo o mesmo
   * comportamento observável de `MockDataProvider.getTimeline()`, sem
   * duplicar a leitura do banco.
   */
  async getTimeline(): Promise<TimelineEntry[]> {
    const flows = await this.getFlows();
    const grouped = new Map<string, TimelineEntry>();

    for (const flow of flows) {
      const key = `${flow.year}-${flow.month}`;
      const existing = grouped.get(key) ?? {
        year: flow.year,
        month: flow.month,
        outbound: 0,
        inbound: 0,
        netBalance: 0,
      };

      if (flow.direction === 'outbound') {
        existing.outbound += flow.estimatedPeople;
      } else {
        existing.inbound += flow.estimatedPeople;
      }
      existing.netBalance = existing.inbound - existing.outbound;
      grouped.set(key, existing);
    }

    return Array.from(grouped.values()).sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month,
    );
  }

  // ── Helpers privados de tradução (nunca expostos fora deste Provider) ──

  private toCountryEntity(country: {
    id: string;
    isoCode: string;
    name: string;
    latitude: number;
    longitude: number;
    continent: string;
  }): Country {
    return {
      id: country.id,
      isoCode: country.isoCode,
      name: country.name,
      latitude: country.latitude,
      longitude: country.longitude,
      // `region` (domínio) <- `continent` (banco): mesma informação,
      // nomes diferentes por terem sido definidos em etapas distintas.
      region: country.continent,
    };
  }

  private mapFlowType(flowType: PrismaFlowType): MigrationRouteType {
    switch (flowType) {
      case PrismaFlowType.EXIT:
        return 'departure';
      case PrismaFlowType.RETURN:
        return 'return';
      case PrismaFlowType.TRANSIT:
        return 'transit';
    }
  }

  private groupRouteFlows(route: {
    id: string;
    origin: { countryId: string };
    destination: { countryId: string };
    flows: Array<{ year: number; flowType: PrismaFlowType; amount: number }>;
  }): MigrationRoute[] {
    const grouped = new Map<string, MigrationRoute>();

    for (const flow of route.flows) {
      const key = `${route.id}:${flow.year}:${flow.flowType}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.estimatedVolume += flow.amount;
      } else {
        grouped.set(key, {
          id: key,
          originCountryId: route.origin.countryId,
          destinationCountryId: route.destination.countryId,
          type: this.mapFlowType(flow.flowType),
          estimatedVolume: flow.amount,
          year: flow.year,
        });
      }
    }

    return Array.from(grouped.values());
  }
}

export type RouteType = 'departure' | 'return' | 'transit';
export type FlowDirection = 'outbound' | 'inbound';
export interface ApiEnvelope<T, M = Record<string, never>> { success: true; data: T; meta: M; timestamp: string; version: string }
export interface ApiFailure { success: false; error: { code: string; message: string; details?: unknown }; timestamp: string; version: string }
export interface PaginationMeta { page: number; limit: number; total: number; totalPages: number }
export interface Coordinates { latitude: number; longitude: number }
export interface Country { id: string; isoCode: string; name: string; coordinates: Coordinates; region: string }
export interface MigrationRoute { id: string; type: RouteType; year: number; estimatedVolume: number; origin: CountryRef; destination: CountryRef }
export interface CountryRef { countryId: string; isoCode: string; name: string; coordinates: Coordinates }
export interface Statistics { scope: 'global' | 'country'; countryId?: string; totals: { outbound: number; inbound: number; netBalance: number }; topRoutes: Array<{ routeId: string; estimatedVolume: number }>; lastUpdated: string }
export interface TimelineEntry { period: { year: number; month: number; label: string }; outbound: number; inbound: number; netBalance: number }
export interface Counter { label: string; value: number; unit: 'people' | 'routes' | 'countries' }
export interface Dashboard { counters: Counter[]; statistics: Statistics; recentTimeline: TimelineEntry[]; highlightedRoutes: MigrationRoute[] }
export interface Flow { id: string; countryId: string; countryName: string; direction: FlowDirection; period: { year: number; month: number }; estimatedPeople: number }
export interface RouteFilters { type?: RouteType; year?: number }
export interface TimelineFilters { countryId?: string; granularity: 'month' | 'year'; startDate?: string; endDate?: string }

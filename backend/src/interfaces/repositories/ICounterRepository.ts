export interface CounterRaw {
  label: string;
  value: number;
  unit: 'people' | 'routes' | 'countries';
}

export interface ICounterRepository {
  getCounters(): Promise<CounterRaw[]>;
}

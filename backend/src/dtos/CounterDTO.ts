export interface CounterDTO {
  label: string;
  value: number;
  unit: 'people' | 'routes' | 'countries';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

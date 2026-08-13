export interface TimelineDTO {
  period: {
    year: number;
    month: number;
    label: string;
  };
  outbound: number;
  inbound: number;
  netBalance: number;
}

import type { ICounterRepository } from '@/interfaces/repositories/ICounterRepository.js';
import type { CounterDTO } from '@/dtos/CounterDTO.js';

export class CounterService {
  constructor(private readonly counterRepository: ICounterRepository) {}

  async list(): Promise<CounterDTO[]> {
    const counters = await this.counterRepository.getCounters();
    return counters.map((counter) => ({
      label: counter.label,
      value: counter.value,
      unit: counter.unit,
    }));
  }
}

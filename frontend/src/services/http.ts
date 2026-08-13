import { config } from '../config/env';
import type { ApiEnvelope, ApiFailure } from '../types/api';
export class ApiError extends Error { constructor(public readonly code: string, message: string) { super(message); } }
export async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const query = new URLSearchParams(); Object.entries(params ?? {}).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)); });
  const response = await fetch(`${config.apiBaseUrl}${path}${query.size ? `?${query}` : ''}`);
  const body = (await response.json()) as ApiEnvelope<T> | ApiFailure;
  if (!response.ok || !body.success) { const failure = body as ApiFailure; throw new ApiError(failure.error?.code ?? 'HTTP_ERROR', failure.error?.message ?? 'Não foi possível carregar os dados.'); }
  return body.data;
}

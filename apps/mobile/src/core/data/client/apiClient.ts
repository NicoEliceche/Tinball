import { getStoredSessionToken } from '../services/authTokenStorage';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = 'API_ERROR',
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!apiBaseUrl) throw new ApiClientError('EXPO_PUBLIC_API_URL no está configurada.', 0, 'CONFIGURATION');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);
  const token = await getStoredSessionToken();

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as {
        error?: { message?: string; code?: string; requestId?: string };
      } | null;
      throw new ApiClientError(
        payload?.error?.message ?? 'No pudimos completar la solicitud.',
        response.status,
        payload?.error?.code,
        payload?.error?.requestId,
      );
    }

    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiClientError('La solicitud tardó demasiado. Intentá nuevamente.', 0, 'TIMEOUT');
    }
    throw new ApiClientError('No pudimos conectarnos con Tinball.', 0, 'NETWORK');
  } finally {
    clearTimeout(timeout);
  }
}

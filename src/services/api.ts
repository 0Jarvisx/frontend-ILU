// ─── Base API Client ─────────────────────────────────────────────────────────
//
// Todos los requests pasan por la instancia de axios configurada en src/api/axios.ts.
// El proxy de Vite redirige /api/* → http://localhost:3000/api/*
// Esto incluye tanto los endpoints de auth (/api/auth/*) como los de recursos (/api/users, etc.)

import api from '../api/axios';
import type { AxiosRequestConfig } from 'axios';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<B = unknown> {
  method?: HttpMethod;
  body?: B;
}

/** Generic API error que expone el HTTP status */
export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Helper único para todos los endpoints.
 * El path se pasa sin prefijo (ej. '/auth/login', '/users') y se antepone '/api'.
 */
export async function request<T, B = unknown>(
  path: string,
  options: RequestOptions<B> = {},
): Promise<T> {
  const { method = 'GET', body } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const config: AxiosRequestConfig = {
    method,
    url: `/api${path}`,
    data: body,
    // When sending FormData, let the browser set Content-Type (with boundary).
    // Passing `undefined` removes the axios-instance default 'application/json'.
    headers: isFormData ? { 'Content-Type': undefined } : undefined,
  };

  try {
    const res = await api.request<T>(config);
    return res.data;
  } catch (err: unknown) {
    if (
      err !== null &&
      typeof err === 'object' &&
      'response' in err &&
      err.response !== null &&
      typeof err.response === 'object' &&
      'status' in err.response &&
      'data' in err.response
    ) {
      const response = err.response as { status: number; data: unknown };
      let message = `HTTP ${response.status}`;
      
      if (typeof response.data === 'object' && response.data !== null) {
        const data = response.data as Record<string, unknown>;
        if ('error' in data && typeof data.error === 'string') {
          message = data.error;
        } else if ('message' in data && typeof data.message === 'string') {
          message = data.message;
        }
      }
      
      throw new ApiError(response.status, message);
    }
    throw err;
  }
}

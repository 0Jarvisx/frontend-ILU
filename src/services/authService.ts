// ─── Auth Service ─────────────────────────────────────────────────────────────
//
// Todas las funciones que hablan con /api/auth/*.

import { request } from './api';
import type {
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  MeResponse,
} from '../types/auth';

/** POST /api/auth/register */
export function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  return request<RegisterResponse, RegisterPayload>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

/** POST /api/auth/login */
export function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse, LoginPayload>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

/** GET /api/auth/me */
export function fetchMe(): Promise<MeResponse> {
  return request<MeResponse>('/auth/me');
}

/** POST /api/auth/logout */
export async function logoutUser(): Promise<void> {
  await request<void>('/auth/logout', { method: 'POST' });
}

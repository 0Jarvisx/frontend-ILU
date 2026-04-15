// ─── User Service ─────────────────────────────────────────────────────────────
//
// All functions that talk to /api/users/*.
// Requires the authenticated user to have the `user:manage` permission.

import { request } from './api';
import type {
  ApiUser,
  CreateUserPayload,
  UpdateUserPayload,
  Paginated,
} from '../types/admin';

export interface ListUsersFilter {
  page?: number;
  perPage?: number;
  isActive?: boolean;
  email?: string;
  roleId?: number;
}

/** GET /users */
export function listUsers(filter: ListUsersFilter = {}): Promise<Paginated<ApiUser>> {
  const { page = 1, perPage = 10, isActive, email, roleId } = filter;
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('perPage', String(perPage));
  if (isActive !== undefined) params.set('isActive', String(isActive));
  if (email) params.set('email', email);
  if (roleId) params.set('roleId', String(roleId));

  return request<Paginated<ApiUser>>(`/users?${params.toString()}`);
}

/** GET /users/:id */
export function getUser(id: number): Promise<ApiUser> {
  return request<ApiUser>(`/users/${id}`);
}

/** POST /users */
export function createUser(payload: CreateUserPayload): Promise<ApiUser> {
  return request<ApiUser, CreateUserPayload>('/users', {
    method: 'POST',
    body: payload,
  });
}

/** PATCH /users/:id */
export function updateUser(id: number, payload: UpdateUserPayload): Promise<ApiUser> {
  return request<ApiUser, UpdateUserPayload>(`/users/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

/** DELETE /users/:id — soft delete (sets is_active = false) */
export function deactivateUser(id: number): Promise<void> {
  return request<void>(`/users/${id}`, { method: 'DELETE' });
}

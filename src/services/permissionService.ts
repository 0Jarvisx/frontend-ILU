// ─── Permission Service ───────────────────────────────────────────────────────
//
// All functions that talk to /api/permissions/*.
// Requires the authenticated user to have the `permission:manage` permission.

import { request } from './api';
import type {
  ApiPermission,
  CreatePermissionPayload,
  UpdatePermissionPayload,
  Paginated,
} from '../types/admin';

/** GET /permissions?page=&perPage= */
export function listPermissions(page = 1, perPage = 50): Promise<Paginated<ApiPermission>> {
  return request<Paginated<ApiPermission>>(`/permissions?page=${page}&perPage=${perPage}`);
}

/** GET /permissions/:id */
export function getPermission(id: number): Promise<ApiPermission> {
  return request<ApiPermission>(`/permissions/${id}`);
}

/** POST /permissions */
export function createPermission(payload: CreatePermissionPayload): Promise<ApiPermission> {
  return request<ApiPermission, CreatePermissionPayload>('/permissions', {
    method: 'POST',
    body: payload,
  });
}

/** PATCH /permissions/:id */
export function updatePermission(
  id: number,
  payload: UpdatePermissionPayload,
): Promise<ApiPermission> {
  return request<ApiPermission, UpdatePermissionPayload>(`/permissions/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

/** DELETE /permissions/:id — responds 204 No Content */
export function deletePermission(id: number): Promise<void> {
  return request<void>(`/permissions/${id}`, { method: 'DELETE' });
}

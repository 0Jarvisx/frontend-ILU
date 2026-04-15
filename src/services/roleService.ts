// ─── Role Service ─────────────────────────────────────────────────────────────
//
// All functions that talk to /api/roles/*.
// Requires the authenticated user to have the `role:manage` permission.

import { request } from './api';
import type {
  ApiRole,
  CreateRolePayload,
  UpdateRolePayload,
  AssignPermissionsPayload,
  Paginated,
} from '../types/admin';

/** GET /roles?page=&perPage= */
export function listRoles(page = 1, perPage = 50): Promise<Paginated<ApiRole>> {
  return request<Paginated<ApiRole>>(`/roles?page=${page}&perPage=${perPage}`);
}

/** GET /roles/:id — includes its permissions */
export function getRole(id: number): Promise<ApiRole> {
  return request<ApiRole>(`/roles/${id}`);
}

/** POST /roles */
export function createRole(payload: CreateRolePayload): Promise<ApiRole> {
  return request<ApiRole, CreateRolePayload>('/roles', {
    method: 'POST',
    body: payload,
  });
}

/** PATCH /roles/:id */
export function updateRole(id: number, payload: UpdateRolePayload): Promise<ApiRole> {
  return request<ApiRole, UpdateRolePayload>(`/roles/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

/** DELETE /roles/:id — responds 204 No Content */
export function deleteRole(id: number): Promise<void> {
  return request<void>(`/roles/${id}`, { method: 'DELETE' });
}

/**
 * PUT /roles/:id/permissions
 * Replaces all permissions for the role. Omitting a permission removes it.
 */
export function assignPermissions(
  roleId: number,
  payload: AssignPermissionsPayload,
): Promise<ApiRole> {
  return request<ApiRole, AssignPermissionsPayload>(`/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: payload,
  });
}

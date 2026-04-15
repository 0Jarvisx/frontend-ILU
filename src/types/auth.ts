// ─── Auth API Types ───────────────────────────────────────────────────────────

/** Payload for POST /api/auth/register */
export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dpi: string;
}

/** Response from POST /api/auth/register */
export interface RegisterResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dpi: string;
}

/** Payload for POST /api/auth/login */
export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthPermission {
  id: number;
  name: string;
}

export interface AuthRole {
  id: number;
  name: string;
  permissions: AuthPermission[];
}

/** The user object returned inside the login response and from /api/auth/me */
export interface AuthUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dpi?: string;
  role: AuthRole;
  isActive?: boolean;
  lastLoginAt?: string;
}

/** Response from POST /auth/login */
export interface LoginResponse {
  user: AuthUser;
}

/** Response from GET /api/auth/me */
export type MeResponse = AuthUser;

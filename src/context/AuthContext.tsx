import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, logoutUser, fetchMe } from '../services/authService';
import type { AuthUser, LoginPayload } from '../types/auth';

const USER_STORAGE_KEY = 'ilu:user';

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function saveUser(user: AuthUser) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Al montar: el estado ya arranca con el usuario guardado en localStorage
   * (si existe), evitando el flash de "sin permisos" en el sidebar.
   * Luego verificamos con el servidor que la sesión sigue activa.
   * Si la cookie expiró, limpiamos el estado.
   */
  useEffect(() => {
    fetchMe()
      .then(serverUser => {
        // Si el servidor devuelve el usuario completo (con permisos), lo usamos.
        // Si devuelve una versión parcial, preferimos el almacenado en localStorage
        // que proviene del login (que sí incluye role.permissions).
        const stored = loadStoredUser();
        const resolved = serverUser
          ? {
              ...serverUser,
              role: {
                ...serverUser.role,
                permissions: serverUser.role?.permissions?.length
                  ? serverUser.role.permissions
                  : (stored?.role?.permissions ?? []),
              },
            }
          : stored;
        setUser(resolved);
        if (resolved) saveUser(resolved);
      })
      .catch(() => {
        // Sesión inválida: limpiar todo
        setUser(null);
        clearUser();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await loginUser(payload);
      saveUser(loggedInUser);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      clearUser();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

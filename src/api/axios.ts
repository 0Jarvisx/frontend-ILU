import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Si el servidor responde 401 en una ruta protegida, redirigir al login.
// Se excluye /api/auth/* para no crear un loop cuando fetchMe falla sin sesión.
api.interceptors.response.use(
  response => response,
  error => {
    const url: string = error.config?.url ?? '';
    const isAuthEndpoint = url.startsWith('/api/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

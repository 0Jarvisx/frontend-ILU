import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

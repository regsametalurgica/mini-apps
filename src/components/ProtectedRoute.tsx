import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ adminOnly = false }: ProtectedRouteProps) => {
  const { token, user } = useAuthStore();

  if (!token) {
    // Redireciona para o login se não houver token
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // Redireciona para o dashboard se tentar acessar admin sem ser admin
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../services/api';

function ProtectedRoute({ children, role }: { children: ReactNode; role?: UserRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  if (role && user?.role !== role) {
    if (user?.role === 'admin') return <Navigate to="/dashboard-admin" replace />;
    if (user?.role === 'prestataire') return <Navigate to="/dashboard-pro" replace />;
    return <Navigate to="/dashboard-client" replace />;
  }

  return children;
}

export default ProtectedRoute;

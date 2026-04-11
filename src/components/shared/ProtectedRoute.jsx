import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

function ProtectedRoute({ children, roles }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && roles.length) {
    const role = user?.role || '';
    if (!roles.includes(role)) return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default ProtectedRoute;

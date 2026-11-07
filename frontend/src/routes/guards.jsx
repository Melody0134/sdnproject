import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/common';
import ForbiddenPage from '../pages/ForbiddenPage';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState label="Đang xác thực phiên đăng nhập..." />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) return <ForbiddenPage />;
  return children;
};

export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (user) return <Navigate to="/app" replace />;
  return children;
};

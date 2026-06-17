import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLES, USER_ROLES, type UserRole } from '@/constants/roles';

const ProtectedRoute: React.FC<{ roles?: UserRole[] }> = ({ roles }) => {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (roles?.length) {
    const hasRole = role != null && roles.some((r) => r === role);
    if (!hasRole) return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

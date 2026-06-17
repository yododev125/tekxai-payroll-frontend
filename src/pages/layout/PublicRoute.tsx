import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const PublicRoute: React.FC = () => {
  const { isLoggedIn, role } = useAuth();

  if (isLoggedIn) {

    if (
      role === 'SUPER_ADMIN' ||
      role === 'ADMIN' ||
      role === 'HR' ||
      role === 'DIVISION_MANAGER'
    ) {
      return <Navigate to="/admin" replace />;
    }

    if (role === 'MARKETING') {
      return <Navigate to="/marketing" replace />;
    }

    return <Navigate to="/employee" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import type { UserType, AdminPermissions } from '../../types';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserType;
  requiredPermission?: keyof AdminPermissions;
  redirectTo?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/unauthorized',
}) => {
  const location = useLocation();
  const { isAuthorized, isLoading } = useAuthGuard({
    requiredRole,
    requiredPermission,
    redirectTo,
  });

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

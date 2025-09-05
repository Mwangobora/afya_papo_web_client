import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRBAC } from '../../hooks/useRBAC';
import type{ UserType } from '../../types/auth.types';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserType | UserType[];
  requiredPermission?: string;
  fallbackPath?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/unauthorized'
}) => {
  const { hasRole, hasPermission, loading } = useRBAC();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Check role access
  if (requiredRole) {
    const hasRequiredRole = Array.isArray(requiredRole) 
      ? requiredRole.some(role => hasRole(role))
      : hasRole(requiredRole);

    if (!hasRequiredRole) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check permission access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

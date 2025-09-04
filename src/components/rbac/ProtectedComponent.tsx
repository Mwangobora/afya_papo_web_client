import React, { type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermission';
import type { UserType, AdminPermissions } from '../../types/auth.types';

interface ProtectedComponentProps {
  children: ReactNode;
  requiredRole?: UserType;
  requiredPermission?: keyof AdminPermissions;
  requiredPermissions?: (keyof AdminPermissions)[];
  requireAll?: boolean;
  fallback?: ReactNode;
  onUnauthorized?: () => void;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  requiredRole,
  requiredPermission,
  requiredPermissions = [],
  requireAll = true,
  fallback = null,
  onUnauthorized,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { hasRole, hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  if (!isAuthenticated) {
    onUnauthorized?.();
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    onUnauthorized?.();
    return <>{fallback}</>;
  }

  // Check single permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    onUnauthorized?.();
    return <>{fallback}</>;
  }

  // Check multiple permissions requirement
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      onUnauthorized?.();
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
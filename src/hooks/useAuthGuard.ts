import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserType, AdminPermissions } from '../types/auth.types';

interface UseAuthGuardOptions {
  requiredRole?: UserType;
  requiredPermission?: keyof AdminPermissions;
  redirectTo?: string;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
  const navigate = useNavigate();
  
  const {
    requiredRole,
    requiredPermission,
    redirectTo = '/login'
  } = options;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate(redirectTo);
        return;
      }

      if (requiredRole && !hasRole(requiredRole)) {
        navigate('/unauthorized');
        return;
      }

      if (requiredPermission && !hasPermission(requiredPermission)) {
        navigate('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, requiredPermission, navigate, redirectTo, hasRole, hasPermission]);

  return {
    isAuthorized: isAuthenticated && 
      (!requiredRole || hasRole(requiredRole)) && 
      (!requiredPermission || hasPermission(requiredPermission)),
    isLoading
  };
};

export { useAuth };
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { RBACService } from '../services/rbac.service';
import type { UserType, AdminPermissions } from '../types/auth.types';

export const useRBAC = () => {
  const { user, isAuthenticated } = useAuth();

  const rbacMethods = useMemo(() => ({
    canAccessResource: (
      requiredRole?: UserType,
      requiredPermission?: keyof AdminPermissions
    ): boolean => {
      return RBACService.canUserAccessResource(user, requiredRole, requiredPermission);
    },

    hasRole: (role: UserType): boolean => {
      return user ? RBACService.hasRole(user, role) : false;
    },

    hasPermission: (permission: keyof AdminPermissions): boolean => {
      return user ? RBACService.hasPermission(user, permission) : false;
    },

    canAccessFacility: (facilityId: string): boolean => {
      return user ? RBACService.canAccessFacility(user, facilityId) : false;
    },

    getAccessibleFacilityIds: (): string[] => {
      return user ? RBACService.getAccessibleFacilityIds(user) : [];
    },

    getUserPermissions: (): string[] => {
      return user ? RBACService.getUserPermissions(user) : [];
    },
  }), [user]);

  return {
    ...rbacMethods,
    isAuthenticated,
    user,
  };
};
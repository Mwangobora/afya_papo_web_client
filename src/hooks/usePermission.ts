import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PermissionService } from '../services/permission.service';
import { AdminPermissions, UserType } from '../types/auth.types';

export const usePermissions = () => {
  const { user, permissions } = useAuth();

  const permissionService = useMemo(() => {
    return new PermissionService(user);
  }, [user]);

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    return permissionService.hasPermission(permission);
  };

  const hasRole = (role: UserType): boolean => {
    return permissionService.hasRole(role);
  };

  const hasAnyPermission = (permissionList: (keyof AdminPermissions)[]): boolean => {
    return permissionService.hasAnyPermission(permissionList);
  };

  const hasAllPermissions = (permissionList: (keyof AdminPermissions)[]): boolean => {
    return permissionService.hasAllPermissions(permissionList);
  };

  const canAccessFacility = (facilityId: string): boolean => {
    return permissionService.canAccessFacility(facilityId);
  };

  const canPerformAction = (action: string, resource?: string): boolean => {
    return permissionService.canPerformAction(action, resource);
  };

  return {
    permissions,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    canAccessFacility,
    canPerformAction,
    isHospitalAdmin: () => permissionService.isHospitalAdmin(),
    isEmergencyResponder: () => permissionService.isEmergencyResponder(),
    isSystemAdmin: () => permissionService.isSystemAdmin(),
    getFacilityId: () => permissionService.getFacilityId(),
    getResponderType: () => permissionService.getResponderType(),
  };
};
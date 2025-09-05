
import type { User, AdminPermissions, UserType } from '../types/auth.types';

export class PermissionService {
  private user: User | null;

  constructor(user: User | null) {
    this.user = user;
  }

  hasRole(role: UserType): boolean {
    return this.user?.userType === role;
  }

  hasPermission(permission: keyof AdminPermissions): boolean {
    const permissions = this.user?.hospitalAdminProfile?.permissions;
    return permissions?.[permission] || false;
  }

  hasAnyPermission(permissions: (keyof AdminPermissions)[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: (keyof AdminPermissions)[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  canAccessFacility(facilityId: string): boolean {
    const userFacilityId = this.user?.hospitalAdminProfile?.primaryFacility?.id;
    return userFacilityId === facilityId;
  }

  canManageDepartment(departmentId: string): boolean {
    const departmentAccess = this.user?.hospitalAdminProfile?.departmentAccess || [];
    return departmentAccess.includes(departmentId);
  }

  isHospitalAdmin(): boolean {
    return this.hasRole('HOSPITAL_ADMIN');
  }

  isEmergencyResponder(): boolean {
    return this.hasRole('RESPONDER');
  }

  isSystemAdmin(): boolean {
    return this.hasRole('SYSTEM_ADMIN');
  }

  getFacilityId(): string | null {
    return this.user?.hospitalAdminProfile?.primaryFacility?.id || null;
  }

  getResponderType(): string | null {
    return this.user?.emergencyResponderProfile?.responderType || null;
  }

  canPerformAction(action: string, resource?: string): boolean {
    const actionPermissionMap: Record<string, keyof AdminPermissions> = {
      'manage_beds': 'canManageBeds',
      'manage_staff': 'canManageStaff',
      'manage_resources': 'canManageResources',
      'view_patient_data': 'canViewPatientData',
      'generate_reports': 'canGenerateReports',
      'manage_ambulances': 'canManageAmbulances',
    };

    const permission = actionPermissionMap[action];
    return permission ? this.hasPermission(permission) : false;
  }
}
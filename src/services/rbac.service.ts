import type { User, UserType, AdminPermissions } from '../types/auth.types';

export class RBACService {
  private static readonly ROLE_PRIORITIES: Record<UserType, number> = {
    'CITIZEN': 1,
    'RESPONDER': 2,
    'HOSPITAL_ADMIN': 3,
    'SYSTEM_ADMIN': 4,
    'DISPATCHER': 3,
  };

  private static readonly PERMISSION_HIERARCHY: Record<keyof AdminPermissions, UserType[]> = {
    canManageBeds: ['HOSPITAL_ADMIN', 'SYSTEM_ADMIN'],
    canManageStaff: ['HOSPITAL_ADMIN', 'SYSTEM_ADMIN'],
    canManageResources: ['HOSPITAL_ADMIN', 'SYSTEM_ADMIN'],
    canViewPatientData: ['RESPONDER', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN', 'DISPATCHER'],
    canGenerateReports: ['HOSPITAL_ADMIN', 'SYSTEM_ADMIN', 'DISPATCHER'],
    canManageAmbulances: ['HOSPITAL_ADMIN', 'SYSTEM_ADMIN', 'DISPATCHER'],
  };

  static canUserAccessResource(
    user: User | null,
    requiredRole?: UserType,
    requiredPermission?: keyof AdminPermissions
  ): boolean {
    if (!user) return false;

    // Check role requirement
    if (requiredRole && !this.hasRole(user, requiredRole)) {
      return false;
    }

    // Check permission requirement
    if (requiredPermission && !this.hasPermission(user, requiredPermission)) {
      return false;
    }

    return true;
  }

  static hasRole(user: User, requiredRole: UserType): boolean {
    const userPriority = this.ROLE_PRIORITIES[user.userType] || 0;
    const requiredPriority = this.ROLE_PRIORITIES[requiredRole] || 0;
    
    return userPriority >= requiredPriority;
  }

  static hasPermission(user: User, permission: keyof AdminPermissions): boolean {
    // System admins have all permissions
    if (user.userType === 'SYSTEM_ADMIN') return true;

    // Check explicit permissions for hospital admins
    if (user.hospitalAdminProfile?.permissions) {
      return user.hospitalAdminProfile.permissions[permission] || false;
    }

    // Check permission hierarchy for other roles
    const allowedRoles = this.PERMISSION_HIERARCHY[permission] || [];
    return allowedRoles.includes(user.userType);
  }

  static filterByPermission<T extends { requiredPermission?: keyof AdminPermissions }>(
    user: User | null,
    items: T[]
  ): T[] {
    if (!user) return [];

    return items.filter(item => {
      if (!item.requiredPermission) return true;
      return this.hasPermission(user, item.requiredPermission);
    });
  }

  static canAccessFacility(user: User, facilityId: string): boolean {
    // System admins can access all facilities
    if (user.userType === 'SYSTEM_ADMIN') return true;

    // Hospital admins can access their assigned facility
    if (user.userType === 'HOSPITAL_ADMIN') {
      return user.hospitalAdminProfile?.primaryFacility?.id === facilityId;
    }

    // Emergency responders can access their assigned facility
    if (user.userType === 'RESPONDER') {
      return user.emergencyResponderProfile?.assignedFacility?.id === facilityId;
    }

    return false;
  }

  static getAccessibleFacilityIds(user: User): string[] {
    if (user.userType === 'SYSTEM_ADMIN') {
      // System admins have access to all facilities
      return ['*']; // Wildcard indicating all facilities
    }

    const facilityIds: string[] = [];

    if (user.hospitalAdminProfile?.primaryFacility?.id) {
      facilityIds.push(user.hospitalAdminProfile.primaryFacility.id);
    }

    if (user.emergencyResponderProfile?.assignedFacility?.id) {
      facilityIds.push(user.emergencyResponderProfile.assignedFacility.id);
    }

    return facilityIds;
  }

  static getUserPermissions(user: User): string[] {
    const permissions: string[] = [];

    // Add role-based permissions
    switch (user.userType) {
      case 'CITIZEN':
        permissions.push('create_emergency_report');
        break;

      case 'RESPONDER':
        permissions.push(
          'create_emergency_report',
          'respond_to_incidents',
          'update_incident_status',
          'view_assigned_incidents',
          'accept_assignment',
          'decline_assignment',
          'update_location'
        );
        break;

      case 'DISPATCHER':
        permissions.push(
          'view_all_incidents',
          'assign_responders',
          'coordinate_emergencies',
          'view_all_responders',
          'dispatch_ambulances',
          'view_analytics'
        );
        break;

      case 'HOSPITAL_ADMIN':
        if (user.hospitalAdminProfile?.permissions) {
          const adminPerms = user.hospitalAdminProfile.permissions;
          if (adminPerms.canManageBeds) permissions.push('manage_beds');
          if (adminPerms.canManageStaff) permissions.push('manage_staff');
          if (adminPerms.canManageResources) permissions.push('manage_resources');
          if (adminPerms.canViewPatientData) permissions.push('view_patient_data');
          if (adminPerms.canGenerateReports) permissions.push('generate_reports');
          if (adminPerms.canManageAmbulances) permissions.push('manage_ambulances');
        }
        break;

      case 'SYSTEM_ADMIN':
        permissions.push(
          'manage_all_facilities',
          'manage_all_users',
          'system_configuration',
          'access_all_data',
          'generate_system_reports'
        );
        break;
    }

    return permissions;
  }
}

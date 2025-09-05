import type { UserType } from "../types/auth.types";

export class RoleService {
  private static readonly ROLE_HIERARCHY: Record<UserType, number> = {
    'CITIZEN': 1,
    'RESPONDER': 2,
    'HOSPITAL_ADMIN': 3,
    'SYSTEM_ADMIN': 4,
    'DISPATCHER': 3,
  };
  

  static hasHigherOrEqualRole(userRole: UserType, requiredRole: UserType): boolean {
    const userLevel = this.ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = this.ROLE_HIERARCHY[requiredRole] || 0;
    return userLevel >= requiredLevel;
  }

  static getRoleLevel(role: UserType): number {
    return this.ROLE_HIERARCHY[role] || 0;
  }

  static getAllowedRoles(userRole: UserType): UserType[] {
    const userLevel = this.getRoleLevel(userRole);
    return Object.keys(this.ROLE_HIERARCHY)
      .filter(role => this.ROLE_HIERARCHY[role as UserType] <= userLevel) as UserType[];
  }

  static canAssignRole(assignerRole: UserType, targetRole: UserType): boolean {
    return this.hasHigherOrEqualRole(assignerRole, targetRole);
  }

  static getRoleDisplayName(role: UserType): string {
    const roleNames: Record<UserType, string> = {
      'CITIZEN': 'Citizen',
      'RESPONDER': 'Emergency Responder',
      'HOSPITAL_ADMIN': 'Hospital Administrator',
      'SYSTEM_ADMIN': 'System Administrator',
      'DISPATCHER': 'Dispatcher',
    };

    return roleNames[role] || role;
  }

  static getRolePermissions(role: UserType): string[] {
    const rolePermissions: Record<UserType, string[]> = {
      'CITIZEN': ['create_emergency_report'],
      'RESPONDER': [
        'create_emergency_report',
        'respond_to_incidents',
        'update_incident_status',
        'view_assigned_incidents'
      ],
      'HOSPITAL_ADMIN': [
        'manage_beds',
        'manage_staff',
        'manage_resources',
        'view_patient_data',
        'manage_ambulances',
        'generate_reports',
        'view_facility_dashboard'
      ],
      'SYSTEM_ADMIN': [
        'manage_all_facilities',
        'manage_all_users',
        'system_configuration',
        'access_all_data',
        'generate_system_reports'
      ],
      'DISPATCHER': [
        'view_facility_dashboard',
        'dispatch_ambulances',
        'assign_responders',
        'monitor_incidents'
      ],
    };

    return rolePermissions[role] || [];
  }
}
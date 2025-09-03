// Central export file for all types
// This file provides a single import point for all types used in the application

// Authentication types
export type {
  User,
  UserType,
  ResponderType,
  HospitalAdminProfile,
  EmergencyResponderProfile,
  AdminPermissions,
  AuthTokens,
  LoginCredentials,
  LoginResponse,
  ApiResponse,
  ApiError,
  PaginatedResponse,
} from './auth.types';

// Facility types
export type {
  Facility,
  FacilityType,
  FacilityStatus,
  BedManagement,
  BedType,
  BedStatus,
  Ambulance,
  AmbulanceStatus,
  EquipmentLevel,
} from './facility.types';

// Incident types
export type {
  Incident,
  IncidentType,
  SeverityLevel,
  IncidentStatus,
  Assignment,
  AssignmentStatus,
  TimelineEvent,
} from './incident.types';

// Common types
export type {
  Location,
  ContactInfo,
  Department,
  Resource,
  ResourceStatus,
  CrewMember,
  Dispatch,
  FacilityUpdate,
  IncidentUpdate,
  SubscriptionData,
} from './common.types';

// Re-export everything for convenience
export * from './auth.types';
export * from './facility.types';
export * from './incident.types';
export * from './common.types';
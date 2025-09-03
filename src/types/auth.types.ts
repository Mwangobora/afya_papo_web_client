// src/types/auth.types.ts
import type { Facility, BedManagement, Ambulance } from "./facility.types";
import type { Incident} from "./incident.types";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  userType: UserType;
  hospitalAdminProfile?: HospitalAdminProfile;
  emergencyResponderProfile?: EmergencyResponderProfile;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalAdminProfile {
  id: string;
  primaryFacility: Facility;
  permissions: AdminPermissions;
  departmentAccess: string[];
  canManageFleet: boolean;
  canViewAnalytics: boolean;
}

export interface EmergencyResponderProfile {
  id: string;
  responderType: ResponderType;
  certificationLevel: string;
  isOnDuty: boolean;
  currentLocation?: Location;
  assignedFacility?: Facility;
}

export interface AdminPermissions {
  canManageBeds: boolean;
  canManageStaff: boolean;
  canManageResources: boolean;
  canViewPatientData: boolean;
  canGenerateReports: boolean;
  canManageAmbulances: boolean;
}

export type UserType = 
  | 'CITIZEN' 
  | 'EMERGENCY_RESPONDER' 
  | 'HOSPITAL_ADMIN' 
  | 'SYSTEM_ADMIN';

export type ResponderType = 
  | 'PARAMEDIC' 
  | 'NURSE' 
  | 'DOCTOR' 
  | 'TECHNICIAN';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  userType?: UserType;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  errors?: string[];
}



// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  errors?: ApiError[];
  success: boolean;
  message?: string;
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

// GraphQL Subscription Types
export interface SubscriptionData<T = any> {
  data: T;
  updateType: 'CREATED' | 'UPDATED' | 'DELETED';
  timestamp: string;
}

export interface FacilityUpdate extends SubscriptionData {
  facility: Facility;
}

export interface IncidentUpdate extends SubscriptionData {
  incident: Incident;
}

export interface BedUpdate extends SubscriptionData {
  bed: BedManagement;
}

export interface AmbulanceUpdate extends SubscriptionData {
  ambulance: Ambulance;
}
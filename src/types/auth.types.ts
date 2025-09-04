// src/types/auth.types.ts
import type { Facility, BedManagement, Ambulance } from "./facility.types";
import type { Incident} from "./incident.types";

export interface User {
  id: string;
  phoneNumber: string;
  userType: UserType;
  preferredLanguage: LanguageEnum;
  verificationStatus: VerificationStatusEnum;
  isPhoneVerified: boolean;
  
  // Profile information
  profile?: UserProfile;
  emergencyContacts?: EmergencyContact[];
  
  // Timestamps
  createdAt: string;
  lastLogin?: string;
}

export interface UserProfile {
  fullName: string;
  nationalIdNumber?: string;
  dateOfBirth?: string;
  gender?: GenderEnum;
  
  // Health information
  bloodType?: BloodTypeEnum;
  medicalConditions?: string;
  medications?: string;
  allergies?: string;
  
  // Insurance
  healthInsuranceProvider?: string;
  healthInsuranceNumber?: string;
  
  // Location
  region?: string;
  district?: string;
  address?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
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
  | 'RESPONDER' 
  | 'HOSPITAL_ADMIN' 
  | 'SYSTEM_ADMIN'
  | 'DISPATCHER';

export type ResponderType = 
  | 'DOCTOR'
  | 'NURSE'
  | 'PARAMEDIC'
  | 'CLINICAL_OFFICER'
  | 'MEDICAL_ASSISTANT';

export type LanguageEnum = 'EN' | 'SW';

export type VerificationStatusEnum = 
  | 'UNVERIFIED'
  | 'PHONE_VERIFIED'
  | 'FULLY_VERIFIED';

export type GenderEnum = 'MALE' | 'FEMALE' | 'OTHER';

export type BloodTypeEnum = 
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE';

export type AvailabilityStatusEnum = 
  | 'AVAILABLE'
  | 'BUSY'
  | 'OFF_DUTY'
  | 'UNAVAILABLE';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  phoneNumber: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'mobile' | 'web' | 'tablet';
  os: string;
  appVersion?: string;
}

export interface RegisterInput {
  phoneNumber: string;
  userType: UserType;
  preferredLanguage: LanguageEnum;
  fullName: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  password: string;
}

export interface VerifyPhoneInput {
  phoneNumber: string;
  otpCode: string;
  verificationType: VerificationTypeEnum;
}

export type VerificationTypeEnum = 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET';

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
import type { User } from "./auth.types";
import type { Ambulance } from "./facility.types";
import type { Facility } from "./facility.types";
import type { Location } from "./common.types";

export interface Incident {
  id: string;
  incidentNumber: string;
  reporter: User;
  
  // Emergency classification
  incidentType: IncidentType;
  severity: SeverityLevel;
  status: IncidentStatus;
  
  // Location
  location: Location;
  locationAccuracy?: number;
  addressDescription?: string;
  
  // Emergency details
  description: string;
  symptoms?: string;
  
  // Patient information
  patientCount: number;
  patientAge?: number;
  patientGender?: GenderEnum;
  patientConscious?: boolean;
  patientBreathing?: boolean;
  ambulanceNeeded: boolean;
  
  // Assignments and timeline
  assignments: ResponderAssignment[];
  ambulanceAssignments: AmbulanceAssignment[];
  timeline: IncidentTimeline[];
  triage?: TriageAssessment;
  
  // Metadata
  sourcePlatform: SourcePlatformEnum;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ResponderAssignment {
  id: string;
  incident: Incident;
  responder: User;
  
  status: AssignmentStatus;
  priority: PriorityEnum;
  assignmentOrder: number;
  
  // Location and distance
  assignedLocation: Location;
  incidentLocation: Location;
  estimatedDistance: number;
  estimatedTravelTime: number;
  
  // Timeline
  notificationSentAt?: string;
  responseDeadline: string;
  respondedAt?: string;
  departedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  
  // Performance
  actualTravelTime?: number;
  totalResponseTime?: number;
  
  // Communication
  assignmentNotes?: string;
  responderNotes?: string;
  declineReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface AmbulanceAssignment {
  id: string;
  incident: Incident;
  ambulance: Ambulance;
  status: AmbulanceAssignmentStatus;
  priority: PriorityEnum;
  dispatchLocation: Location;
  estimatedArrival?: string;
  actualArrival?: string;
  transportStarted?: string;
  hospitalArrival?: string;
  dispatchInstructions?: string;
  crewNotes?: string;
  responseTimeMinutes?: number;
  transportTimeMinutes?: number;
  dispatchedAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface IncidentTimeline {
  id: string;
  incident: Incident;
  eventType: IncidentEventType;
  description: string;
  updatedBy: User;
  updatedByRole: UserRoleEnum;
  location?: Location;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface TriageAssessment {
  id: string;
  incident: Incident;
  assessedBy: User;
  triageColor: TriageColorEnum;
  priorityScore: number;
  airwayClear: boolean;
  breathingAdequate: boolean;
  circulationAdequate: boolean;
  consciousnessLevel: ConsciousnessLevelEnum;
  heartRate?: number;
  bloodPressure?: string;
  temperature?: number;
  assessmentNotes: string;
  recommendedCareLevel: CareLevelEnum;
  assessedAt: string;
}

export type IncidentType = 
  | 'MEDICAL_EMERGENCY'
  | 'TRAFFIC_ACCIDENT'
  | 'CARDIAC_ARREST'
  | 'BREATHING_DIFFICULTY'
  | 'SEVERE_BLEEDING'
  | 'EMERGENCY_CHILDBIRTH'
  | 'UNCONSCIOUS_PERSON'
  | 'OTHER_EMERGENCY';

export type SeverityLevel = 
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type IncidentStatus = 
  | 'CREATED'
  | 'DISPATCHING'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'TREATMENT_ACTIVE'
  | 'TRANSPORTING'
  | 'RESOLVED'
  | 'CANCELLED';

export type AssignmentStatus = 
  | 'PENDING'
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'TREATMENT_ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'TIMEOUT';

export type AmbulanceAssignmentStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'TRANSPORTING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PriorityEnum = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT'
  | 'CRITICAL';

export type SourcePlatformEnum = 
  | 'MOBILE_APP'
  | 'USSD'
  | 'VOICE_CALL'
  | 'WEB_PORTAL';

export type IncidentEventType = 
  | 'CREATED'
  | 'TRIAGED'
  | 'RESPONDER_ASSIGNED'
  | 'RESPONDER_ACCEPTED'
  | 'RESPONDER_DECLINED'
  | 'RESPONDER_EN_ROUTE'
  | 'RESPONDER_ARRIVED'
  | 'TREATMENT_STARTED'
  | 'AMBULANCE_REQUESTED'
  | 'AMBULANCE_ARRIVED'
  | 'TRANSPORT_STARTED'
  | 'HOSPITAL_ARRIVED'
  | 'HANDOVER_COMPLETED'
  | 'RESOLVED';

export type UserRoleEnum = 
  | 'CITIZEN'
  | 'RESPONDER'
  | 'DISPATCHER'
  | 'SYSTEM';

export type TriageColorEnum = 
  | 'RED'
  | 'YELLOW'
  | 'GREEN'
  | 'BLACK';

export type ConsciousnessLevelEnum = 
  | 'ALERT'
  | 'VOICE'
  | 'PAIN'
  | 'UNRESPONSIVE';

export type CareLevelEnum = 
  | 'BASIC'
  | 'ADVANCED'
  | 'HOSPITAL'
  | 'TRAUMA_CENTER';

// Import GenderEnum from auth types
import type { GenderEnum } from './auth.types';
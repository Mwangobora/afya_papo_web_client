import type { User } from "./auth.types";
import type { Ambulance } from "./facility.types";
import type { Facility } from "./facility.types";


export interface Incident {
  id: string;
  incidentNumber: string;
  incidentType: IncidentType;
  severity: SeverityLevel;
  status: IncidentStatus;
  location: Location;
  patientCount: number;
  patientAge?: number;
  symptoms?: string;
  estimatedArrival?: string;
  assignments: Assignment[];
  timeline: TimelineEvent[];
  dispatchedAmbulances: Ambulance[];
  destinationFacility?: Facility;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  responder: User;
  role: string;
  status: AssignmentStatus;
  assignedAt: string;
  arrivedAt?: string;
}

export interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  timestamp: string;
  createdBy: User;
}

export type IncidentType = 
  | 'CARDIAC_ARREST' 
  | 'TRAUMA' 
  | 'STROKE' 
  | 'RESPIRATORY' 
  | 'OVERDOSE' 
  | 'ACCIDENT' 
  | 'OTHER';

export type SeverityLevel = 
  | 'CRITICAL' 
  | 'URGENT' 
  | 'NON_URGENT';

export type IncidentStatus = 
  | 'REPORTED' 
  | 'DISPATCHED' 
  | 'EN_ROUTE' 
  | 'ON_SCENE' 
  | 'TRANSPORTING' 
  | 'RESOLVED' 
  | 'CANCELLED';

export type AssignmentStatus = 
  | 'ASSIGNED' 
  | 'ACKNOWLEDGED' 
  | 'EN_ROUTE' 
  | 'ON_SCENE' 
  | 'COMPLETED';
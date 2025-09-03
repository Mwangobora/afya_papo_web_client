import type { Incident } from "./incident.types";
import type { User } from "./auth.types"

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  region?: string;
  district?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  emergencyPhone?: string;
}

export interface Department {
  id: string;
  name: string;
  acceptsEmergencies: boolean;
  currentCaseload: number;
  availableStaff: number;
  headOfDepartment?: User;
}

export interface Resource {
  id: string;
  name: string;
  category: string;
  currentQuantity: number;
  minimumQuantity: number;
  unit: string;
  expirationDate?: string;
  status: ResourceStatus;
  lastUpdated: string;
}

export interface CrewMember {
  id: string;
  responder: User;
  role: string;
  isActive: boolean;
}

export interface Dispatch {
  id: string;
  incident: Incident;
  eta: number;
  status: string;
  dispatchedAt: string;
}

export interface FacilityUpdate {
  facility: {
    id: string;
    currentOccupancy: number;
    occupancyRate: number;
    bedManagement: Array<{
      id: string;
      bedNumber: string;
      status: string;
      updatedAt: string;
    }>;
    ambulanceFleet: Array<{
      id: string;
      unitNumber: string;
      status: string;
      currentLocation?: Location;
    }>;
  };
  updateType: 'CREATED' | 'UPDATED' | 'DELETED';
  timestamp: string;
}

export interface IncidentUpdate {
  incident: {
    id: string;
    incidentNumber: string;
    severity: string;
    status: string;
    estimatedArrival?: string;
    assignments: Array<{
      id: string;
      status: string;
    }>;
  };
  updateType: 'CREATED' | 'UPDATED' | 'DELETED';
  timestamp: string;
}
export type ResourceStatus = 
  | 'AVAILABLE' 
  | 'LOW_STOCK' 
  | 'OUT_OF_STOCK' 
  | 'EXPIRED';

// Generic subscription data wrapper
export interface SubscriptionData<T = any> {
  data: T;
  updateType: 'CREATED' | 'UPDATED' | 'DELETED';
  timestamp: string;
}
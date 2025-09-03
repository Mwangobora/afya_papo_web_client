import type { ContactInfo } from "./common.types";
import type { CrewMember } from "./common.types";
import type { Dispatch } from "./common.types";
import type { Department } from "./common.types";
import type { Resource } from "./common.types";

export interface Facility {
  id: string;
  name: string;
  facilityType: FacilityType;
  region: string;
  district: string;
  location: Location;
  contactInfo: ContactInfo;
  bedCapacity: number;
  emergencyBeds: number;
  icuBeds: number;
  currentOccupancy: number;
  occupancyRate: number;
  status: FacilityStatus;
  departments: Department[];
  bedManagement: BedManagement[];
  ambulanceFleet: Ambulance[];
  inventory: Resource[];
  isOperational: boolean;
  lastUpdated: string;
  facilityUpdate: string
}

export interface BedManagement {
  id: string;
  bedNumber: string;
  bedType: BedType;
  status: BedStatus;
  hasOxygen: boolean;
  hasVentilator: boolean;
  hasMonitoring: boolean;
  patientAge?: number;
  admissionType?: string;
  estimatedDischarge?: string;
  updatedAt: string;
}

export interface Ambulance {
  id: string;
  unitNumber: string;
  status: AmbulanceStatus;
  equipmentLevel: EquipmentLevel;
  make: string;
  model: string;
  year: number;
  currentLocation?: Location;
  currentDispatch?: Dispatch;
  currentCrew: CrewMember[];
  isOperational: boolean;
  lastMaintenance: string;
}

export type FacilityType = 
  | 'HOSPITAL' 
  | 'HEALTH_CENTER' 
  | 'CLINIC' 
  | 'DISPENSARY';

export type BedType = 
  | 'GENERAL' 
  | 'ICU' 
  | 'EMERGENCY' 
  | 'PEDIATRIC' 
  | 'MATERNITY';

export type BedStatus = 
  | 'AVAILABLE' 
  | 'OCCUPIED' 
  | 'MAINTENANCE' 
  | 'RESERVED';

export type AmbulanceStatus = 
  | 'AVAILABLE' 
  | 'DISPATCHED' 
  | 'EN_ROUTE' 
  | 'ON_SCENE' 
  | 'TRANSPORTING' 
  | 'OUT_OF_SERVICE';

export type EquipmentLevel = 
  | 'BLS' 
  | 'ALS' 
  | 'CRITICAL_CARE';

export type FacilityStatus = 
  | 'OPERATIONAL' 
  | 'MAINTENANCE' 
  | 'EMERGENCY_ONLY';
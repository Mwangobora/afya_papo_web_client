import type { ContactInfo } from "./common.types";
import type { CrewMember } from "./common.types";
import type { Dispatch } from "./common.types";
import type { Department } from "./common.types";
import type { Resource } from "./common.types";

export interface Facility {
  id: string;
  name: string;
  facilityType: FacilityTypeInfo;
  registrationNumber: string;
  
  // Location
  region: Region;
  district: District;
  location: Location;
  address: string;
  
  // Capacity
  bedCapacity: number;
  emergencyBeds: number;
  icuBeds: number;
  currentOccupancy: number;
  occupancyRate: number;
  
  // Contact
  phoneNumber: string;
  emergencyPhone: string;
  email?: string;
  
  // Capabilities
  acceptsEmergencies: boolean;
  hasEmergencyRoom: boolean;
  hasSurgery: boolean;
  hasICU: boolean;
  hasMaternity: boolean;
  
  // Real-time data
  bedManagement: BedManagement[];
  departments: Department[];
  ambulanceFleet: Ambulance[];
  
  // Current status
  isActive: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface FacilityTypeInfo {
  name: string;
  category: FacilityType;
}

export interface Region {
  id: string;
  name: string;
  nameSw: string;
  code: string;
  capital: string;
  centerPoint: Location;
  population?: number;
  areaKm2?: number;
  isActive: boolean;
}

export interface District {
  id: string;
  region: Region;
  name: string;
  nameSw: string;
  code: string;
  centerPoint: Location;
  population?: number;
  areaKm2?: number;
  isActive: boolean;
}

export interface BedManagement {
  id: string;
  bedNumber: string;
  bedType: BedType;
  status: BedStatus;
  
  // Equipment
  hasOxygen: boolean;
  hasVentilator: boolean;
  hasMonitoring: boolean;
  
  // Patient info (if occupied)
  patientAge?: number;
  admissionType?: string;
  estimatedDischarge?: string;
  
  updatedAt: string;
}

export interface Ambulance {
  id: string;
  unitNumber: string;
  
  // Facility association
  facility: Facility;
  
  // Vehicle information
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  chassisNumber?: string;
  
  // Equipment and capabilities
  equipmentLevel: EquipmentLevel;
  patientCapacity: number;
  medicalEquipment: string[];
  
  // Current status and location
  status: AmbulanceStatus;
  currentLocation?: Location;
  lastLocationUpdate?: string;
  
  // Maintenance and compliance
  lastInspection?: string;
  nextMaintenance?: string;
  insuranceExpiry?: string;
  isOperational: boolean;
  
  // Performance metrics
  totalDispatches: number;
  totalTransports: number;
  averageResponseTimeMinutes: number;
  
  createdAt: string;
  updatedAt: string;
}

export type FacilityType = 
  | 'HOSPITAL'
  | 'HEALTH_CENTER'
  | 'DISPENSARY'
  | 'CLINIC';

export type BedType = 
  | 'GENERAL'
  | 'EMERGENCY'
  | 'ICU'
  | 'MATERNITY'
  | 'PEDIATRIC';

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
  | 'AT_HOSPITAL'
  | 'OUT_OF_SERVICE'
  | 'MAINTENANCE';

export type EquipmentLevel = 
  | 'BASIC'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'CRITICAL_CARE'
  | 'NEONATAL'
  | 'SPECIALIZED';
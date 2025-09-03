# AfyaPapo Types Documentation

This document provides comprehensive documentation for all TypeScript types used in the AfyaPapo web client.

## Table of Contents

1. [Authentication Types](#authentication-types)
2. [Facility Types](#facility-types)
3. [Incident Types](#incident-types)
4. [Common Types](#common-types)
5. [API Response Types](#api-response-types)
6. [Subscription Types](#subscription-types)

## Authentication Types

### Core User Types

```typescript
// User entity
interface User {
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

// User type enumeration
type UserType = 
  | 'CITIZEN' 
  | 'EMERGENCY_RESPONDER' 
  | 'HOSPITAL_ADMIN' 
  | 'SYSTEM_ADMIN';

// Responder type enumeration
type ResponderType = 
  | 'PARAMEDIC' 
  | 'NURSE' 
  | 'DOCTOR' 
  | 'TECHNICIAN';
```

### Profile Types

```typescript
// Hospital administrator profile
interface HospitalAdminProfile {
  id: string;
  primaryFacility: Facility;
  permissions: AdminPermissions;
  departmentAccess: string[];
  canManageFleet: boolean;
  canViewAnalytics: boolean;
}

// Emergency responder profile
interface EmergencyResponderProfile {
  id: string;
  responderType: ResponderType;
  certificationLevel: string;
  isOnDuty: boolean;
  currentLocation?: Location;
  assignedFacility?: Facility;
}

// Admin permissions
interface AdminPermissions {
  canManageBeds: boolean;
  canManageStaff: boolean;
  canManageResources: boolean;
  canViewPatientData: boolean;
  canGenerateReports: boolean;
  canManageAmbulances: boolean;
}
```

### Authentication Flow Types

```typescript
// Authentication tokens
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// Login credentials
interface LoginCredentials {
  username: string;
  password: string;
  userType?: UserType;
}

// Login response
interface LoginResponse {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  errors?: string[];
}
```

## Facility Types

### Core Facility Types

```typescript
// Main facility entity
interface Facility {
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
  facilityUpdate: string;
}

// Facility type enumeration
type FacilityType = 
  | 'HOSPITAL' 
  | 'HEALTH_CENTER' 
  | 'CLINIC' 
  | 'DISPENSARY';

// Facility status enumeration
type FacilityStatus = 
  | 'OPERATIONAL' 
  | 'MAINTENANCE' 
  | 'EMERGENCY_ONLY';
```

### Bed Management Types

```typescript
// Bed management entity
interface BedManagement {
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

// Bed type enumeration
type BedType = 
  | 'GENERAL' 
  | 'ICU' 
  | 'EMERGENCY' 
  | 'PEDIATRIC' 
  | 'MATERNITY';

// Bed status enumeration
type BedStatus = 
  | 'AVAILABLE' 
  | 'OCCUPIED' 
  | 'MAINTENANCE' 
  | 'RESERVED';
```

### Ambulance Types

```typescript
// Ambulance entity
interface Ambulance {
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

// Ambulance status enumeration
type AmbulanceStatus = 
  | 'AVAILABLE' 
  | 'DISPATCHED' 
  | 'EN_ROUTE' 
  | 'ON_SCENE' 
  | 'TRANSPORTING' 
  | 'OUT_OF_SERVICE';

// Equipment level enumeration
type EquipmentLevel = 
  | 'BLS'  // Basic Life Support
  | 'ALS'  // Advanced Life Support
  | 'CRITICAL_CARE';
```

## Incident Types

### Core Incident Types

```typescript
// Main incident entity
interface Incident {
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

// Incident type enumeration
type IncidentType = 
  | 'CARDIAC_ARREST' 
  | 'TRAUMA' 
  | 'STROKE' 
  | 'RESPIRATORY' 
  | 'OVERDOSE' 
  | 'ACCIDENT' 
  | 'OTHER';

// Severity level enumeration
type SeverityLevel = 
  | 'CRITICAL' 
  | 'URGENT' 
  | 'NON_URGENT';

// Incident status enumeration
type IncidentStatus = 
  | 'REPORTED' 
  | 'DISPATCHED' 
  | 'EN_ROUTE' 
  | 'ON_SCENE' 
  | 'TRANSPORTING' 
  | 'RESOLVED' 
  | 'CANCELLED';
```

### Assignment and Timeline Types

```typescript
// Assignment entity
interface Assignment {
  id: string;
  responder: User;
  role: string;
  status: AssignmentStatus;
  assignedAt: string;
  arrivedAt?: string;
}

// Assignment status enumeration
type AssignmentStatus = 
  | 'ASSIGNED' 
  | 'ACKNOWLEDGED' 
  | 'EN_ROUTE' 
  | 'ON_SCENE' 
  | 'COMPLETED';

// Timeline event entity
interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  timestamp: string;
  createdBy: User;
}
```

## Common Types

### Location and Contact Types

```typescript
// Geographic location
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  region?: string;
  district?: string;
}

// Contact information
interface ContactInfo {
  phone: string;
  email: string;
  emergencyPhone?: string;
}
```

### Organizational Types

```typescript
// Department entity
interface Department {
  id: string;
  name: string;
  acceptsEmergencies: boolean;
  currentCaseload: number;
  availableStaff: number;
  headOfDepartment?: User;
}

// Resource/inventory entity
interface Resource {
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

// Resource status enumeration
type ResourceStatus = 
  | 'AVAILABLE' 
  | 'LOW_STOCK' 
  | 'OUT_OF_STOCK' 
  | 'EXPIRED';
```

### Operational Types

```typescript
// Crew member entity
interface CrewMember {
  id: string;
  responder: User;
  role: string;
  isActive: boolean;
}

// Dispatch entity
interface Dispatch {
  id: string;
  incident: Incident;
  eta: number;
  status: string;
  dispatchedAt: string;
}
```

## API Response Types

### Generic Response Types

```typescript
// Generic API response wrapper
interface ApiResponse<T = any> {
  data?: T;
  errors?: ApiError[];
  success: boolean;
  message?: string;
}

// API error structure
interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

// Paginated response wrapper
interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}
```

## Subscription Types

### Real-time Update Types

```typescript
// Generic subscription data wrapper
interface SubscriptionData<T = any> {
  data: T;
  updateType: 'CREATED' | 'UPDATED' | 'DELETED';
  timestamp: string;
}

// Facility update subscription
interface FacilityUpdate {
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

// Incident update subscription
interface IncidentUpdate {
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

// Specific update types
interface BedUpdate extends SubscriptionData {
  bed: BedManagement;
}

interface AmbulanceUpdate extends SubscriptionData {
  ambulance: Ambulance;
}
```

## Usage Examples

### Service Layer Usage

```typescript
// Using types in services
class IncidentService {
  async getActiveIncidents(
    facilityId: string,
    filters?: IncidentFilters
  ): Promise<PaginatedResponse<Incident>> {
    // Implementation
  }

  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    notes?: string
  ): Promise<ApiResponse<Incident>> {
    // Implementation
  }
}
```

### Hook Usage

```typescript
// Using types in React hooks
const useIncidents = ({ facilityId }: { facilityId: string }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Implementation
  
  return { incidents, loading, error };
};
```

### GraphQL Operation Usage

```typescript
// Using types with GraphQL operations
const GET_FACILITY_DASHBOARD = gql`
  query GetFacilityDashboard($facilityId: ID!) {
    facility(id: $facilityId) {
      id
      name
      bedCapacity
      currentOccupancy
      # ... other fields
    }
  }
`;

// Type-safe query result
interface GetFacilityDashboardQuery {
  facility: Facility;
}
```

## Type Safety Best Practices

1. **Always use strict TypeScript configuration**
2. **Define interfaces for all data structures**
3. **Use union types for enumerations**
4. **Implement proper error handling with typed errors**
5. **Use generic types for reusable components**
6. **Document complex types with JSDoc comments**
7. **Keep types close to their usage when possible**
8. **Use type guards for runtime type checking**

This documentation ensures all types are properly defined and documented for the AfyaPapo emergency response system.
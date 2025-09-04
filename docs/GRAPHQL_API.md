# AfyaPapo GraphQL API Documentation

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Schema Structure](#schema-structure)
4. [Core Types](#core-types)
5. [Queries](#queries)
6. [Mutations](#mutations)
7. [Subscriptions](#subscriptions)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Examples & Usage](#examples--usage)

## API Overview

**Endpoint:** `http://localhost:8000/graphql/`  
**GraphiQL Interface:** `http://localhost:8000/graphql/` (in browser)  
**Authentication:** Bearer Token in Authorization header  
**WebSocket Subscriptions:** `ws://localhost:8000/ws/graphql/`

### Key Features
- **Real-time Subscriptions** for emergency updates
- **Multi-language Support** (English/Swahili)
- **Role-based Access Control** 
- **Comprehensive Error Handling**
- **Input Validation** and Sanitization

## Authentication

### Bearer Token Format
```http
Authorization: Bearer <access_token>
```

### Token Types
- **Access Token**: 15 minutes lifetime, for API requests
- **Refresh Token**: 7 days lifetime, for token renewal
- **Verification Token**: 24 hours lifetime, for phone/email verification

## Schema Structure

```graphql
type Query {
  # User queries
  me: UserType
  users(filters: UserFiltersInput): [UserType]
  
  # Incident queries
  incident(id: ID!): IncidentType
  incidents(filters: IncidentFiltersInput): [IncidentType]
  nearbyIncidents(location: LocationInput!, radius: Float): [IncidentType]
  
  # Responder queries
  responder(id: ID!): ResponderType
  availableResponders(location: LocationInput!, radius: Float): [ResponderType]
  
  # Hospital queries
  hospital(id: ID!): FacilityType
  hospitals(filters: FacilityFiltersInput): [FacilityType]
  nearbyHospitals(location: LocationInput!, radius: Float): [FacilityType]
  
  # Ambulance queries
  ambulance(id: ID!): AmbulanceUnitType
  ambulances(filters: AmbulanceFiltersInput): [AmbulanceUnitType]
}

type Mutation {
  # Authentication
  register(input: RegisterInput!): AuthPayload
  login(input: LoginInput!): AuthPayload
  verifyPhone(input: VerifyPhoneInput!): AuthPayload
  refreshToken(refreshToken: String!): AuthPayload
  logout: Boolean
  
  # Emergency operations
  createIncident(input: CreateIncidentInput!): IncidentType
  updateIncidentStatus(input: UpdateIncidentStatusInput!): IncidentType
  
  # Assignment operations
  acceptAssignment(assignmentId: ID!): ResponderAssignmentType
  declineAssignment(input: DeclineAssignmentInput!): ResponderAssignmentType
  updateResponderLocation(location: LocationInput!): ResponderType
  
  # Hospital operations
  updateBedStatus(input: UpdateBedStatusInput!): BedManagementType
  updateFacilityCapacity(input: UpdateCapacityInput!): FacilityType
}

type Subscription {
  # Real-time incident updates
  incidentUpdates(incidentId: ID!): IncidentUpdateType
  
  # Assignment notifications
  assignmentNotifications(userId: ID!): AssignmentNotificationType
  
  # System alerts
  emergencyAlerts(filters: AlertFiltersInput): EmergencyAlertType
  
  # Hospital updates
  facilityUpdates(facilityId: ID!): FacilityUpdateType
}
```

## Core Types

### Authentication Types

```graphql
type AuthPayload {
  success: Boolean!
  accessToken: String
  refreshToken: String
  user: UserType
  message: String
  errors: [String]
}

input RegisterInput {
  phoneNumber: String!
  userType: UserTypeEnum!
  preferredLanguage: LanguageEnum!
  fullName: String!
  emergencyContactName: String
  emergencyContactPhone: String
  password: String!
}

input LoginInput {
  phoneNumber: String!
  password: String!
  deviceInfo: DeviceInfoInput
}

input VerifyPhoneInput {
  phoneNumber: String!
  otpCode: String!
  verificationType: VerificationTypeEnum!
}

enum UserTypeEnum {
  CITIZEN
  RESPONDER
  HOSPITAL_ADMIN
  SYSTEM_ADMIN
  DISPATCHER
}

enum LanguageEnum {
  EN
  SW
}
```

### User Types

```graphql
type UserType {
  id: ID!
  phoneNumber: String!
  userType: UserTypeEnum!
  preferredLanguage: LanguageEnum!
  verificationStatus: VerificationStatusEnum!
  isPhoneVerified: Boolean!
  
  # Profile information
  profile: UserProfileType
  emergencyContacts: [EmergencyContactType!]
  
  # Timestamps
  createdAt: DateTime!
  lastLogin: DateTime
}

type UserProfileType {
  fullName: String!
  nationalIdNumber: String
  dateOfBirth: Date
  gender: GenderEnum
  
  # Health information
  bloodType: BloodTypeEnum
  medicalConditions: String
  medications: String
  allergies: String
  
  # Insurance
  healthInsuranceProvider: String
  healthInsuranceNumber: String
  
  # Location
  region: String
  district: String
  address: String
}

enum VerificationStatusEnum {
  UNVERIFIED
  PHONE_VERIFIED
  FULLY_VERIFIED
}

enum GenderEnum {
  MALE
  FEMALE
  OTHER
}

enum BloodTypeEnum {
  A_POSITIVE
  A_NEGATIVE
  B_POSITIVE
  B_NEGATIVE
  AB_POSITIVE
  AB_NEGATIVE
  O_POSITIVE
  O_NEGATIVE
}
```

### Incident Types

```graphql
type IncidentType {
  id: ID!
  incidentNumber: String!
  reporter: UserType!
  
  # Emergency classification
  incidentType: IncidentTypeEnum!
  severity: IncidentSeverityEnum!
  status: IncidentStatusEnum!
  
  # Location
  location: LocationType!
  locationAccuracy: Int
  addressDescription: String
  
  # Emergency details
  description: String!
  symptoms: String
  
  # Patient information
  patientCount: Int!
  patientAge: Int
  patientGender: GenderEnum
  patientConscious: Boolean
  patientBreathing: Boolean
  ambulanceNeeded: Boolean!
  
  # Assignments and timeline
  assignments: [ResponderAssignmentType!]
  ambulanceAssignments: [AmbulanceAssignmentType!]
  timeline: [IncidentTimelineType!]
  triage: TriageAssessmentType
  
  # Metadata
  sourcePlatform: SourcePlatformEnum!
  
  # Timestamps
  createdAt: DateTime!
  updatedAt: DateTime!
}

type LocationType {
  latitude: Float!
  longitude: Float!
  accuracy: Int
}

input LocationInput {
  latitude: Float!
  longitude: Float!
  accuracy: Int
}

enum IncidentTypeEnum {
  MEDICAL_EMERGENCY
  TRAFFIC_ACCIDENT
  CARDIAC_ARREST
  BREATHING_DIFFICULTY
  SEVERE_BLEEDING
  EMERGENCY_CHILDBIRTH
  UNCONSCIOUS_PERSON
  OTHER_EMERGENCY
}

enum IncidentSeverityEnum {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum IncidentStatusEnum {
  CREATED
  DISPATCHING
  ASSIGNED
  EN_ROUTE
  ON_SCENE
  TREATMENT_ACTIVE
  TRANSPORTING
  RESOLVED
  CANCELLED
}

enum SourcePlatformEnum {
  MOBILE_APP
  USSD
  VOICE_CALL
  WEB_PORTAL
}
```

### Responder Types

```graphql
type ResponderType {
  id: ID!
  user: UserType!
  responderType: ResponderTypeEnum!
  fullName: String!
  licenseNumber: String!
  
  # Professional details
  primaryQualification: String!
  yearsOfExperience: Int!
  specializations: [String!]
  
  # Hospital affiliations
  primaryHospital: FacilityType
  affiliatedHospitals: [FacilityType!]
  
  # Status and availability
  verificationStatus: VerificationStatusEnum!
  availabilityStatus: AvailabilityStatusEnum!
  currentLocation: LocationType
  serviceRadius: Float
  
  # Performance metrics
  totalResponses: Int!
  successfulResponses: Int!
  averageResponseTime: Int!
  averageRating: Float!
  
  # Availability schedule
  availability: ResponderAvailabilityType
  
  # Current assignments
  activeAssignments: [ResponderAssignmentType!]
  
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum ResponderTypeEnum {
  DOCTOR
  NURSE
  PARAMEDIC
  CLINICAL_OFFICER
  MEDICAL_ASSISTANT
}

enum AvailabilityStatusEnum {
  AVAILABLE
  BUSY
  OFF_DUTY
  UNAVAILABLE
}

type ResponderAvailabilityType {
  currentLocation: LocationType
  serviceRadius: Float!
  lastLocationUpdate: DateTime
  isOnDuty: Boolean!
  maxConcurrentCases: Int!
}
```

### Assignment Types

```graphql
type ResponderAssignmentType {
  id: ID!
  incident: IncidentType!
  responder: ResponderType!
  
  status: AssignmentStatusEnum!
  priority: PriorityEnum!
  assignmentOrder: Int!
  
  # Location and distance
  assignedLocation: LocationType!
  incidentLocation: LocationType!
  estimatedDistance: Float!
  estimatedTravelTime: Int!
  
  # Timeline
  notificationSentAt: DateTime
  responseDeadline: DateTime!
  respondedAt: DateTime
  departedAt: DateTime
  arrivedAt: DateTime
  completedAt: DateTime
  
  # Performance
  actualTravelTime: Int
  totalResponseTime: Int
  
  # Communication
  assignmentNotes: String
  responderNotes: String
  declineReason: String
  
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum AssignmentStatusEnum {
  PENDING
  SENT
  ACCEPTED
  DECLINED
  EN_ROUTE
  ON_SCENE
  TREATMENT_ACTIVE
  COMPLETED
  CANCELLED
  TIMEOUT
}

enum PriorityEnum {
  LOW
  MEDIUM
  HIGH
  URGENT
  CRITICAL
}
```

### Hospital Types

```graphql
type FacilityType {
  id: ID!
  name: String!
  facilityType: FacilityTypeInfoType!
  registrationNumber: String!
  
  # Location
  region: RegionType!
  district: DistrictType!
  location: LocationType!
  address: String!
  
  # Capacity
  bedCapacity: Int!
  emergencyBeds: Int!
  icuBeds: Int!
  currentOccupancy: Int!
  occupancyRate: Float!
  
  # Contact
  phoneNumber: String!
  emergencyPhone: String!
  email: String
  
  # Capabilities
  acceptsEmergencies: Boolean!
  hasEmergencyRoom: Boolean!
  hasSurgery: Boolean!
  hasICU: Boolean!
  hasMaternity: Boolean!
  
  # Real-time data
  bedManagement: [BedManagementType!]
  departments: [DepartmentType!]
  ambulanceFleet: [AmbulanceUnitType!]
  
  # Current status
  isActive: Boolean!
  
  createdAt: DateTime!
  updatedAt: DateTime!
}

type BedManagementType {
  id: ID!
  bedNumber: String!
  bedType: BedTypeEnum!
  status: BedStatusEnum!
  
  # Equipment
  hasOxygen: Boolean!
  hasVentilator: Boolean!
  hasMonitoring: Boolean!
  
  # Patient info (if occupied)
  patientAge: Int
  admissionType: String
  estimatedDischarge: DateTime
  
  updatedAt: DateTime!
}

enum BedTypeEnum {
  GENERAL
  EMERGENCY
  ICU
  MATERNITY
  PEDIATRIC
}

enum BedStatusEnum {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
  RESERVED
}
```

## Queries

### Authentication Queries

```graphql
# Get current user information
query Me {
  me {
    id
    phoneNumber
    userType
    verificationStatus
    profile {
      fullName
      bloodType
      medicalConditions
    }
    emergencyContacts {
      name
      phoneNumber
      relationship
    }
  }
}
```

### Incident Queries

```graphql
# Get specific incident
query GetIncident($id: ID!) {
  incident(id: $id) {
    id
    incidentNumber
    status
    severity
    description
    location {
      latitude
      longitude
    }
    assignments {
      id
      status
      responder {
        fullName
        responderType
      }
      estimatedTravelTime
    }
    timeline {
      eventType
      description
      timestamp
      updatedBy {
        fullName
      }
    }
  }
}

# Search incidents with filters
query SearchIncidents($filters: IncidentFiltersInput!) {
  incidents(filters: $filters) {
    id
    incidentNumber
    status
    severity
    createdAt
    reporter {
      profile {
        fullName
      }
    }
  }
}

# Find nearby incidents
query NearbyIncidents($location: LocationInput!, $radius: Float!) {
  nearbyIncidents(location: $location, radius: $radius) {
    id
    incidentNumber
    status
    severity
    location {
      latitude
      longitude
    }
    createdAt
  }
}
```

### Responder Queries

```graphql
# Find available responders
query AvailableResponders($location: LocationInput!, $radius: Float!) {
  availableResponders(location: $location, radius: $radius) {
    id
    fullName
    responderType
    availabilityStatus
    currentLocation {
      latitude
      longitude
    }
    serviceRadius
    averageResponseTime
    averageRating
  }
}

# Get responder details
query GetResponder($id: ID!) {
  responder(id: $id) {
    id
    fullName
    responderType
    primaryQualification
    yearsOfExperience
    specializations
    verificationStatus
    primaryHospital {
      name
      location {
        latitude
        longitude
      }
    }
    totalResponses
    averageRating
  }
}
```

### Hospital Queries

```graphql
# Get hospital details
query GetHospital($id: ID!) {
  hospital(id: $id) {
    id
    name
    facilityType {
      name
      category
    }
    location {
      latitude
      longitude
    }
    bedCapacity
    currentOccupancy
    occupancyRate
    
    bedManagement {
      bedNumber
      bedType
      status
      hasOxygen
      hasVentilator
    }
    
    departments {
      name
      acceptsEmergencies
    }
    
    ambulanceFleet {
      unitNumber
      status
      equipmentLevel
    }
  }
}

# Find nearby hospitals
query NearbyHospitals($location: LocationInput!, $radius: Float!) {
  nearbyHospitals(location: $location, radius: $radius) {
    id
    name
    location {
      latitude
      longitude
    }
    acceptsEmergencies
    emergencyBeds
    currentOccupancy
    phoneNumber
  }
}
```

## Mutations

### Authentication Mutations

```graphql
# User registration
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    success
    accessToken
    refreshToken
    user {
      id
      phoneNumber
      verificationStatus
    }
    message
    errors
  }
}

# User login
mutation Login($input: LoginInput!) {
  login(input: $input) {
    success
    accessToken
    refreshToken
    user {
      id
      phoneNumber
      userType
      profile {
        fullName
      }
    }
    message
    errors
  }
}

# Phone verification
mutation VerifyPhone($input: VerifyPhoneInput!) {
  verifyPhone(input: $input) {
    success
    accessToken
    refreshToken
    user {
      id
      isPhoneVerified
      verificationStatus
    }
    message
    errors
  }
}

# Token refresh
mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    success
    accessToken
    refreshToken
    message
    errors
  }
}
```

### Emergency Operations

```graphql
# Create emergency incident
mutation CreateIncident($input: CreateIncidentInput!) {
  createIncident(input: $input) {
    id
    incidentNumber
    status
    severity
    location {
      latitude
      longitude
    }
    assignments {
      id
      responder {
        fullName
        phoneNumber
      }
      estimatedTravelTime
    }
    triage {
      triageColor
      priorityScore
    }
  }
}

input CreateIncidentInput {
  incidentType: IncidentTypeEnum!
  location: LocationInput!
  description: String!
  symptoms: String
  patientCount: Int!
  patientAge: Int
  patientGender: GenderEnum
  patientConscious: Boolean
  patientBreathing: Boolean
  ambulanceNeeded: Boolean!
  addressDescription: String
  specializedEquipmentNeeded: String
}

# Update incident status
mutation UpdateIncidentStatus($input: UpdateIncidentStatusInput!) {
  updateIncidentStatus(input: $input) {
    id
    status
    timeline {
      eventType
      description
      timestamp
    }
  }
}

input UpdateIncidentStatusInput {
  incidentId: ID!
  status: IncidentStatusEnum!
  notes: String
  location: LocationInput
}
```

### Assignment Operations

```graphql
# Accept assignment
mutation AcceptAssignment($assignmentId: ID!) {
  acceptAssignment(assignmentId: $assignmentId) {
    id
    status
    incident {
      incidentNumber
      location {
        latitude
        longitude
      }
      description
      reporter {
        phoneNumber
      }
    }
    estimatedTravelTime
    responseDeadline
  }
}

# Decline assignment
mutation DeclineAssignment($input: DeclineAssignmentInput!) {
  declineAssignment(input: $input) {
    id
    status
    declineReason
  }
}

input DeclineAssignmentInput {
  assignmentId: ID!
  reason: String!
}

# Update responder location
mutation UpdateResponderLocation($location: LocationInput!) {
  updateResponderLocation(location: $location) {
    id
    currentLocation {
      latitude
      longitude
    }
    availability {
      lastLocationUpdate
    }
  }
}
```

### Hospital Operations

```graphql
# Update bed status
mutation UpdateBedStatus($input: UpdateBedStatusInput!) {
  updateBedStatus(input: $input) {
    id
    status
    patientAge
    estimatedDischarge
  }
}

input UpdateBedStatusInput {
  bedId: ID!
  status: BedStatusEnum!
  patientAge: Int
  admissionType: String
  estimatedDischarge: DateTime
}
```

## Subscriptions

### Real-time Incident Updates

```graphql
# Subscribe to incident updates
subscription IncidentUpdates($incidentId: ID!) {
  incidentUpdates(incidentId: $incidentId) {
    incident {
      id
      status
      assignments {
        status
        responder {
          fullName
          currentLocation {
            latitude
            longitude
          }
        }
        estimatedTravelTime
      }
      timeline {
        eventType
        description
        timestamp
      }
    }
    updateType
    message
    timestamp
  }
}
```

### Assignment Notifications

```graphql
# Listen for new assignments
subscription AssignmentNotifications($userId: ID!) {
  assignmentNotifications(userId: $userId) {
    assignment {
      id
      incident {
        incidentNumber
        incidentType
        severity
        location {
          latitude
          longitude
        }
        description
        patientCount
      }
      estimatedDistance
      estimatedTravelTime
      responseDeadline
    }
    notificationType
    message
    timestamp
  }
}
```

### Emergency Alerts

```graphql
# System-wide emergency alerts
subscription EmergencyAlerts($filters: AlertFiltersInput) {
  emergencyAlerts(filters: $filters) {
    alertType
    severity
    message
    affectedArea {
      regions
      districts
    }
    instructions
    timestamp
    expiresAt
  }
}
```

### Hospital Updates

```graphql
# Facility real-time updates
subscription FacilityUpdates($facilityId: ID!) {
  facilityUpdates(facilityId: $facilityId) {
    facility {
      id
      currentOccupancy
      occupancyRate
      bedManagement {
        bedNumber
        status
      }
      ambulanceFleet {
        unitNumber
        status
        currentLocation {
          latitude
          longitude
        }
      }
    }
    updateType
    timestamp
  }
}
```

## Error Handling

### Error Types

```graphql
type Error {
  message: String!
  code: ErrorCodeEnum!
  field: String
  details: String
}

enum ErrorCodeEnum {
  AUTHENTICATION_REQUIRED
  INVALID_TOKEN
  PERMISSION_DENIED
  INVALID_INPUT
  RESOURCE_NOT_FOUND
  RATE_LIMIT_EXCEEDED
  INTERNAL_ERROR
  VALIDATION_ERROR
  DUPLICATE_RESOURCE
  RESOURCE_CONFLICT
}
```

### Example Error Response

```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "AUTHENTICATION_REQUIRED"
      }
    }
  ],
  "data": null
}
```

## Rate Limiting

### Limits by User Type

```
Citizen Users:
  - Queries: 100 per minute
  - Mutations: 20 per minute
  - Subscriptions: 5 concurrent

Responders:
  - Queries: 200 per minute
  - Mutations: 50 per minute
  - Subscriptions: 10 concurrent

Hospital Admins:
  - Queries: 500 per minute
  - Mutations: 100 per minute
  - Subscriptions: 20 concurrent
```

## Examples & Usage

### Complete Emergency Flow Example

```javascript
// 1. User registration and login
const REGISTER_USER = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      errors
    }
  }
`;

const LOGIN_USER = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      accessToken
      refreshToken
      user {
        id
        phoneNumber
        userType
      }
    }
  }
`;

// 2. Create emergency incident
const CREATE_EMERGENCY = `
  mutation CreateIncident($input: CreateIncidentInput!) {
    createIncident(input: $input) {
      id
      incidentNumber
      status
      assignments {
        responder {
          fullName
          phoneNumber
        }
        estimatedTravelTime
      }
    }
  }
`;

// 3. Subscribe to real-time updates
const INCIDENT_UPDATES = `
  subscription IncidentUpdates($incidentId: ID!) {
    incidentUpdates(incidentId: $incidentId) {
      incident {
        status
        assignments {
          status
          responder {
            fullName
            currentLocation {
              latitude
              longitude
            }
          }
        }
      }
      updateType
      message
    }
  }
`;

// Usage example
async function emergencyFlow() {
  // Register user
  const registerResponse = await client.request(REGISTER_USER, {
    input: {
      phoneNumber: "+255700123456",
      userType: "CITIZEN",
      preferredLanguage: "SW",
      fullName: "John Doe",
      password: "securePassword123"
    }
  });

  // Login
  const loginResponse = await client.request(LOGIN_USER, {
    input: {
      phoneNumber: "+255700123456",
      password: "securePassword123"
    }
  });

  // Set authorization token
  client.setHeaders({
    Authorization: `Bearer ${loginResponse.login.accessToken}`
  });

  // Create emergency
  const incident = await client.request(CREATE_EMERGENCY, {
    input: {
      incidentType: "MEDICAL_EMERGENCY",
      location: {
        latitude: -6.7924,
        longitude: 39.2083,
        accuracy: 10
      },
      description: "Severe chest pain and difficulty breathing",
      symptoms: "Chest pain, shortness of breath, sweating",
      patientCount: 1,
      patientConscious: true,
      patientBreathing: true,
      ambulanceNeeded: true,
      addressDescription: "Near Kariakoo Market, Dar es Salaam"
    }
  });

  // Subscribe to updates
  const subscription = client.subscribe({
    query: INCIDENT_UPDATES,
    variables: { incidentId: incident.createIncident.id }
  });
  
  subscription.subscribe({
    next: (data) => {
      console.log('Incident update:', data.incidentUpdates);
      // Handle real-time updates in UI
    },
    error: (err) => console.error('Subscription error:', err),
  });
}
```

This comprehensive GraphQL API documentation provides developers with all necessary information to integrate with the AfyaPapo emergency response system, covering authentication, queries, mutations, subscriptions, and real-time capabilities.
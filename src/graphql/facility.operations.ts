import { gql } from '@apollo/client';

export const GET_FACILITY_DASHBOARD = gql`
  query GetFacilityDashboard($facilityId: ID!) {
    hospital(id: $facilityId) {
      id
      name
      facilityType {
        name
        category
      }
      registrationNumber
      region {
        name
        code
      }
      district {
        name
        code
      }
      location {
        latitude
        longitude
        address
      }
      phoneNumber
      emergencyPhone
      email
      bedCapacity
      emergencyBeds
      icuBeds
      currentOccupancy
      occupancyRate
      acceptsEmergencies
      hasEmergencyRoom
      hasSurgery
      hasICU
      hasMaternity
      bedManagement {
        id
        bedNumber
        bedType
        status
        hasOxygen
        hasVentilator
        hasMonitoring
        patientAge
        admissionType
        estimatedDischarge
        updatedAt
      }
      departments {
        id
        name
        acceptsEmergencies
        currentCaseload
        availableStaff
        headOfDepartment {
          id
          profile {
            fullName
          }
        }
      }
      ambulanceFleet {
        id
        unitNumber
        make
        model
        year
        licensePlate
        equipmentLevel
        patientCapacity
        medicalEquipment
        status
        currentLocation {
          latitude
          longitude
        }
        lastLocationUpdate
        lastInspection
        nextMaintenance
        insuranceExpiry
        isOperational
        totalDispatches
        totalTransports
        averageResponseTimeMinutes
      }
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BED_STATUS = gql`
  mutation UpdateBedStatus($input: UpdateBedStatusInput!) {
    updateBedStatus(input: $input) {
      id
      bedNumber
      bedType
      status
      hasOxygen
      hasVentilator
      hasMonitoring
      patientAge
      admissionType
      estimatedDischarge
      updatedAt
    }
  }
`;

export const DISPATCH_AMBULANCE = gql`
  mutation DispatchAmbulance($input: DispatchAmbulanceInput!) {
    dispatchAmbulance(input: $input) {
      id
      status
      priority
      dispatchLocation {
        latitude
        longitude
      }
      estimatedArrival
      dispatchInstructions
      ambulance {
        id
        unitNumber
        equipmentLevel
        currentLocation {
          latitude
          longitude
        }
      }
      incident {
        id
        incidentNumber
        location {
          latitude
          longitude
        }
        description
      }
      dispatchedAt
    }
  }
`;

export const UPDATE_RESOURCE_QUANTITY = gql`
  mutation UpdateResourceQuantity($input: UpdateResourceQuantityInput!) {
    updateResourceQuantity(input: $input) {
      id
      name
      category
      currentQuantity
      minimumQuantity
      unit
      expirationDate
      status
      lastUpdated
    }
  }
`;

export const GET_NEARBY_HOSPITALS = gql`
  query GetNearbyHospitals($location: LocationInput!, $radius: Float) {
    nearbyHospitals(location: $location, radius: $radius) {
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
      acceptsEmergencies
      emergencyBeds
      currentOccupancy
      phoneNumber
      emergencyPhone
    }
  }
`;

export const GET_AVAILABLE_AMBULANCES = gql`
  query GetAvailableAmbulances($facilityId: ID!) {
    ambulances(filters: { facilityId: $facilityId, status: AVAILABLE }) {
      id
      unitNumber
      make
      model
      year
      equipmentLevel
      patientCapacity
      medicalEquipment
      status
      currentLocation {
        latitude
        longitude
      }
      lastLocationUpdate
      isOperational
    }
  }
`;

export const GET_FACILITY_ANALYTICS = gql`
  query GetFacilityAnalytics($facilityId: ID!, $dateRange: DateRangeInput) {
    facilityAnalytics(facilityId: $facilityId, dateRange: $dateRange) {
      occupancyRate
      averageResponseTime
      totalIncidents
      resolvedIncidents
      bedUtilization {
        bedType
        totalBeds
        occupiedBeds
        utilizationRate
      }
      ambulanceUtilization {
        totalAmbulances
        availableAmbulances
        dispatchedAmbulances
        utilizationRate
      }
      incidentTrends {
        date
        count
        severity
      }
    }
  }
`;
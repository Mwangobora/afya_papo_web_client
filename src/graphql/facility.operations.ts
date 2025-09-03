import { gql } from "@apollo/client";

export const GET_FACILITY_DASHBOARD = gql`
  query GetFacilityDashboard($facilityId: ID!) {
    facility(id: $facilityId) {
      id
      name
      facilityType
      bedCapacity
      emergencyBeds
      icuBeds
      currentOccupancy
      occupancyRate
      status
      departments {
        id
        name
        acceptsEmergencies
        currentCaseload
        availableStaff
      }
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
      ambulanceFleet {
        id
        unitNumber
        status
        equipmentLevel
        currentLocation {
          latitude
          longitude
        }
        currentDispatch {
          incident {
            incidentNumber
          }
          eta
          status
        }
        isOperational
      }
      inventory(critical: true) {
        id
        name
        category
        currentQuantity
        minimumQuantity
        status
      }
      lastUpdated
    }
  }
`;

export const UPDATE_INCIDENT_STATUS = gql`
  mutation UpdateIncidentStatus($input: UpdateIncidentStatusInput!) {
    updateIncidentStatus(input: $input) {
      incident {
        id
        status
        updatedAt
      }
      success
      errors
    }
  }
`;

export const GET_FACILITY_ANALYTICS = gql`
  query GetFacilityAnalytics($facilityId: ID!, $dateRange: DateRangeInput) {
    facilityAnalytics(facilityId: $facilityId, dateRange: $dateRange) {
      totalIncidents
      resolvedIncidents
      averageResponseTime
      bedUtilization {
        total
        occupied
        available
        rate
      }
      ambulanceUtilization {
        total
        active
        available
        rate
      }
      departmentMetrics {
        departmentId
        name
        caseload
        averageWaitTime
      }
    }
  }
`;

export const GET_NEARBY_FACILITIES = gql`
  query GetNearbyFacilities($location: LocationInput!, $radius: Float!, $facilityType: FacilityType) {
    nearbyFacilities(location: $location, radius: $radius, facilityType: $facilityType) {
      id
      name
      facilityType
      location {
        latitude
        longitude
        address
      }
      contactInfo {
        phone
        emergencyPhone
      }
      currentOccupancy
      occupancyRate
      acceptsEmergencies: status
      distance
    }
  }
`;

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


import { gql } from "@apollo/client";

export const GET_FACILITY_DASHBOARD = gql`
  query GetFacilityDashboard($facilityId: ID!) {
    facility(id: $facilityId) {
      id
      name
      facilityType
      region
      district
      location {
        latitude
        longitude
        address
        region
        district
      }
      contactInfo {
        phone
        email
        emergencyPhone
      }
      bedCapacity
      emergencyBeds
      icuBeds
      currentOccupancy
      occupancyRate
      status
      isOperational
      lastUpdated
      departments {
        id
        name
        acceptsEmergencies
        currentCaseload
        availableStaff
        headOfDepartment {
          id
          fullName
        }
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
        make
        model
        year
        currentLocation {
          latitude
          longitude
        }
        currentDispatch {
          id
          incident {
            id
            incidentNumber
          }
          eta
          status
          dispatchedAt
        }
        currentCrew {
          id
          responder {
            id
            fullName
            responderType
          }
          role
          isActive
        }
        isOperational
        lastMaintenance
      }
      inventory {
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
  }
`;

export const UPDATE_BED_STATUS = gql`
  mutation UpdateBedStatus($input: UpdateBedStatusInput!) {
    updateBedStatus(input: $input) {
      success
      bed {
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
      errors {
        field
        message
        code
      }
    }
  }
`;

export const DISPATCH_AMBULANCE = gql`
  mutation DispatchAmbulance($input: DispatchAmbulanceInput!) {
    dispatchAmbulance(input: $input) {
      success
      dispatch {
        id
        incident {
          id
          incidentNumber
          severity
        }
        ambulance {
          id
          unitNumber
          equipmentLevel
        }
        eta
        status
        dispatchedAt
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const UPDATE_RESOURCE_QUANTITY = gql`
  mutation UpdateResourceQuantity($input: UpdateResourceQuantityInput!) {
    updateResourceQuantity(input: $input) {
      success
      resource {
        id
        name
        category
        currentQuantity
        minimumQuantity
        unit
        status
        lastUpdated
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

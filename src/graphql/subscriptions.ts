import { gql } from "@apollo/client";

export const FACILITY_UPDATES = gql`
  subscription FacilityUpdates($facilityId: ID!) {
    facilityUpdates(facilityId: $facilityId) {
      facility {
        id
        currentOccupancy
        occupancyRate
        bedManagement {
          id
          bedNumber
          status
          updatedAt
        }
        ambulanceFleet {
          id
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
`;

export const INCIDENT_UPDATES = gql`
  subscription IncidentUpdates($facilityId: ID!) {
    incidentUpdates(facilityId: $facilityId) {
      incident {
        id
        incidentNumber
        severity
        status
        estimatedArrival
        assignments {
          id
          status
        }
      }
      updateType
      timestamp
    }
  }
`;

export const INCOMING_PATIENT_ALERTS = gql`
  subscription IncomingPatientAlerts($facilityId: ID!) {
    incomingPatients(facilityId: $facilityId) {
      alert {
        urgency
        message
        estimatedArrival
      }
      incident {
        id
        incidentNumber
        severity
        incidentType
        patientCount
        patientAge
        symptoms
      }
      timestamp
    }
  }
`;
export const BED_STATUS = gql`
  mutation UpdateBedStatus($input: UpdateBedStatusInput!) {
    updateBedStatus(input: $input) {
      bed {
        id
        bedNumber
        status
        patientAge
        admissionType
        estimatedDischarge
        updatedAt
      }
      success
      errors
    }
  }
`;

export const DISPATCH_AMBULANCE = gql`
  mutation DispatchAmbulance($input: DispatchAmbulanceInput!) {
    dispatchAmbulance(input: $input) {
      dispatch {
        id
        incident {
          incidentNumber
        }
        ambulance {
          unitNumber
        }
        eta
        status
        dispatchedAt
      }
      success
      errors
    }
  }
`;

export const UPDATE_RESOURCE_QUANTITY = gql`
  mutation UpdateResourceQuantity($input: UpdateResourceQuantityInput!) {
    updateResourceQuantity(input: $input) {
      resource {
        id
        name
        currentQuantity
        status
        lastUpdated
      }
      success
      errors
    }
  }
`;
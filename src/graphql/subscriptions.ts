import { gql } from "@apollo/client";


export const FACILITY_UPDATES = gql`
  subscription FacilityUpdates($facilityId: ID!) {
    facilityUpdates(facilityId: $facilityId) {
      updateType
      timestamp
      facility {
        id
        currentOccupancy
        occupancyRate
        lastUpdated
        bedManagement {
          id
          bedNumber
          bedType
          status
          patientAge
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
          currentDispatch {
            eta
            status
          }
        }
      }
    }
  }
`;

export const INCIDENT_UPDATES = gql`
  subscription IncidentUpdates($facilityId: ID!) {
    incidentUpdates(facilityId: $facilityId) {
      updateType
      timestamp
      incident {
        id
        incidentNumber
        severity
        status
        estimatedArrival
        patientCount
        assignments {
          id
          status
          responder {
            id
            fullName
          }
        }
        dispatchedAmbulances {
          id
          unitNumber
          status
        }
      }
    }
  }
`;

export const INCOMING_PATIENT_ALERTS = gql`
  subscription IncomingPatientAlerts($facilityId: ID!) {
    incomingPatients(facilityId: $facilityId) {
      timestamp
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
        location {
          latitude
          longitude
          address
        }
        assignments {
          responder {
            fullName
            responderType
          }
          status
        }
        dispatchedAmbulances {
          unitNumber
          equipmentLevel
        }
      }
    }
  }
`;

export const BED_UPDATES = gql`
  subscription BedUpdates($facilityId: ID!) {
    bedUpdates(facilityId: $facilityId) {
      updateType
      timestamp
      bed {
        id
        bedNumber
        bedType
        status
        patientAge
        admissionType
        estimatedDischarge
        updatedAt
      }
    }
  }
`;

export const AMBULANCE_UPDATES = gql`
  subscription AmbulanceUpdates($facilityId: ID!) {
    ambulanceUpdates(facilityId: $facilityId) {
      updateType
      timestamp
      ambulance {
        id
        unitNumber
        status
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
      }
    }
  }
`;
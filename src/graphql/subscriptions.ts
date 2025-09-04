import { gql } from '@apollo/client';

export const INCIDENT_UPDATES = gql`
  subscription IncidentUpdates($incidentId: ID!) {
    incidentUpdates(incidentId: $incidentId) {
      incident {
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
          status
          responder {
            profile {
              fullName
            }
            emergencyResponderProfile {
              responderType
              currentLocation {
                latitude
                longitude
              }
            }
          }
          estimatedTravelTime
        }
        timeline {
          eventType
          description
          timestamp
          updatedBy {
            profile {
              fullName
            }
          }
        }
      }
      updateType
      message
      timestamp
    }
  }
`;

export const FACILITY_UPDATES = gql`
  subscription FacilityUpdates($facilityId: ID!) {
    facilityUpdates(facilityId: $facilityId) {
      facility {
        id
        name
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

export const ASSIGNMENT_NOTIFICATIONS = gql`
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
`;

export const EMERGENCY_ALERTS = gql`
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
`;

export const BED_UPDATES = gql`
  subscription BedUpdates($facilityId: ID!) {
    bedUpdates(facilityId: $facilityId) {
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
      updateType
      timestamp
    }
  }
`;

export const AMBULANCE_UPDATES = gql`
  subscription AmbulanceUpdates($facilityId: ID!) {
    ambulanceUpdates(facilityId: $facilityId) {
      ambulance {
        id
        unitNumber
        status
        currentLocation {
          latitude
          longitude
        }
        lastLocationUpdate
        isOperational
      }
      updateType
      timestamp
    }
  }
`;
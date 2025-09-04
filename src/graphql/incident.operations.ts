import { gql } from '@apollo/client';

export const GET_ACTIVE_INCIDENTS = gql`
  query GetActiveIncidents($facilityId: String, $filters: IncidentFiltersInput, $limit: Int, $offset: Int) {
    incidents(filters: $filters) {
      id
      incidentNumber
      reporter {
        id
        phoneNumber
        profile {
          fullName
        }
      }
      incidentType
      severity
      status
      location {
        latitude
        longitude
        accuracy
        address
      }
      description
      symptoms
      patientCount
      patientAge
      patientGender
      patientConscious
      patientBreathing
      ambulanceNeeded
      assignments {
        id
        status
        priority
        responder {
          id
          profile {
            fullName
          }
          emergencyResponderProfile {
            responderType
            fullName
          }
        }
        estimatedTravelTime
        responseDeadline
      }
      ambulanceAssignments {
        id
        status
        ambulance {
          id
          unitNumber
          equipmentLevel
        }
        estimatedArrival
      }
      timeline {
        id
        eventType
        description
        timestamp
        updatedBy {
          id
          profile {
            fullName
          }
        }
      }
      triage {
        id
        triageColor
        priorityScore
        assessmentNotes
        recommendedCareLevel
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_INCIDENT = gql`
  mutation CreateIncident($input: CreateIncidentInput!) {
    createIncident(input: $input) {
      id
      incidentNumber
      status
      severity
      location {
        latitude
        longitude
        accuracy
      }
      assignments {
        id
        responder {
          profile {
            fullName
          }
          emergencyResponderProfile {
            responderType
            phoneNumber
          }
        }
        estimatedTravelTime
      }
      triage {
        triageColor
        priorityScore
      }
    }
  }
`;

export const UPDATE_INCIDENT_STATUS = gql`
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
`;

export const GET_INCIDENT_DETAILS = gql`
  query GetIncidentDetails($id: ID!) {
    incident(id: $id) {
      id
      incidentNumber
      reporter {
        id
        phoneNumber
        profile {
          fullName
          bloodType
          medicalConditions
          allergies
        }
      }
      incidentType
      severity
      status
      location {
        latitude
        longitude
        accuracy
        address
      }
      description
      symptoms
      patientCount
      patientAge
      patientGender
      patientConscious
      patientBreathing
      ambulanceNeeded
      assignments {
        id
        status
        priority
        assignmentOrder
        assignedLocation {
          latitude
          longitude
        }
        incidentLocation {
          latitude
          longitude
        }
        estimatedDistance
        estimatedTravelTime
        notificationSentAt
        responseDeadline
        respondedAt
        departedAt
        arrivedAt
        completedAt
        actualTravelTime
        totalResponseTime
        assignmentNotes
        responderNotes
        declineReason
        responder {
          id
          profile {
            fullName
          }
          emergencyResponderProfile {
            responderType
            fullName
            licenseNumber
            primaryQualification
            yearsOfExperience
            specializations
            averageResponseTime
            averageRating
            currentLocation {
              latitude
              longitude
            }
          }
        }
      }
      ambulanceAssignments {
        id
        status
        priority
        dispatchLocation {
          latitude
          longitude
        }
        estimatedArrival
        actualArrival
        transportStarted
        hospitalArrival
        dispatchInstructions
        crewNotes
        responseTimeMinutes
        transportTimeMinutes
        ambulance {
          id
          unitNumber
          equipmentLevel
          patientCapacity
          medicalEquipment
          currentLocation {
            latitude
            longitude
          }
        }
      }
      timeline {
        id
        eventType
        description
        updatedBy {
          id
          profile {
            fullName
          }
        }
        updatedByRole
        location {
          latitude
          longitude
        }
        metadata
        timestamp
      }
      triage {
        id
        triageColor
        priorityScore
        airwayClear
        breathingAdequate
        circulationAdequate
        consciousnessLevel
        heartRate
        bloodPressure
        temperature
        assessmentNotes
        recommendedCareLevel
        assessedAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const ACCEPT_ASSIGNMENT = gql`
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
`;

export const DECLINE_ASSIGNMENT = gql`
  mutation DeclineAssignment($input: DeclineAssignmentInput!) {
    declineAssignment(input: $input) {
      id
      status
      declineReason
    }
  }
`;

export const UPDATE_RESPONDER_LOCATION = gql`
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
`;
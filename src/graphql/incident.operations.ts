import { gql } from '@apollo/client'

export const GET_ACTIVE_INCIDENTS = gql`
  query GetActiveIncidents($facilityId: ID!, $filters: IncidentFilters) {
    incidents(facilityId: $facilityId, filters: $filters) {
      data {
        id
        incidentNumber
        incidentType
        severity
        status
        location {
          latitude
          longitude
          address
        }
        patientCount
        patientAge
        symptoms
        estimatedArrival
        assignments {
          id
          responder {
            fullName
            responderType
          }
          role
          status
          assignedAt
        }
        dispatchedAmbulances {
          id
          unitNumber
          status
          equipmentLevel
        }
        destinationFacility {
          id
          name
        }
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;

export const CREATE_INCIDENT = gql`
  mutation CreateIncident($input: CreateIncidentInput!) {
    createIncident(input: $input) {
      incident {
        id
        incidentNumber
        incidentType
        severity
        status
        location {
          latitude
          longitude
          address
        }
        patientCount
        createdAt
      }
      success
      errors
    }
  }
`;


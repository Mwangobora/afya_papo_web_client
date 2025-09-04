import { gql } from "@apollo/client";

export const GET_ACTIVE_INCIDENTS = gql`
  query GetActiveIncidents(
    $facilityId: ID!
    $filters: IncidentFilters
    $limit: Int
    $offset: Int
  ) {
    incidents(
      facilityId: $facilityId
      filters: $filters
      limit: $limit
      offset: $offset
    ) {
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
          region
          district
        }
        patientCount
        patientAge
        symptoms
        estimatedArrival
        assignments {
          id
          responder {
            id
            fullName
            responderType
          }
          role
          status
          assignedAt
          arrivedAt
        }
        timeline {
          id
          eventType
          description
          timestamp
          createdBy {
            id
            fullName
          }
        }
        dispatchedAmbulances {
          id
          unitNumber
          status
          equipmentLevel
          currentLocation {
            latitude
            longitude
          }
        }
        destinationFacility {
          id
          name
          facilityType
        }
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
    }
  }
`;

export const CREATE_INCIDENT = gql`
  mutation CreateIncident($input: CreateIncidentInput!) {
    createIncident(input: $input) {
      success
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
        patientAge
        symptoms
        createdAt
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const UPDATE_INCIDENT_STATUS = gql`
  mutation UpdateIncidentStatus($input: UpdateIncidentStatusInput!) {
    updateIncidentStatus(input: $input) {
      success
      incident {
        id
        incidentNumber
        status
        updatedAt
        timeline {
          id
          eventType
          description
          timestamp
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

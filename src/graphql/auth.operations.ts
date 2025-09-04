import { gql } from '@apollo/client';

export const ADMIN_LOGIN = gql`
  mutation AdminLogin($input: AdminLoginInput!) {
    adminLogin(input: $input) {
      success
      user {
        id
        username
        email
        fullName
        userType
        isActive
        hospitalAdminProfile {
          id
          primaryFacility {
            id
            name
            facilityType
            region
            district
          }
          permissions {
            canManageBeds
            canManageStaff
            canManageResources
            canViewPatientData
            canGenerateReports
            canManageAmbulances
          }
          departmentAccess
          canManageFleet
          canViewAnalytics
        }
        emergencyResponderProfile {
          id
          responderType
          certificationLevel
          isOnDuty
          currentLocation {
            latitude
            longitude
          }
          assignedFacility {
            id
            name
          }
        }
      }
      accessToken
      refreshToken
      expiresAt
      errors
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      success
      accessToken
      refreshToken
      expiresAt
      errors
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
      fullName
      userType
      isActive
      createdAt
      updatedAt
      hospitalAdminProfile {
        id
        primaryFacility {
          id
          name
          facilityType
          region
          district
          location {
            latitude
            longitude
            address
          }
          contactInfo {
            phone
            email
            emergencyPhone
          }
        }
        permissions {
          canManageBeds
          canManageStaff
          canManageResources
          canViewPatientData
          canGenerateReports
          canManageAmbulances
        }
        departmentAccess
        canManageFleet
        canViewAnalytics
      }
      emergencyResponderProfile {
        id
        responderType
        certificationLevel
        isOnDuty
        currentLocation {
          latitude
          longitude
        }
        assignedFacility {
          id
          name
          facilityType
        }
      }
    }
  }
`;

import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      accessToken
      refreshToken
      user {
        id
        phoneNumber
        userType
        preferredLanguage
        verificationStatus
        isPhoneVerified
        profile {
          fullName
          nationalIdNumber
          dateOfBirth
          gender
          bloodType
          medicalConditions
          medications
          allergies
          healthInsuranceProvider
          healthInsuranceNumber
          region
          district
          address
        }
        emergencyContacts {
          id
          name
          phoneNumber
          relationship
          isPrimary
        }
        hospitalAdminProfile {
          id
          primaryFacility {
            id
            name
            facilityType {
              name
              category
            }
            region {
              name
              code
            }
            district {
              name
              code
            }
            location {
              latitude
              longitude
              address
            }
            phoneNumber
            emergencyPhone
            email
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
          fullName
          licenseNumber
          primaryQualification
          yearsOfExperience
          specializations
          primaryHospital {
            id
            name
            facilityType {
              name
              category
            }
          }
          affiliatedHospitals {
            id
            name
            facilityType {
              name
              category
            }
          }
          verificationStatus
          availabilityStatus
          currentLocation {
            latitude
            longitude
            accuracy
          }
          serviceRadius
          totalResponses
          successfulResponses
          averageResponseTime
          averageRating
        }
      }
      message
      errors
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      accessToken
      refreshToken
      user {
        id
        phoneNumber
        userType
        preferredLanguage
        verificationStatus
        isPhoneVerified
        profile {
          fullName
        }
      }
      message
      errors
    }
  }
`;

export const VERIFY_PHONE = gql`
  mutation VerifyPhone($input: VerifyPhoneInput!) {
    verifyPhone(input: $input) {
      success
      accessToken
      refreshToken
      user {
        id
        phoneNumber
        userType
        preferredLanguage
        verificationStatus
        isPhoneVerified
        profile {
          fullName
        }
      }
      message
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
      message
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
      phoneNumber
      userType
      preferredLanguage
      verificationStatus
      isPhoneVerified
      profile {
        fullName
        nationalIdNumber
        dateOfBirth
        gender
        bloodType
        medicalConditions
        medications
        allergies
        healthInsuranceProvider
        healthInsuranceNumber
        region
        district
        address
      }
      emergencyContacts {
        id
        name
        phoneNumber
        relationship
        isPrimary
      }
      hospitalAdminProfile {
        id
        primaryFacility {
          id
          name
          facilityType {
            name
            category
          }
          region {
            name
            code
          }
          district {
            name
            code
          }
          location {
            latitude
            longitude
            address
          }
          phoneNumber
          emergencyPhone
          email
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
        fullName
        licenseNumber
        primaryQualification
        yearsOfExperience
        specializations
        primaryHospital {
          id
          name
          facilityType {
            name
            category
          }
        }
        affiliatedHospitals {
          id
          name
          facilityType {
            name
            category
          }
        }
        verificationStatus
        availabilityStatus
        currentLocation {
          latitude
          longitude
          accuracy
        }
        serviceRadius
        totalResponses
        successfulResponses
        averageResponseTime
        averageRating
      }
      createdAt
      lastLogin
    }
  }
`;

import { apolloClient } from '../config/apollo.config';
import {
  GET_FACILITY_DASHBOARD,
  
} from '../graphql/facility.operations'
import type{
  Facility,
  BedManagement,
  Ambulance,
} from '../types/facility.types';
import type { Resource } from '../types/common.types';
import type { ApiResponse } from '../types/auth.types';

export class FacilityService {
  async getFacilityDashboard(facilityId: string): Promise<Facility | null> {
    try {
      const { data } = await apolloClient.query({
        query: GET_FACILITY_DASHBOARD,
        variables: { facilityId },
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      });

      return data?.facility || null;
    } catch (error) {
      console.error('Error fetching facility dashboard:', error);
      return null;
    }
  }

  async updateBedStatus(
    bedId: string,
    updates: Partial<BedManagement>
  ): Promise<ApiResponse<BedManagement>> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_BED_STATUS,
        variables: {
          input: {
            bedId,
            ...updates,
          },
        },
        errorPolicy: 'all',
      });

      const result = data?.updateBedStatus;

      return {
        success: result?.success || false,
        data: result?.bed,
        errors: result?.errors,
      };
    } catch (error) {
      console.error('Error updating bed status:', error);
      return {
        success: false,
        errors: [{ message: 'Failed to update bed status' }],
      };
    }
  }

  async dispatchAmbulance(
    ambulanceId: string,
    incidentId: string,
    priority: string = 'EMERGENCY'
  ): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DISPATCH_AMBULANCE,
        variables: {
          input: {
            ambulanceId,
            incidentId,
            priority,
          },
        },
        errorPolicy: 'all',
      });

      const result = data?.dispatchAmbulance;

      return {
        success: result?.success || false,
        data: result?.dispatch,
        errors: result?.errors,
      };
    } catch (error) {
      console.error('Error dispatching ambulance:', error);
      return {
        success: false,
        errors: [{ message: 'Failed to dispatch ambulance' }],
      };
    }
  }

  async updateResourceQuantity(
    resourceId: string,
    quantity: number
  ): Promise<ApiResponse<Resource>> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_RESOURCE_QUANTITY,
        variables: {
          input: {
            resourceId,
            quantity,
          },
        },
        errorPolicy: 'all',
      });

      const result = data?.updateResourceQuantity;

      return {
        success: result?.success || false,
        data: result?.resource,
        errors: result?.errors,
      };
    } catch (error) {
      console.error('Error updating resource quantity:', error);
      return {
        success: false,
        errors: [{ message: 'Failed to update resource quantity' }],
      };
    }
  }
}
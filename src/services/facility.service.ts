
import { apolloClient } from '../config/apollo.config';
import {
  GET_FACILITY_DASHBOARD,
  UPDATE_BED_STATUS,
  DISPATCH_AMBULANCE,
  UPDATE_RESOURCE_QUANTITY,
} from '../graphql/facility.operations';
import type {
  Facility,
  BedManagement,
  BedStatus,
  Resource,
  ApiResponse,
} from '../types/facility.types';
import { ErrorHandler } from '../utils/error.utils';

interface UpdateBedStatusInput {
  bedId: string;
  status?: BedStatus;
  patientAge?: number;
  admissionType?: string;
  estimatedDischarge?: string;
}

interface DispatchAmbulanceInput {
  ambulanceId: string;
  incidentId: string;
  priority?: string;
}

interface UpdateResourceInput {
  resourceId: string;
  quantity: number;
}

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
    input: UpdateBedStatusInput
  ): Promise<ApiResponse<BedManagement>> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_BED_STATUS,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.updateBedStatus;

      return {
        success: result?.success || false,
        data: result?.bed || null,
        errors: result?.errors || [],
      };
    } catch (error) {
      console.error('Error updating bed status:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: null,
        errors,
      };
    }
  }

  async dispatchAmbulance(
    input: DispatchAmbulanceInput
  ): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DISPATCH_AMBULANCE,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.dispatchAmbulance;

      return {
        success: result?.success || false,
        data: result?.dispatch || null,
        errors: result?.errors || [],
      };
    } catch (error) {
      console.error('Error dispatching ambulance:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: null,
        errors,
      };
    }
  }

  async updateResourceQuantity(
    input: UpdateResourceInput
  ): Promise<ApiResponse<Resource>> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_RESOURCE_QUANTITY,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.updateResourceQuantity;

      return {
        success: result?.success || false,
        data: result?.resource || null,
        errors: result?.errors || [],
      };
    } catch (error) {
      console.error('Error updating resource quantity:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: null,
        errors,
      };
    }
  }
}

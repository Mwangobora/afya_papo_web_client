
import { apolloClient } from '../config/apollo.config';
import {
  GET_FACILITY_DASHBOARD,
  GET_NEARBY_HOSPITALS,
  GET_AVAILABLE_AMBULANCES,
  GET_FACILITY_ANALYTICS,
  UPDATE_BED_STATUS,
  DISPATCH_AMBULANCE,
  UPDATE_RESOURCE_QUANTITY,
} from '../graphql/facility.operations';
import type { Facility, BedManagement, BedStatus } from '../types/facility.types';
import type { Resource } from '../types/common.types';
import type { ApiResponse } from '../types/auth.types';
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
      const { data } = await apolloClient.query<{ facility: Facility | null }>({
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
      const { data } = await apolloClient.mutate<{
        updateBedStatus: { success: boolean; bed?: BedManagement; errors?: string[] };
      }>({
        mutation: UPDATE_BED_STATUS,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.updateBedStatus;

      return {
        success: result?.success || false,
        data: result?.bed || undefined,
        errors: (result?.errors ?? []).map((e: any) =>
          typeof e === 'string' ? { message: e } : e
        ),
      };
    } catch (error) {
      console.error('Error updating bed status:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: undefined,
        errors,
      };
    }
  }

  async dispatchAmbulance(
    input: DispatchAmbulanceInput
  ): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate<{
        dispatchAmbulance: { success: boolean; dispatch?: any; errors?: string[] };
      }>({
        mutation: DISPATCH_AMBULANCE,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.dispatchAmbulance;

      return {
        success: result?.success || false,
        data: result?.dispatch || undefined,
        errors: (result?.errors ?? []).map((e: any) =>
          typeof e === 'string' ? { message: e } : e
        ),
      };
    } catch (error) {
      console.error('Error dispatching ambulance:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: undefined,
        errors,
      };
    }
  }

  async updateResourceQuantity(
    input: UpdateResourceInput
  ): Promise<ApiResponse<Resource>> {
    try {
      const { data } = await apolloClient.mutate<{
        updateResourceQuantity: { success: boolean; resource?: Resource; errors?: string[] };
      }>({
        mutation: UPDATE_RESOURCE_QUANTITY,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.updateResourceQuantity;

      return {
        success: result?.success || false,
        data: result?.resource || undefined,
        errors: (result?.errors ?? []).map((e: any) =>
          typeof e === 'string' ? { message: e } : e
        ),
      };
    } catch (error) {
      console.error('Error updating resource quantity:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: undefined,
        errors,
      };
    }
  }

  async getNearbyHospitals(
    location: { latitude: number; longitude: number },
    radius?: number
  ): Promise<Facility[]> {
    try {
      const { data } = await apolloClient.query<{ nearbyHospitals: Facility[] }>({
        query: GET_NEARBY_HOSPITALS,
        variables: { location, radius },
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      });

      return data?.nearbyHospitals || [];
    } catch (error) {
      console.error('Error fetching nearby hospitals:', error);
      return [];
    }
  }

  async getAvailableAmbulances(facilityId: string): Promise<any[]> {
    try {
      const { data } = await apolloClient.query<{ ambulances: any[] }>({
        query: GET_AVAILABLE_AMBULANCES,
        variables: { facilityId },
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      });

      return data?.ambulances || [];
    } catch (error) {
      console.error('Error fetching available ambulances:', error);
      return [];
    }
  }

  async getFacilityAnalytics(
    facilityId: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<any> {
    try {
      const { data } = await apolloClient.query<{ facilityAnalytics: any }>({
        query: GET_FACILITY_ANALYTICS,
        variables: { facilityId, dateRange },
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      });

      return data?.facilityAnalytics || null;
    } catch (error) {
      console.error('Error fetching facility analytics:', error);
      return null;
    }
  }
}

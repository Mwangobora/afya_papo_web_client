
import { apolloClient } from '../config/apollo.config';
import {
  GET_ACTIVE_INCIDENTS,
  GET_INCIDENT_DETAILS,
  CREATE_INCIDENT,
  UPDATE_INCIDENT_STATUS,
  ACCEPT_ASSIGNMENT,
  DECLINE_ASSIGNMENT,
  UPDATE_RESPONDER_LOCATION,
} from '../graphql/incident.operations';
import type {
  Incident,
  IncidentType,
  SeverityLevel,
  IncidentStatus,

} from '../types/incident.types';
import type { Location, ApiResponse, PaginatedResponse } from '../types';

import { ErrorHandler } from '../utils/error.utils';

interface IncidentFilters {
  status?: IncidentStatus[];
  severity?: SeverityLevel[];
  incidentType?: IncidentType[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

interface CreateIncidentInput {
  incidentType: IncidentType;
  location: Location;
  description: string;
  symptoms?: string;
  patientCount: number;
  patientAge?: number;
  patientGender?: string;
  patientConscious?: boolean;
  patientBreathing?: boolean;
  ambulanceNeeded: boolean;
  addressDescription?: string;
  specializedEquipmentNeeded?: string;
}

interface UpdateIncidentStatusInput {
  incidentId: string;
  status: IncidentStatus;
  notes?: string;
  location?: Location;
}

interface DeclineAssignmentInput {
  assignmentId: string;
  reason: string;
}

export class IncidentService {
  async getActiveIncidents(
    facilityId: string,
    filters?: IncidentFilters,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Incident>> {
    try {
      const { data } = await apolloClient.query<{ incidents: Incident[] }>({
        query: GET_ACTIVE_INCIDENTS,
        variables: {
          facilityId,
          filters,
          limit,
          offset,
        },
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      });

      const incidents = data?.incidents || [];

      return {
        data: incidents,
        totalCount: incidents.length,
        hasNextPage: false,
        hasPreviousPage: false,
        currentPage: 1,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error fetching active incidents:', error);
      return {
        data: [],
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        currentPage: 1,
        totalPages: 0,
      };
    }
  }

  async createIncident(input: CreateIncidentInput): Promise<ApiResponse<Incident>> {
    try {
      const { data } = await apolloClient.mutate<{
        createIncident: { success: boolean; incident?: Incident; errors?: string[] };
      }>({
        mutation: CREATE_INCIDENT,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.createIncident;

      return {
        success: result?.success || false,
        data: result?.incident || undefined,
        errors: (result?.errors ?? []).map((e: any) =>
          typeof e === 'string' ? { message: e } : e
        ),
      };
    } catch (error) {
      console.error('Error creating incident:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: undefined,
        errors,
      };
    }
  }

  async updateIncidentStatus(
    input: UpdateIncidentStatusInput
  ): Promise<ApiResponse<Incident>> {
    try {
      const { data } = await apolloClient.mutate<{
        updateIncidentStatus: { success: boolean; incident?: Incident; errors?: string[] };
      }>({
        mutation: UPDATE_INCIDENT_STATUS,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.updateIncidentStatus;

      return {
        success: result?.success || false,
        data: result?.incident || undefined,
        errors: (result?.errors ?? []).map((e: any) =>
          typeof e === 'string' ? { message: e } : e
        ),
      };
    } catch (error) {
      console.error('Error updating incident status:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: undefined,
        errors,
      };
    }
  }

  async getIncidentDetails(incidentId: string): Promise<Incident | null> {
    try {
      const { data } = await apolloClient.query<{ incident: Incident | null }>({
        query: GET_INCIDENT_DETAILS,
        variables: { id: incidentId },
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      });

      return data?.incident ?? null;
    } catch (error) {
      console.error('Error fetching incident details:', error);
      return null;
    }
  }

  async acceptAssignment(assignmentId: string): Promise<ApiResponse<unknown>> {
    try {
      const { data } = await apolloClient.mutate<{
        acceptAssignment: { success: boolean; errors?: string[] } & Record<string, unknown>;
      }>({
        mutation: ACCEPT_ASSIGNMENT,
        variables: { assignmentId },
        errorPolicy: 'all',
      });

      const result = data?.acceptAssignment;

      return {
        success: result?.success || false,
        data: result || null,
        errors: (result?.errors ?? []).map((e: any) =>
          typeof e === 'string' ? { message: e } : e
        ),
      };
    } catch (error) {
      console.error('Error accepting assignment:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: undefined,
        errors,
      };
    }
  }

  async declineAssignment(input: DeclineAssignmentInput): Promise<ApiResponse<unknown>> {
    try {
      const { data } = await apolloClient.mutate<{
        declineAssignment: { success: boolean; errors?: string[] } & Record<string, unknown>;
      }>({
        mutation: DECLINE_ASSIGNMENT,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.declineAssignment;

      return {
        success: result?.success || false,
        data: result || null,
        errors: (result?.errors ?? []).map((e: any) =>
          typeof e === 'string' ? { message: e } : e
        ),
      };
    } catch (error) {
      console.error('Error declining assignment:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: undefined,
        errors,
      };
    }
  }

  async updateResponderLocation(location: Location): Promise<ApiResponse<unknown>> {
    try {
      const { data } = await apolloClient.mutate<{
        updateResponderLocation: { success: boolean; errors?: string[] } & Record<string, unknown>;
      }>({
        mutation: UPDATE_RESPONDER_LOCATION,
        variables: { location },
        errorPolicy: 'all',
      });

      const result = data?.updateResponderLocation;

      return {
        success: result?.success || false,
        data: result || null,
        errors: (result?.errors ?? []).map((e: any) =>
          typeof e === 'string' ? { message: e } : e
        ),
      };
    } catch (error) {
      console.error('Error updating responder location:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: undefined,
        errors,
      };
    }
  }
}

import { apolloClient } from '../config/apollo.config';
import {
  GET_ACTIVE_INCIDENTS,
  CREATE_INCIDENT,
  UPDATE_INCIDENT_STATUS,
} from '../graphql/incident.operations';
import type {
  Incident,
  IncidentType,
  SeverityLevel,
  IncidentStatus,

} from '../types/incident.types';
import type { Location, ApiResponse, Resource, PaginatedResponse } from '../types';

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
  severity: SeverityLevel;
  location: Location;
  patientCount: number;
  patientAge?: number;
  symptoms?: string;
  description?: string;
}

interface UpdateIncidentStatusInput {
  incidentId: string;
  status: IncidentStatus;
  notes?: string;
}

export class IncidentService {
  async getActiveIncidents(
    facilityId: string,
    filters?: IncidentFilters,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Incident>> {
    try {
      const { data } = await apolloClient.query({
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

      const incidents = data?.incidents;

      if (!incidents) {
        return {
          data: [],
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          currentPage: 1,
          totalPages: 0,
        };
      }

      return {
        data: incidents.data || [],
        totalCount: incidents.totalCount || 0,
        hasNextPage: incidents.hasNextPage || false,
        hasPreviousPage: incidents.hasPreviousPage || false,
        currentPage: incidents.currentPage || 1,
        totalPages: incidents.totalPages || 0,
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
      const { data } = await apolloClient.mutate({
        mutation: CREATE_INCIDENT,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.createIncident;

      return {
        success: result?.success || false,
        data: result?.incident || null,
        errors: result?.errors || [],
      };
    } catch (error) {
      console.error('Error creating incident:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: null,
        errors,
      };
    }
  }

  async updateIncidentStatus(
    input: UpdateIncidentStatusInput
  ): Promise<ApiResponse<Incident>> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_INCIDENT_STATUS,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.updateIncidentStatus;

      return {
        success: result?.success || false,
        data: result?.incident || null,
        errors: result?.errors || [],
      };
    } catch (error) {
      console.error('Error updating incident status:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        data: null,
        errors,
      };
    }
  }
}
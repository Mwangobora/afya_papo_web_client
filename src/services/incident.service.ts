// src/services/incident.service.ts
import { apolloClient } from '../config/apollo.config';
import {
  GET_ACTIVE_INCIDENTS,
  CREATE_INCIDENT,
} from '../graphql/incident.operations';
import { UPDATE_INCIDENT_STATUS } from '../graphql/facility.operations';

import type { PaginatedResponse, ApiResponse } from '../types/auth.types';
import type {
  Incident,
  IncidentType,
  SeverityLevel,
  IncidentStatus,
} from '../types/incident.types';
import type { Location } from '../types/common.types';

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

      return {
        data: incidents?.data || [],
        totalCount: incidents?.totalCount || 0,
        hasNextPage: incidents?.hasNextPage || false,
        hasPreviousPage: offset > 0,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil((incidents?.totalCount || 0) / limit),
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
        data: result?.incident,
        errors: result?.errors,
      };
    } catch (error) {
      console.error('Error creating incident:', error);
      return {
        success: false,
        errors: [{ message: 'Failed to create incident' }],
      };
    }
  }

  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    notes?: string
  ): Promise<ApiResponse<Incident>> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_INCIDENT_STATUS,
        variables: {
          input: {
            incidentId,
            status,
            notes,
          },
        },
        errorPolicy: 'all',
      });

      const result = data?.updateIncidentStatus;

      return {
        success: result?.success || false,
        data: result?.incident,
        errors: result?.errors,
      };
    } catch (error) {
      console.error('Error updating incident status:', error);
      return {
        success: false,
        errors: [{ message: 'Failed to update incident status' }],
      };
    }
  }

  async getIncidentById(incidentId: string): Promise<Incident | null> {
    try {
      const { data } = await apolloClient.query({
        query: GET_ACTIVE_INCIDENTS,
        variables: {
          filters: { id: incidentId },
        },
        errorPolicy: 'all',
        fetchPolicy: 'network-only',
      });

      const incidents = data?.incidents?.data;
      return incidents?.[0] || null;
    } catch (error) {
      console.error('Error fetching incident by ID:', error);
      return null;
    }
  }

  async getIncidentsByStatus(
    facilityId: string,
    status: IncidentStatus[]
  ): Promise<Incident[]> {
    try {
      const response = await this.getActiveIncidents(facilityId, { status });
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents by status:', error);
      return [];
    }
  }

  async searchIncidents(
    facilityId: string,
    searchTerm: string,
    filters?: IncidentFilters
  ): Promise<Incident[]> {
    try {
      const response = await this.getActiveIncidents(facilityId, {
        ...filters,
        // Add search functionality when backend supports it
      });
      
      // Client-side filtering for now
      return response.data.filter(incident =>
        incident.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching incidents:', error);
      return [];
    }
  }
}
import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from '@apollo/client/react';
import { IncidentService } from '../services/incident.service';
import { INCIDENT_UPDATES } from '../graphql/subscriptions';
import type { 
  Incident, 
  IncidentType, 
  SeverityLevel, 
  IncidentStatus,
  Location,
  PaginatedResponse 
} from '../types';

interface IncidentFilters {
  status?: IncidentStatus[];
  severity?: SeverityLevel[];
  incidentType?: IncidentType[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export const useIncidents = (facilityId?: string, filters?: IncidentFilters) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    currentPage: 1,
    totalPages: 0,
  });

  const incidentService = new IncidentService();

  // Real-time incident updates
  useSubscription(INCIDENT_UPDATES, {
    variables: { incidentId: facilityId }, // This should be dynamic based on selected incident
    skip: !facilityId,
    onData: ({ data }) => {
      const update = data.data?.incidentUpdates;
      if (update && update.incident) {
        setIncidents(prevIncidents => {
          const existingIndex = prevIncidents.findIndex(inc => inc.id === update.incident.id);
          if (existingIndex >= 0) {
            // Update existing incident
            const updated = [...prevIncidents];
            updated[existingIndex] = { ...updated[existingIndex], ...update.incident };
            return updated;
          } else {
            // Add new incident
            return [update.incident, ...prevIncidents];
          }
        });
      }
    },
    onError: (error) => {
      console.error('Incident subscription error:', error);
    },
  });

  const fetchIncidents = useCallback(async (
    limit: number = 20,
    offset: number = 0
  ) => {
    if (!facilityId) {
      setError('No facility ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await incidentService.getActiveIncidents(
        facilityId,
        filters,
        limit,
        offset
      );

      setIncidents(result.data);
      setPagination({
        totalCount: result.totalCount,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [facilityId, filters]);

  const createIncident = useCallback(async (input: {
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
  }) => {
    try {
      const result = await incidentService.createIncident(input);
      
      if (result.success && result.data) {
        // Add new incident to the list
        setIncidents(prev => [result.data!, ...prev]);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating incident:', error);
      return { success: false, errors: [{ message: 'Failed to create incident' }] };
    }
  }, []);

  const updateIncidentStatus = useCallback(async (
    incidentId: string,
    status: IncidentStatus,
    notes?: string,
    location?: Location
  ) => {
    try {
      const result = await incidentService.updateIncidentStatus({
        incidentId,
        status,
        notes,
        location,
      });
      
      if (result.success && result.data) {
        // Update incident in the list
        setIncidents(prev => 
          prev.map(inc => 
            inc.id === incidentId ? { ...inc, ...result.data } : inc
          )
        );
      }
      
      return result;
    } catch (error) {
      console.error('Error updating incident status:', error);
      return { success: false, errors: [{ message: 'Failed to update incident status' }] };
    }
  }, []);

  const getIncidentDetails = useCallback(async (incidentId: string) => {
    try {
      return await incidentService.getIncidentDetails(incidentId);
    } catch (error) {
      console.error('Error fetching incident details:', error);
      return null;
    }
  }, []);

  const acceptAssignment = useCallback(async (assignmentId: string) => {
    try {
      return await incidentService.acceptAssignment(assignmentId);
    } catch (error) {
      console.error('Error accepting assignment:', error);
      return { success: false, errors: [{ message: 'Failed to accept assignment' }] };
    }
  }, []);

  const declineAssignment = useCallback(async (assignmentId: string, reason: string) => {
    try {
      return await incidentService.declineAssignment({ assignmentId, reason });
    } catch (error) {
      console.error('Error declining assignment:', error);
      return { success: false, errors: [{ message: 'Failed to decline assignment' }] };
    }
  }, []);

  const updateResponderLocation = useCallback(async (location: Location) => {
    try {
      return await incidentService.updateResponderLocation(location);
    } catch (error) {
      console.error('Error updating responder location:', error);
      return { success: false, errors: [{ message: 'Failed to update location' }] };
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    pagination,
    refetch: fetchIncidents,
    createIncident,
    updateIncidentStatus,
    getIncidentDetails,
    acceptAssignment,
    declineAssignment,
    updateResponderLocation,
  };
};
// src/hooks/useIncidents.ts
import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from '@apollo/client/react';
import { IncidentService } from '../services/incident.service';
import { INCIDENT_UPDATES } from '../graphql/subscriptions';
import type  { Incident, IncidentStatus, SeverityLevel} from '../types/incident.types';

interface UseIncidentsOptions {
  facilityId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface IncidentFilters {
  status?: IncidentStatus[];
  severity?: SeverityLevel[];
  searchQuery?: string;
}

export const useIncidents = ({ 
  facilityId, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: UseIncidentsOptions) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalCount: 0,
    hasNextPage: false,
  });

  const incidentService = new IncidentService();

  // Real-time incident updates
  useSubscription(INCIDENT_UPDATES, {
    variables: { facilityId },
    skip: !facilityId,
    onData: ({ data }) => {
      const update = data.data?.incidentUpdates;
      if (update) {
        handleIncidentUpdate(update);
      }
    },
    onError: (error) => {
      console.error('Incident subscription error:', error);
    },
  });

  const fetchIncidents = useCallback(async (page: number = 1, limit: number = 20) => {
    if (!facilityId) return;

    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * limit;
      const result = await incidentService.getActiveIncidents(
        facilityId,
        filters,
        limit,
        offset
      );

      setIncidents(result.data);
      setPagination({
        currentPage: result.currentPage,
        totalCount: result.totalCount,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  }, [facilityId, filters]);

  const handleIncidentUpdate = useCallback((update: any) => {
    const { incident, updateType } = update;

    setIncidents(prevIncidents => {
      switch (updateType) {
        case 'CREATED':
          return [incident, ...prevIncidents];
        
        case 'UPDATED':
          return prevIncidents.map(inc => 
            inc.id === incident.id ? { ...inc, ...incident } : inc
          );
        
        case 'DELETED':
          return prevIncidents.filter(inc => inc.id !== incident.id);
        
        default:
          return prevIncidents;
      }
    });
  }, []);

  const updateIncidentStatus = useCallback(async (
    incidentId: string, 
    status: IncidentStatus, 
    notes?: string
  ) => {
    try {
      const result = await incidentService.updateIncidentStatus(incidentId, status, notes);
      
      if (result.success && result.data) {
        setIncidents(prev => 
          prev.map(incident => 
            incident.id === incidentId ? { ...incident, ...result.data } : incident
          )
        );
      }
      
      return result;
    } catch (error) {
      console.error('Error updating incident status:', error);
      return { success: false, errors: [{ message: 'Failed to update incident status' }] };
    }
  }, []);

  const applyFilters = useCallback((newFilters: IncidentFilters) => {
    setFilters(newFilters);
    fetchIncidents(1); // Reset to first page when filtering
  }, [fetchIncidents]);

  // Auto-refresh incidents
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchIncidents(pagination.currentPage);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchIncidents, pagination.currentPage]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    pagination,
    fetchIncidents,
    updateIncidentStatus,
    applyFilters,
    refetch: () => fetchIncidents(pagination.currentPage),
  };
};



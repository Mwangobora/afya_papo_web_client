import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from '@apollo/client/react';
import { FacilityService } from '../services/facility.service';
import { FACILITY_UPDATES } from '../graphql/subscriptions';
import type { Facility, BedManagement } from '../types/facility.types';
import { useAuth } from '../contexts/AuthContext';

export const useFacility = (facilityId?: string) => {
  const { user } = useAuth();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const facilityService = new FacilityService();
  const targetFacilityId = facilityId || user?.hospitalAdminProfile?.primaryFacility?.id;

  // Real-time facility updates
  useSubscription(FACILITY_UPDATES, {
    variables: { facilityId: targetFacilityId },
    skip: !targetFacilityId,
    onData: ({ data }) => {
      const update = data.data?.facilityUpdates;
      if (update && facility) {
        setFacility(prevFacility => ({
          ...prevFacility!,
          ...update.facility,
        }));
      }
    },
    onError: (error) => {
      console.error('Facility subscription error:', error);
    },
  });

  const fetchFacility = useCallback(async () => {
    if (!targetFacilityId) {
      setError('No facility ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const facilityData = await facilityService.getFacilityDashboard(targetFacilityId);

      if (facilityData) {
        setFacility(facilityData);
      } else {
        setError('Failed to load facility data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [targetFacilityId]);

  const updateBedStatus = useCallback(
    async (bedId: string, updates: Partial<BedManagement>) => {
      try {
        const result = await facilityService.updateBedStatus(bedId, updates);
        
        if (result.success && result.data) {
          // Optimistically update local state
          setFacility(prev => {
            if (!prev) return prev;
            
            return {
              ...prev,
              bedManagement: prev.bedManagement.map(bed =>
                bed.id === bedId ? { ...bed, ...result.data } : bed
              ),
            };
          });
        }
        
        return result;
      } catch (error) {
        console.error('Error updating bed status:', error);
        return { success: false, errors: [{ message: 'Failed to update bed status' }] };
      }
    },
    []
  );

  const updateResourceQuantity = useCallback(
    async (resourceId: string, quantity: number) => {
      try {
        const result = await facilityService.updateResourceQuantity(resourceId, quantity);
        
        if (result.success && result.data) {
          setFacility(prev => {
            if (!prev) return prev;
            
            return {
              ...prev,
              inventory: prev.inventory.map(resource =>
                resource.id === resourceId ? { ...resource, ...result.data } : resource
              ),
            };
          });
        }
        
        return result;
      } catch (error) {
        console.error('Error updating resource quantity:', error);
        return { success: false, errors: [{ message: 'Failed to update resource quantity' }] };
      }
    },
    []
  );

  useEffect(() => {
    fetchFacility();
  }, [fetchFacility]);

  return {
    facility,
    loading,
    error,
    refetch: fetchFacility,
    updateBedStatus,
    updateResourceQuantity,
  };
};

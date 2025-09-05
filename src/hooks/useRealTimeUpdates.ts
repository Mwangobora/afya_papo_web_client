import { useEffect, useCallback } from 'react';
import { useSubscription } from '@apollo/client/react';
import {
  FACILITY_UPDATES,
  INCIDENT_UPDATES,
} from '../graphql/subscriptions';
import type { FacilityUpdate, IncidentUpdate } from '../types/common.types';

interface UseRealTimeUpdatesOptions {
  facilityId: string;
  incidentId?: string;
  onFacilityUpdate?: (update: FacilityUpdate) => void;
  onIncidentUpdate?: (update: IncidentUpdate) => void;
  onPatientAlert?: (alert: any) => void;
}

export const useRealTimeUpdates = ({
  facilityId,
  incidentId,
  onFacilityUpdate,    
  onIncidentUpdate,
  onPatientAlert,
}: UseRealTimeUpdatesOptions) => {
  
  // Facility updates subscription
  type FacilityUpdatesResponse = { facilityUpdates: FacilityUpdate };
  const { data: facilityData } = useSubscription<FacilityUpdatesResponse, { facilityId: string }>(FACILITY_UPDATES, {
    variables: { facilityId },
    skip: !facilityId,
  });

  // Incident updates subscription
  type IncidentUpdatesResponse = { incidentUpdates: IncidentUpdate };
  const { data: incidentData } = useSubscription<IncidentUpdatesResponse, { incidentId: string }>(INCIDENT_UPDATES, {
    variables: incidentId ? { incidentId } : (undefined as unknown as { incidentId: string }),
    skip: !incidentId,
  });

  const handleFacilityUpdate = useCallback((update: FacilityUpdate) => {
    onFacilityUpdate?.(update);
  }, [onFacilityUpdate]);

  const handleIncidentUpdate = useCallback((update: IncidentUpdate) => {
    onIncidentUpdate?.(update);
  }, [onIncidentUpdate]);

  const handlePatientAlert = useCallback((alert: any) => {
    onPatientAlert?.(alert);
  }, [onPatientAlert]);

  useEffect(() => {
    if (facilityData?.facilityUpdates) {
      handleFacilityUpdate(facilityData.facilityUpdates);
    }
  }, [facilityData, handleFacilityUpdate]);

  useEffect(() => {
    if (incidentData?.incidentUpdates) {
      handleIncidentUpdate(incidentData.incidentUpdates);
    }
  }, [incidentData, handleIncidentUpdate]);

  return {
    facilityUpdate: facilityData?.facilityUpdates,
    incidentUpdate: incidentData?.incidentUpdates,
    patientAlert: undefined,
  };
};
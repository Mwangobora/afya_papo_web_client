import { useEffect, useCallback } from 'react';
import { useSubscription } from '@apollo/client/react';
import {
  FACILITY_UPDATES,
  INCIDENT_UPDATES,
  INCOMING_PATIENT_ALERTS,
} from '../graphql/subscriptions';
import type{ FacilityUpdate, IncidentUpdate } from '../types/common.types';

interface UseRealTimeUpdatesOptions {
  facilityId: string;
  onFacilityUpdate?: (update: FacilityUpdate) => void;
  onIncidentUpdate?: (update: IncidentUpdate) => void;
  onPatientAlert?: (alert: any) => void;
}

export const useRealTimeUpdates = ({
  facilityId,
  onFacilityUpdate,    
  onIncidentUpdate,
  onPatientAlert,
}: UseRealTimeUpdatesOptions) => {
  
  // Facility updates subscription
  const { data: facilityData } = useSubscription(FACILITY_UPDATES, {
    variables: { facilityId },
    skip: !facilityId,
  });

  // Incident updates subscription
  const { data: incidentData } = useSubscription(INCIDENT_UPDATES, {
    variables: { facilityId },
    skip: !facilityId,
  });

  // Patient alerts subscription
  const { data: patientAlertData } = useSubscription(INCOMING_PATIENT_ALERTS, {
    variables: { facilityId },
    skip: !facilityId,
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

  useEffect(() => {
    if (patientAlertData?.incomingPatients) {
      handlePatientAlert(patientAlertData.incomingPatients);
    }
  }, [patientAlertData, handlePatientAlert]);

  return {
    facilityUpdate: facilityData?.facilityUpdates,
    incidentUpdate: incidentData?.incidentUpdates,
    patientAlert: patientAlertData?.incomingPatients,
  };
};
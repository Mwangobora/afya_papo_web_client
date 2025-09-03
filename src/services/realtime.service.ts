import { apolloClient } from '../config/apollo.config';
import {
  FACILITY_UPDATES,
  INCIDENT_UPDATES,
  INCOMING_PATIENT_ALERTS,
} from '../graphql/subscriptions';
import type { 
  FacilityUpdate, 
  IncidentUpdate, 
  SubscriptionData 
} from '../types/common.types';

export class RealTimeService {
  private subscriptions: Map<string, any> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  subscribeToFacilityUpdates(
    facilityId: string,
    callback: (update: FacilityUpdate) => void
  ): () => void {
    const subscriptionKey = `facility_${facilityId}`;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      const subscription = apolloClient.subscribe({
        query: FACILITY_UPDATES,
        variables: { facilityId },
      });

      this.subscriptions.set(subscriptionKey, subscription);
      this.listeners.set(subscriptionKey, new Set());

      subscription.subscribe({
        next: (result) => {
          const listeners = this.listeners.get(subscriptionKey);
          if (listeners) {
            listeners.forEach(listener => listener(result.data?.facilityUpdates));
          }
        },
        error: (error) => {
          console.error('Facility updates subscription error:', error);
        },
      });
    }

    const listeners = this.listeners.get(subscriptionKey)!;
    listeners.add(callback);

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        const subscription = this.subscriptions.get(subscriptionKey);
        if (subscription) {
          subscription.unsubscribe();
          this.subscriptions.delete(subscriptionKey);
          this.listeners.delete(subscriptionKey);
        }
      }
    };
  }

  subscribeToIncidentUpdates(
    facilityId: string,
    callback: (update: IncidentUpdate) => void
  ): () => void {
    const subscriptionKey = `incident_${facilityId}`;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      const subscription = apolloClient.subscribe({
        query: INCIDENT_UPDATES,
        variables: { facilityId },
      });

      this.subscriptions.set(subscriptionKey, subscription);
      this.listeners.set(subscriptionKey, new Set());

      subscription.subscribe({
        next: (result) => {
          const listeners = this.listeners.get(subscriptionKey);
          if (listeners) {
            listeners.forEach(listener => listener(result.data?.incidentUpdates));
          }
        },
        error: (error) => {
          console.error('Incident updates subscription error:', error);
        },
      });
    }

    const listeners = this.listeners.get(subscriptionKey)!;
    listeners.add(callback);

    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        const subscription = this.subscriptions.get(subscriptionKey);
        if (subscription) {
          subscription.unsubscribe();
          this.subscriptions.delete(subscriptionKey);
          this.listeners.delete(subscriptionKey);
        }
      }
    };
  }

  subscribeToIncomingPatients(
    facilityId: string,
    callback: (alert: any) => void
  ): () => void {
    const subscriptionKey = `incoming_patients_${facilityId}`;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      const subscription = apolloClient.subscribe({
        query: INCOMING_PATIENT_ALERTS,
        variables: { facilityId },
      });

      this.subscriptions.set(subscriptionKey, subscription);
      this.listeners.set(subscriptionKey, new Set());

      subscription.subscribe({
        next: (result) => {
          const listeners = this.listeners.get(subscriptionKey);
          if (listeners) {
            listeners.forEach(listener => listener(result.data?.incomingPatients));
          }
        },
        error: (error) => {
          console.error('Incoming patients subscription error:', error);
        },
      });
    }

    const listeners = this.listeners.get(subscriptionKey)!;
    listeners.add(callback);

    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        const subscription = this.subscriptions.get(subscriptionKey);
        if (subscription) {
          subscription.unsubscribe();
          this.subscriptions.delete(subscriptionKey);
          this.listeners.delete(subscriptionKey);
        }
      }
    };
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.listeners.clear();
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}

export const realTimeService = new RealTimeService();
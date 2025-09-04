import React from 'react';
import { useFacility } from '../../hooks/useFacility';
import { useIncidents } from '../../hooks/useIncidents';
import { useAuth } from '../../context/AuthContext';

const EmergencyMetrics: React.FC = () => {
  const { user } = useAuth();
  const { facility } = useFacility();
  const { incidents, loading: incidentsLoading } = useIncidents(facility?.id);

  const activeIncidents = incidents.filter(incident => 
    ['CREATED', 'DISPATCHING', 'ASSIGNED', 'EN_ROUTE', 'ON_SCENE', 'TREATMENT_ACTIVE', 'TRANSPORTING'].includes(incident.status)
  );

  const criticalIncidents = activeIncidents.filter(incident => 
    incident.severity === 'CRITICAL'
  );

  const availableBeds = facility?.bedManagement.filter(bed => bed.status === 'AVAILABLE').length || 0;
  const occupiedBeds = facility?.bedManagement.filter(bed => bed.status === 'OCCUPIED').length || 0;
  const availableAmbulances = facility?.ambulanceFleet.filter(ambulance => ambulance.status === 'AVAILABLE').length || 0;

  const metrics = [
    {
      title: 'Active Emergencies',
      value: activeIncidents.length,
      change: '+12%',
      changeType: 'increase',
      icon: '🚨',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Critical Cases',
      value: criticalIncidents.length,
      change: '+5%',
      changeType: 'increase',
      icon: '⚠️',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Available Beds',
      value: availableBeds,
      change: `${Math.round((availableBeds / (availableBeds + occupiedBeds)) * 100)}%`,
      changeType: 'neutral',
      icon: '🏥',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Available Ambulances',
      value: availableAmbulances,
      change: 'Ready',
      changeType: 'neutral',
      icon: '🚑',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  if (incidentsLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg p-6 h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`${metric.bgColor} rounded-lg p-6 border border-gray-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metric.change}
              </p>
            </div>
            <div className="text-3xl">{metric.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmergencyMetrics;

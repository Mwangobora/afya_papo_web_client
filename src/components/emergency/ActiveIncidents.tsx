import React from 'react';
import { useIncidents } from '../../hooks/useIncidents';
import { useFacility } from '../../hooks/useFacility';
import { useAuth } from '../../context/AuthContext';
import type { Incident, IncidentStatus, SeverityLevel } from '../../types';

const ActiveIncidents: React.FC = () => {
  const { user } = useAuth();
  const { facility } = useFacility();
  const { incidents, loading } = useIncidents(facility?.id);

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'CREATED':
        return 'bg-red-100 text-red-800';
      case 'DISPATCHING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'EN_ROUTE':
        return 'bg-purple-100 text-purple-800';
      case 'ON_SCENE':
        return 'bg-green-100 text-green-800';
      case 'TREATMENT_ACTIVE':
        return 'bg-indigo-100 text-indigo-800';
      case 'TRANSPORTING':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeIncidents = incidents.filter(incident => 
    ['CREATED', 'DISPATCHING', 'ASSIGNED', 'EN_ROUTE', 'ON_SCENE', 'TREATMENT_ACTIVE', 'TRANSPORTING'].includes(incident.status)
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Active Emergencies</h3>
        <p className="text-sm text-gray-500">
          {activeIncidents.length} active incidents
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {activeIncidents.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-500">No active emergencies</p>
          </div>
        ) : (
          activeIncidents.map((incident) => (
            <div key={incident.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                    <span className={`text-sm font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {incident.incidentNumber}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {incident.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>👥 {incident.patientCount} patient(s)</span>
                      <span>📍 {incident.location.address || 'Location not specified'}</span>
                      <span>🕐 {formatTime(incident.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {incident.assignments.length} responder(s)
                    </p>
                    <p className="text-xs text-gray-500">
                      {incident.ambulanceNeeded ? '🚑 Ambulance needed' : 'No transport needed'}
                    </p>
                  </div>
                  
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveIncidents;

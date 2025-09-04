import React from 'react';
import { useIncidents } from '../../hooks/useIncidents';
import { useFacility } from '../../hooks/useFacility';
import { useAuth } from '../../context/AuthContext';

const ResponderAssignments: React.FC = () => {
  const { user } = useAuth();
  const { facility } = useFacility();
  const { incidents, loading } = useIncidents(facility?.id);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get all assignments from active incidents
  const allAssignments = incidents
    .filter(incident => 
      ['CREATED', 'DISPATCHING', 'ASSIGNED', 'EN_ROUTE', 'ON_SCENE', 'TREATMENT_ACTIVE', 'TRANSPORTING'].includes(incident.status)
    )
    .flatMap(incident => 
      incident.assignments.map(assignment => ({
        ...assignment,
        incident: incident
      }))
    )
    .filter(assignment => 
      ['PENDING', 'SENT', 'ACCEPTED', 'EN_ROUTE', 'ON_SCENE', 'TREATMENT_ACTIVE'].includes(assignment.status)
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'EN_ROUTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ON_SCENE':
        return 'bg-purple-100 text-purple-800';
      case 'TREATMENT_ACTIVE':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600';
      case 'URGENT':
        return 'text-orange-600';
      case 'HIGH':
        return 'text-yellow-600';
      case 'MEDIUM':
        return 'text-blue-600';
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

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Responder Assignments</h3>
        <p className="text-sm text-gray-500">
          {allAssignments.length} active assignments
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {allAssignments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-gray-500">No active assignments</p>
          </div>
        ) : (
          allAssignments.map((assignment) => (
            <div key={assignment.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                      {assignment.priority} Priority
                    </span>
                    <span className="text-xs text-gray-500">
                      Order #{assignment.assignmentOrder}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {assignment.responder.profile?.fullName || 'Unknown Responder'}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {assignment.responder.emergencyResponderProfile?.responderType || 'Responder'} • 
                      {assignment.responder.emergencyResponderProfile?.primaryQualification || 'No qualification'}
                    </p>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p className="mb-1">
                      <strong>Incident:</strong> {assignment.incident.incidentNumber} - {assignment.incident.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span>📍 {formatDistance(assignment.estimatedDistance)} away</span>
                      <span>⏱️ {assignment.estimatedTravelTime} min ETA</span>
                      <span>🕐 Due: {formatTime(assignment.responseDeadline)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {assignment.incident.severity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {assignment.incident.patientCount} patient(s)
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {assignment.status === 'PENDING' && (
                      <button className="text-green-600 hover:text-green-800 text-xs font-medium">
                        Accept
                      </button>
                    )}
                    {assignment.status === 'SENT' && (
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        Respond
                      </button>
                    )}
                    <button className="text-gray-600 hover:text-gray-800 text-xs font-medium">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResponderAssignments;

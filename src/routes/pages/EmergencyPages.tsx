import { lazy } from 'react';

// Lazy load emergency response pages
export const IncidentManagement = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Incident Management</h1>
          <p className="text-gray-600">Manage and track emergency incidents.</p>
        </div>
      </div>
    )
  })
);

export const ActiveIncidents = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Active Incidents</h1>
          <p className="text-gray-600">View and manage currently active incidents.</p>
        </div>
      </div>
    )
  })
);

export const IncidentDetails = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Incident Details</h1>
          <p className="text-gray-600">Detailed view of incident information.</p>
        </div>
      </div>
    )
  })
);

export const CreateIncident = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Incident</h1>
          <p className="text-gray-600">Report a new emergency incident.</p>
        </div>
      </div>
    )
  })
);

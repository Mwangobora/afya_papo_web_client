import { lazy } from 'react';

// Lazy load responder pages
export const ResponderDashboard = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Responder Dashboard</h1>
          <p className="text-gray-600">Emergency responder control panel.</p>
        </div>
      </div>
    )
  })
);

export const MyAssignments = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Assignments</h1>
          <p className="text-gray-600">View and manage your emergency assignments.</p>
        </div>
      </div>
    )
  })
);

export const UpdateLocation = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Update Location</h1>
          <p className="text-gray-600">Update your current location for dispatch.</p>
        </div>
      </div>
    )
  })
);

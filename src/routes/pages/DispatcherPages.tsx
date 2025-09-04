import { lazy } from 'react';

// Lazy load dispatcher pages
export const DispatcherDashboard = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dispatcher Dashboard</h1>
          <p className="text-gray-600">Emergency dispatch control center.</p>
        </div>
      </div>
    )
  })
);

export const AssignResponders = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assign Responders</h1>
          <p className="text-gray-600">Assign emergency responders to incidents.</p>
        </div>
      </div>
    )
  })
);

export const CoordinateEmergency = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Coordinate Emergency</h1>
          <p className="text-gray-600">Coordinate multi-agency emergency response.</p>
        </div>
      </div>
    )
  })
);

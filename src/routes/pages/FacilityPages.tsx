import { lazy } from 'react';

// Lazy load facility management pages
export const FacilityDashboard = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Facility Dashboard</h1>
          <p className="text-gray-600">Manage hospital and facility resources.</p>
        </div>
      </div>
    )
  })
);

export const BedManagement = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bed Management</h1>
          <p className="text-gray-600">Manage hospital bed availability and assignments.</p>
        </div>
      </div>
    )
  })
);

export const AmbulanceFleet = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ambulance Fleet</h1>
          <p className="text-gray-600">Manage ambulance fleet and dispatch.</p>
        </div>
      </div>
    )
  })
);

export const ResourceManagement = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Resource Management</h1>
          <p className="text-gray-600">Manage medical equipment and supplies.</p>
        </div>
      </div>
    )
  })
);

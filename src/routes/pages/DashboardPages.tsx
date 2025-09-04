import { lazy } from 'react';

// Lazy load dashboard pages
export const Home = lazy(() => import('../../pages/Dashboard/Home'));

// Placeholder for emergency dashboard
export const EmergencyDashboard = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Emergency Dashboard</h1>
          <p className="text-gray-600">Real-time emergency response monitoring.</p>
        </div>
      </div>
    )
  })
);

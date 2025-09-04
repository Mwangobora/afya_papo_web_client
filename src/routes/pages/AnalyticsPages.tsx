import { lazy } from 'react';

// Lazy load analytics pages
export const Analytics = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
          <p className="text-gray-600">Emergency response analytics and insights.</p>
        </div>
      </div>
    )
  })
);

export const Reports = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports</h1>
          <p className="text-gray-600">Generate and view emergency response reports.</p>
        </div>
      </div>
    )
  })
);

import { lazy } from 'react';

// Lazy load error pages
export const NotFound = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  })
);

export const Unauthorized = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Unauthorized Access</h2>
          <p className="text-gray-600 mb-8">You don't have permission to access this resource.</p>
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  })
);

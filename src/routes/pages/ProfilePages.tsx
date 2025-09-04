import { lazy } from 'react';

// Lazy load profile pages
export const Profile = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
          <p className="text-gray-600">Manage your user profile and settings.</p>
        </div>
      </div>
    )
  })
);

export const Settings = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
          <p className="text-gray-600">Configure application settings and preferences.</p>
        </div>
      </div>
    )
  })
);

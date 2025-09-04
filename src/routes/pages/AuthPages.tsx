import { lazy } from 'react';

// Lazy load auth pages for better performance
export const SignIn = lazy(() => import('../../pages/AuthPages/SignIn'));
export const SignUp = lazy(() => import('../../pages/AuthPages/SignUp'));

// Placeholder for phone verification
export const PhoneVerification = lazy(() => 
  Promise.resolve({ 
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Phone Verification</h1>
          <p className="text-gray-600">Please verify your phone number to continue.</p>
        </div>
      </div>
    )
  })
);

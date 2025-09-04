import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleBasedRoute } from './guards/RoleBasedRoute';
import { UserType } from '../types/auth.types';

// Lazy load all page components
import {
  SignIn,
  SignUp,
  PhoneVerification
} from './pages/AuthPages';

import {
  Home,
  EmergencyDashboard
} from './pages/DashboardPages';

import {
  IncidentManagement,
  ActiveIncidents,
  IncidentDetails,
  CreateIncident
} from './pages/EmergencyPages';

import {
  FacilityDashboard,
  BedManagement,
  AmbulanceFleet,
  ResourceManagement
} from './pages/FacilityPages';

import {
  ResponderDashboard,
  MyAssignments,
  UpdateLocation
} from './pages/ResponderPages';

import {
  DispatcherDashboard,
  AssignResponders,
  CoordinateEmergency
} from './pages/DispatcherPages';

import {
  Analytics,
  Reports
} from './pages/AnalyticsPages';

import {
  Profile,
  Settings
} from './pages/ProfilePages';

import {
  NotFound,
  Unauthorized
} from './pages/ErrorPages';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
  </div>
);

// Route wrapper with Suspense
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route 
        path="/" 
        element={<Navigate to="/login" replace />} 
      />
      <Route 
        path="/login" 
        element={
          <SuspenseWrapper>
            <SignIn />
          </SuspenseWrapper>
        } 
      />
      <Route 
        path="/register" 
        element={
          <SuspenseWrapper>
            <SignUp />
          </SuspenseWrapper>
        } 
      />
      <Route 
        path="/verify-phone" 
        element={
          <SuspenseWrapper>
            <PhoneVerification />
          </SuspenseWrapper>
        } 
      />
      
      {/* Error Routes */}
      <Route 
        path="/unauthorized" 
        element={
          <SuspenseWrapper>
            <Unauthorized />
          </SuspenseWrapper>
        } 
      />
      <Route 
        path="/404" 
        element={
          <SuspenseWrapper>
            <NotFound />
          </SuspenseWrapper>
        } 
      />
      
      {/* Main Dashboard - Role-based routing */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute>
                <Home />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      {/* Emergency Response Routes */}
      <Route
        path="/emergency"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={[UserType.HOSPITAL_ADMIN, UserType.DISPATCHER, UserType.RESPONDER]}>
                <EmergencyDashboard />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/incidents"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={[UserType.HOSPITAL_ADMIN, UserType.DISPATCHER, UserType.RESPONDER]}>
                <IncidentManagement />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/incidents/active"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={[UserType.HOSPITAL_ADMIN, UserType.DISPATCHER, UserType.RESPONDER]}>
                <ActiveIncidents />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/incidents/create"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={[UserType.HOSPITAL_ADMIN, UserType.DISPATCHER]}>
                <CreateIncident />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/incidents/:id"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={[UserType.HOSPITAL_ADMIN, UserType.DISPATCHER, UserType.RESPONDER]}>
                <IncidentDetails />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      {/* Facility Management Routes */}
      <Route
        path="/facility"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={UserType.HOSPITAL_ADMIN}>
                <FacilityDashboard />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/facility/beds"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute 
                requiredRole={UserType.HOSPITAL_ADMIN} 
                requiredPermission="canManageBeds"
              >
                <BedManagement />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/facility/ambulances"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute 
                requiredRole={UserType.HOSPITAL_ADMIN} 
                requiredPermission="canManageAmbulances"
              >
                <AmbulanceFleet />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/facility/resources"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute 
                requiredRole={UserType.HOSPITAL_ADMIN} 
                requiredPermission="canManageResources"
              >
                <ResourceManagement />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      {/* Responder Routes */}
      <Route
        path="/responder"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={UserType.RESPONDER}>
                <ResponderDashboard />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/responder/assignments"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={UserType.RESPONDER}>
                <MyAssignments />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/responder/location"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={UserType.RESPONDER}>
                <UpdateLocation />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      {/* Dispatcher Routes */}
      <Route
        path="/dispatcher"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={UserType.DISPATCHER}>
                <DispatcherDashboard />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dispatcher/assign"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute 
                requiredRole={UserType.DISPATCHER} 
                requiredPermission="assign_responders"
              >
                <AssignResponders />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dispatcher/coordinate"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute 
                requiredRole={UserType.DISPATCHER} 
                requiredPermission="coordinate_emergencies"
              >
                <CoordinateEmergency />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      {/* Analytics & Reports Routes */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute 
                requiredRole={[UserType.HOSPITAL_ADMIN, UserType.DISPATCHER]} 
                requiredPermission="view_analytics"
              >
                <Analytics />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute 
                requiredRole={[UserType.HOSPITAL_ADMIN, UserType.DISPATCHER]} 
                requiredPermission="canGenerateReports"
              >
                <Reports />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      {/* Profile & Settings Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute>
                <Profile />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute>
                <Settings />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      {/* Catch all route */}
      <Route 
        path="*" 
        element={
          <SuspenseWrapper>
            <NotFound />
          </SuspenseWrapper>
        } 
      />
    </Routes>
  );
};

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleBasedRoute } from './guards/RoleBasedRoute';
import AppLayout from '../layout/AppLayout';

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
  ActiveIncidents,
  IncidentDetails,
  CreateIncident
} from './pages/EmergencyPages';
import Incidents from '../components/incidents/Incidents';

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
import Responders from '../components/responders/Responders';
import Dispatchers from '../components/dispatch/Dispatchers';

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
      
      {/* Protected Routes with Layout */}
      <Route element={<AppLayout />}>
        {/* Main Dashboard - Role-based routing */}
        <Route
          path="/dashboard"
          element={
          // <ProtectedRoute>
              <SuspenseWrapper>
                <RoleBasedRoute>
                  <Home />
                </RoleBasedRoute>
              </SuspenseWrapper>
            // </ProtectedRoute>
          }
        />
      
        {/* Emergency Response Routes */}
        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <RoleBasedRoute requiredRole={['HOSPITAL_ADMIN', 'DISPATCHER', 'RESPONDER']}>
                  <EmergencyDashboard />
                </RoleBasedRoute>
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/incidents"
          element={      <Incidents />
            // <ProtectedRoute>
            //   <SuspenseWrapper>
            //     <RoleBasedRoute requiredRole={['HOSPITAL_ADMIN', 'DISPATCHER', 'RESPONDER']}>
            
            //     </RoleBasedRoute>
            //   </SuspenseWrapper>
            // </ProtectedRoute>
          }
        />
      
      <Route
        path="/incidents/active"
        element={  <ActiveIncidents />
          // <ProtectedRoute>
          //   <SuspenseWrapper>
          //     <RoleBasedRoute requiredRole={['HOSPITAL_ADMIN', 'DISPATCHER', 'RESPONDER']}>
               
          //     </RoleBasedRoute>
          //   </SuspenseWrapper>
          // </ProtectedRoute>
        }
      />
      
      <Route
        path="/incidents/create"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole={['HOSPITAL_ADMIN', 'DISPATCHER']}>
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
              <RoleBasedRoute requiredRole={['HOSPITAL_ADMIN', 'DISPATCHER', 'RESPONDER']}>
                <IncidentDetails />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      {/* Facility Management Routes */}
      <Route
        path="/facility"
        element={        <FacilityDashboard />
          // <ProtectedRoute>
          //   <SuspenseWrapper>
          //     <RoleBasedRoute requiredRole="HOSPITAL_ADMIN">
          //       <FacilityDashboard />
          //     </RoleBasedRoute>
          //   </SuspenseWrapper>
          // </ProtectedRoute>
        }
      />
      
      <Route
        path="/facility/beds"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute 
                requiredRole="HOSPITAL_ADMIN" 
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
                requiredRole="HOSPITAL_ADMIN" 
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
                requiredRole="HOSPITAL_ADMIN" 
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
        path="/responders"
        element={  <Responders />
          // <ProtectedRoute>
          //   <SuspenseWrapper>
          //     <RoleBasedRoute requiredRole="RESPONDER">
          //       <Responders />
          //     </RoleBasedRoute>
          //   </SuspenseWrapper>
          // </ProtectedRoute>
        }
      />
      
      <Route
        path="/responder/assignments"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute requiredRole="RESPONDER">
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
              <RoleBasedRoute requiredRole="RESPONDER">
                <UpdateLocation />
              </RoleBasedRoute>
            </SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      
      {/* Dispatcher Routes */}
      <Route
        path="/dispatcher"
        element={        <Dispatchers />
          // <ProtectedRoute>
          //   <SuspenseWrapper>
          //     <RoleBasedRoute requiredRole="DISPATCHER">
          //       <Dispatchers />
          //     </RoleBasedRoute>
          //   </SuspenseWrapper>
          // </ProtectedRoute>
        }
      />
      
      <Route
        path="/dispatcher/assign"
        element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleBasedRoute 
                requiredRole="DISPATCHER" 
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
                requiredRole="DISPATCHER" 
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
        element={ <Analytics />
          // <ProtectedRoute>
          //   <SuspenseWrapper>
          //     <RoleBasedRoute 
          //       requiredRole={['HOSPITAL_ADMIN', 'DISPATCHER']} 
          //       requiredPermission="view_analytics"
          //     >
          //       <Analytics />
          //     </RoleBasedRoute>
          //   </SuspenseWrapper>
          // </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports"
        element={      <Reports />
          // <ProtectedRoute>
          //   <SuspenseWrapper>
          //     <RoleBasedRoute 
          //       requiredRole={['HOSPITAL_ADMIN', 'DISPATCHER']} 
          //       requiredPermission="canGenerateReports"
          //     >
          //       <Reports />
          //     </RoleBasedRoute>
          //   </SuspenseWrapper>
          // </ProtectedRoute>
        }
      />
      
      {/* Profile & Settings Routes */}
      <Route
        path="/profile"
        element={       <Profile />
          // <ProtectedRoute>
          //   <SuspenseWrapper>
          //     <RoleBasedRoute>
          //       <Profile />
          //     </RoleBasedRoute>
          //   </SuspenseWrapper>
          // </ProtectedRoute>
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
      </Route>
      
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
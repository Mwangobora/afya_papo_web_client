import { lazy } from 'react';

// Lazy load facility management pages
export const FacilityDashboard = lazy(() => import('../../components/facility/FacilityDashboard'));
export const BedManagement = lazy(() => import('../../components/facility/Beds'));
export const AmbulanceFleet = lazy(() => import('../../components/facility/Ambulances'));
export const ResourceManagement = lazy(() => import('../../components/facility/Resources'));

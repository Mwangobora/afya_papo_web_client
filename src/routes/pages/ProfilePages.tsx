import { lazy } from 'react';

// Lazy load profile pages
export const Profile = lazy(() => import('../../components/profile/Profile'));
export const Settings = lazy(() => import('../../components/profile/Settings'));

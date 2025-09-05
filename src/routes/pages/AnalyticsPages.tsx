import { lazy } from 'react';

// Lazy load analytics pages
export const Analytics = lazy(() => import('../../components/analytics/Analytics'));
export const Reports = lazy(() => import('../../components/analytics/Reports'));

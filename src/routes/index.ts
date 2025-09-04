// Export main route component
export { AppRoutes } from './AppRoutes';

// Export route guards
export { ProtectedRoute } from './guards/ProtectedRoute';
export { RoleBasedRoute } from './guards/RoleBasedRoute';

// Export page components for direct access if needed
export * from './pages/AuthPages';
export * from './pages/DashboardPages';
export * from './pages/EmergencyPages';
export * from './pages/FacilityPages';
export * from './pages/ResponderPages';
export * from './pages/DispatcherPages';
export * from './pages/AnalyticsPages';
export * from './pages/ProfilePages';
export * from './pages/ErrorPages';

// src/contexts/AppContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../config/apollo.config';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';

interface AppContextType {
  version: string;
  environment: 'development' | 'production' | 'staging';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const appContextValue: AppContextType = {
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: (process.env.NODE_ENV as any) || 'development',
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </ApolloProvider>
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};

// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications as useNotificationHook } from '../hooks/useNotifications';

type NotificationContextType = ReturnType<typeof useNotificationHook>;

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notifications = useNotificationHook();

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

// src/components/rbac/ProtectedComponent.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { UserType, AdminPermissions } from '../../types/auth.types';

interface ProtectedComponentProps {
  children: ReactNode;
  requiredRole?: UserType;
  requiredPermission?: keyof AdminPermissions;
  requiredPermissions?: (keyof AdminPermissions)[];
  requireAll?: boolean;
  fallback?: ReactNode;
  onUnauthorized?: () => void;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  requiredRole,
  requiredPermission,
  requiredPermissions = [],
  requireAll = true,
  fallback = null,
  onUnauthorized,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { hasRole, hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  if (!isAuthenticated) {
    onUnauthorized?.();
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    onUnauthorized?.();
    return <>{fallback}</>;
  }

  // Check single permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    onUnauthorized?.();
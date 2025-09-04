import React, { createContext, useContext, type ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react'; // ✅ Correct import for v4
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
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: (import.meta.env.MODE as 'development' | 'production' | 'staging') || 'development',
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

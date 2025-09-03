// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User, AuthTokens, LoginCredentials, UserType, AdminPermissions } from '../types/auth.types';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: AdminPermissions | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'REFRESH_SUCCESS'; payload: AuthTokens }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  hasPermission: (permission: keyof AdminPermissions) => boolean;
  hasRole: (role: UserType) => boolean;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: action.payload.user.hospitalAdminProfile?.permissions || null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        permissions: null,
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'REFRESH_SUCCESS':
      return {
        ...state,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const authService = new AuthService();
  const tokenService = new TokenService();

  useEffect(() => {
    initializeAuth();
    setupTokenRefresh();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (tokenService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        
        if (user) {
          const mockTokens: AuthTokens = {
            accessToken: tokenService.getAccessToken() || '',
            refreshToken: tokenService.getRefreshToken() || '',
            expiresAt: tokenService.getTokenExpirationTime()?.toISOString() || '',
          };
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, tokens: mockTokens },
          });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const setupTokenRefresh = (): void => {
    const interval = setInterval(async () => {
      if (tokenService.shouldRefreshToken()) {
        await refreshToken();
      }
    }, 60000); 

     () => clearInterval(interval);
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.login(credentials);

      if (response.success && response.user && response.tokens) {
        tokenService.setTokens(response.tokens);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.user,
            tokens: response.tokens,
          },
        });

        return true;
      } else {
        const errorMessage = response.errors?.join(', ') || 'Login failed';
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenService.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = tokenService.getRefreshToken();
      
      if (!refreshTokenValue) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return false;
      }

      const tokens = await authService.refreshToken(refreshTokenValue);
      
      if (tokens) {
        tokenService.setTokens(tokens);
        dispatch({ type: 'REFRESH_SUCCESS', payload: tokens });
        return true;
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
      return false;
    }
  };

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    return state.permissions?.[permission] || false;
  };

  const hasRole = (role: UserType): boolean => {
    return state.user?.userType === role;
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};



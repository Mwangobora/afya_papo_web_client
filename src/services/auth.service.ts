
import { apolloClient } from '../config/apollo.config';
import { 
  LOGIN,
  REGISTER,
  VERIFY_PHONE,
  REFRESH_TOKEN, 
  LOGOUT, 
  GET_CURRENT_USER 
} from '../graphql/auth.operations';
import type { 
  User, 
  LoginCredentials, 
  LoginResponse, 
  AuthTokens,
  RegisterInput,
  VerifyPhoneInput
} from '../types/auth.types';
import { ErrorHandler } from '../utils/error.utils';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { data } = await apolloClient.mutate<{
        login: {
          success: boolean;
          user?: User;
          accessToken?: string;
          refreshToken?: string;
          errors?: string[];
        };
      }>({
        mutation: LOGIN,
        variables: {
          input: {
            phoneNumber: credentials.phoneNumber,
            password: credentials.password,
            deviceInfo: credentials.deviceInfo,
          },
        },
        errorPolicy: 'all',
      });

      const result = data?.login;

      if (result?.success && result.user && result.accessToken && result.refreshToken) {
        return {
          success: true,
          user: result.user,
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
          },
        };
      } else {
        return {
          success: false,
          errors: result?.errors || ['Login failed'],
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        errors: errors.map(e => e.message),
      };
    }
  }

  async register(input: RegisterInput): Promise<LoginResponse> {
    try {
      const { data } = await apolloClient.mutate<{
        register: {
          success: boolean;
          user?: User;
          accessToken?: string;
          refreshToken?: string;
          errors?: string[];
        };
      }>({
        mutation: REGISTER,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.register;

      if (result?.success && result.user && result.accessToken && result.refreshToken) {
        return {
          success: true,
          user: result.user,
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          },
        };
      } else {
        return {
          success: false,
          errors: result?.errors || ['Registration failed'],
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        errors: errors.map(e => e.message),
      };
    }
  }

  async verifyPhone(input: VerifyPhoneInput): Promise<LoginResponse> {
    try {
      const { data } = await apolloClient.mutate<{
        verifyPhone: {
          success: boolean;
          user?: User;
          accessToken?: string;
          refreshToken?: string;
          errors?: string[];
        };
      }>({
        mutation: VERIFY_PHONE,
        variables: { input },
        errorPolicy: 'all',
      });

      const result = data?.verifyPhone;

      if (result?.success && result.user && result.accessToken && result.refreshToken) {
        return {
          success: true,
          user: result.user,
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          },
        };
      } else {
        return {
          success: false,
          errors: result?.errors || ['Phone verification failed'],
        };
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      const errors = ErrorHandler.handleError(error);
      return {
        success: false,
        errors: errors.map(e => e.message),
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const { data } = await apolloClient.mutate<{
        refreshToken: {
          success: boolean;
          accessToken: string;
          refreshToken: string;
          expiresAt: string;
        };
      }>({
        mutation: REFRESH_TOKEN,
        variables: { refreshToken },
        errorPolicy: 'all',
      });

      const result = data?.refreshToken;

      if (result?.success && result.accessToken) {
        return {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt,
        };
      }

      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: LOGOUT,
        errorPolicy: 'all',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await apolloClient.clearStore();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await apolloClient.query<{ me: User | null }>({
        query: GET_CURRENT_USER,
        errorPolicy: 'all',
        fetchPolicy: 'network-only',
      });

      return data?.me || null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}

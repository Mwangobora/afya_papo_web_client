
import { apolloClient } from '../config/apollo.config';
import { 
  ADMIN_LOGIN, 
  REFRESH_TOKEN, 
  LOGOUT, 
  GET_CURRENT_USER 
} from '../graphql/auth.operations';
import type { 
  User, 
  LoginCredentials, 
  LoginResponse, 
  AuthTokens 
} from '../types/auth.types';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: ADMIN_LOGIN,
        variables: {
          input: {
            username: credentials.username,
            password: credentials.password,
            userType: credentials.userType || 'HOSPITAL_ADMIN',
          },
        },
        errorPolicy: 'all',
      });

      const result = data?.adminLogin;

      if (result?.success) {
        return {
          success: true,
          user: result.user,
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt: result.expiresAt,
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
      return {
        success: false,
        errors: ['Network error occurred during login'],
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REFRESH_TOKEN,
        variables: { refreshToken },
        errorPolicy: 'all',
      });

      const result = data?.refreshToken;

      if (result?.success) {
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
      // Clear Apollo cache
      await apolloClient.clearStore();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await apolloClient.query({
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

  async verifyToken(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}

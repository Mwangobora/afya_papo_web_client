// src/services/token.service.ts
import Cookies from 'js-cookie';
import{ AuthTokens } from '../types/auth.types';

export class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'afyapapo_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'afyapapo_refresh_token';
  private static readonly EXPIRES_AT_KEY = 'afyapapo_expires_at';
  
  private static readonly COOKIE_OPTIONS = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  };

  setTokens(tokens: AuthTokens): void {
    try {
      const expiresInDays = this.calculateExpirationDays(tokens.expiresAt);
      
      Cookies.set(TokenService.ACCESS_TOKEN_KEY, tokens.accessToken, {
        ...TokenService.COOKIE_OPTIONS,
        expires: expiresInDays,
      });
      
      Cookies.set(TokenService.REFRESH_TOKEN_KEY, tokens.refreshToken, {
        ...TokenService.COOKIE_OPTIONS,
        expires: 30, // Refresh token valid for 30 days
      });
      
      Cookies.set(TokenService.EXPIRES_AT_KEY, tokens.expiresAt, {
        ...TokenService.COOKIE_OPTIONS,
        expires: expiresInDays,
      });
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  getAccessToken(): string | null {
    try {
      const token = Cookies.get(TokenService.ACCESS_TOKEN_KEY);
      
      if (token && this.isTokenExpired()) {
        this.clearTokens();
        return null;
      }
      
      return token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      return Cookies.get(TokenService.REFRESH_TOKEN_KEY) || null;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    return !!accessToken && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    try {
      const expiresAt = Cookies.get(TokenService.EXPIRES_AT_KEY);
      
      if (!expiresAt) {
        return true;
      }
      
      const expirationTime = new Date(expiresAt).getTime();
      const currentTime = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
      
      return currentTime >= (expirationTime - bufferTime);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  clearTokens(): void {
    try {
      Cookies.remove(TokenService.ACCESS_TOKEN_KEY, { path: '/' });
      Cookies.remove(TokenService.REFRESH_TOKEN_KEY, { path: '/' });
      Cookies.remove(TokenService.EXPIRES_AT_KEY, { path: '/' });
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  getTokenExpirationTime(): Date | null {
    try {
      const expiresAt = Cookies.get(TokenService.EXPIRES_AT_KEY);
      return expiresAt ? new Date(expiresAt) : null;
    } catch (error) {
      console.error('Error getting token expiration time:', error);
      return null;
    }
  }

  getRemainingTokenTime(): number {
    try {
      const expirationTime = this.getTokenExpirationTime();
      if (!expirationTime) return 0;
      
      const currentTime = Date.now();
      const remainingTime = expirationTime.getTime() - currentTime;
      
      return Math.max(0, remainingTime);
    } catch (error) {
      console.error('Error calculating remaining token time:', error);
      return 0;
    }
  }

  shouldRefreshToken(): boolean {
    const remainingTime = this.getRemainingTokenTime();
    const refreshThreshold = 10 * 60 * 1000; // 10 minutes
    
    return remainingTime > 0 && remainingTime < refreshThreshold;
  }

  private calculateExpirationDays(expiresAt: string): number {
    try {
      const expirationTime = new Date(expiresAt).getTime();
      const currentTime = Date.now();
      const diffTime = expirationTime - currentTime;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(1, diffDays);
    } catch (error) {
      console.error('Error calculating expiration days:', error);
      return 1; // Default to 1 day
    }
  }
}

// src/services/storage.service.ts
export class StorageService {
  private static readonly PREFIX = 'afyapapo_';

  static setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.PREFIX + key, serializedValue);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  }

  static getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (item === null) return defaultValue;
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return defaultValue;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  static hasItem(key: string): boolean {
    try {
      return localStorage.getItem(this.PREFIX + key) !== null;
    } catch (error) {
      console.error('Error checking item in storage:', error);
      return false;
    }
  }
}

// src/services/encryption.service.ts
export class EncryptionService {
  private static readonly SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-secret-key';

  static encrypt(data: string): string {
    try {
      // Simple base64 encoding for demonstration
      // In production, use proper encryption like crypto-js
      return btoa(encodeURIComponent(data));
    } catch (error) {
      console.error('Error encrypting data:', error);
      return data;
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      // Simple base64 decoding for demonstration
      return decodeURIComponent(atob(encryptedData));
    } catch (error) {
      console.error('Error decrypting data:', error);
      return encryptedData;
    }
  }

  static generateRandomString(length: number = 32): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }
}
import { Env } from '../config/env';

export class EncryptionService {
  private static readonly SECRET_KEY = Env.VITE_ENCRYPTION_KEY;

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
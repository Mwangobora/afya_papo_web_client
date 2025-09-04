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


export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  static isValidBedNumber(bedNumber: string): boolean {
    const bedRegex = /^[A-Z0-9-]+$/i;
    return bedRegex.test(bedNumber) && bedNumber.length <= 20;
  }

  static isValidQuantity(quantity: number, min: number = 0, max?: number): boolean {
    if (quantity < min) return false;
    if (max !== undefined && quantity > max) return false;
    return Number.isInteger(quantity);
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static validateRequired(value: any, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  }

  static validateLength(
    value: string,
    fieldName: string,
    minLength: number,
    maxLength: number
  ): string | null {
    if (value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    if (value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters`;
    }
    return null;
  }

  static validateNumericRange(
    value: number,
    fieldName: string,
    min: number,
    max: number
  ): string | null {
    if (value < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (value > max) {
      return `${fieldName} must be no more than ${max}`;
    }
    return null;
  }
}

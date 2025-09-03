
import { ApolloError } from '@apollo/client';
import type { ApiError } from '../types/auth.types';

export class ErrorHandler {
  static formatApolloError(error: ApolloError): ApiError[] {
    const errors: ApiError[] = [];

    // Handle GraphQL errors
    if (error.graphQLErrors?.length > 0) {
      error.graphQLErrors.forEach((gqlError) => {
        errors.push({
          message: gqlError.message,
          code: gqlError.extensions?.code as string,
          field: gqlError.extensions?.field as string,
        });
      });
    }

    // Handle network errors
    if (error.networkError) {
      errors.push({
        message: this.getNetworkErrorMessage(error.networkError),
        code: 'NETWORK_ERROR',
      });
    }

    return errors.length > 0 ? errors : [{ message: 'An unexpected error occurred' }];
  }

  static getNetworkErrorMessage(networkError: any): string {
    if (networkError.statusCode) {
      switch (networkError.statusCode) {
        case 400:
          return 'Bad request - please check your input';
        case 401:
          return 'Authentication required';
        case 403:
          return 'Access denied - insufficient permissions';
        case 404:
          return 'Resource not found';
        case 500:
          return 'Server error - please try again later';
        case 503:
          return 'Service unavailable - please try again later';
        default:
          return `Network error (${networkError.statusCode})`;
      }
    }

    if (networkError.message) {
      if (networkError.message.includes('Failed to fetch')) {
        return 'Network connection error - please check your internet connection';
      }
      return networkError.message;
    }

    return 'Network error occurred';
  }

  static handleError(error: unknown): ApiError[] {
    if (error instanceof ApolloError) {
      return this.formatApolloError(error);
    }

    if (error instanceof Error) {
      return [{ message: error.message }];
    }

    return [{ message: 'An unexpected error occurred' }];
  }

  static getErrorMessage(errors: ApiError[]): string {
    if (errors.length === 0) return 'Unknown error';
    if (errors.length === 1) return errors[0].message;
    
    return `Multiple errors: ${errors.map(e => e.message).join(', ')}`;
  }

  static hasFieldError(errors: ApiError[], field: string): boolean {
    return errors.some(error => error.field === field);
  }

  static getFieldError(errors: ApiError[], field: string): string | null {
    const error = errors.find(error => error.field === field);
    return error ? error.message : null;
  }
}
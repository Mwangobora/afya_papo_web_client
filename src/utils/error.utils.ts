import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LocalStateError,
  ServerError,
  ServerParseError,
  UnconventionalError
} from '@apollo/client/errors';

import type { ApiError } from '../types/auth.types';

export class ErrorHandler {
  /**
   * Formats Apollo errors into a consistent structure
   */
  static formatApolloError(error: unknown): ApiError[] {
    const errors: ApiError[] = [];

    // Handle GraphQL errors
    if (CombinedGraphQLErrors.is(error)) {
      error.errors.forEach(gqlError => {
        errors.push({
          message: gqlError.message,
          code: gqlError.extensions?.code as string,
          field: gqlError.extensions?.field as string,
        });
      });
    }

    // Handle network/server errors
    if (ServerError.is(error)) {
      errors.push({
        message: this.getNetworkErrorMessage(error),
        code: 'NETWORK_ERROR',
      });
    } else if (ServerParseError.is(error)) {
      errors.push({
        message: 'Failed to parse server response',
        code: 'PARSE_ERROR',
      });
    } else if (CombinedProtocolErrors.is(error)) {
      errors.push({
        message: 'Protocol error during multipart execution',
        code: 'PROTOCOL_ERROR',
      });
    } else if (LocalStateError.is(error)) {
      errors.push({
        message: 'Error in local state management',
        code: 'LOCAL_STATE_ERROR',
      });
    } else if (UnconventionalError.is(error)) {
      errors.push({
        message: error.message,
        code: 'UNCONVENTIONAL_ERROR',
      });
    }

    // Fallback if no specific error detected
    return errors.length > 0 ? errors : [{ message: 'An unexpected error occurred' }];
  }

  /**
   * Maps HTTP status codes to user-friendly messages
   */
  static getNetworkErrorMessage(networkError: ServerError): string {
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

  /**
   * Centralized error handler
   */
  static handleError(error: unknown): ApiError[] {
    return this.formatApolloError(error);
  }

  /**
   * Combine multiple error messages into a single string
   */
  static getErrorMessage(errors: ApiError[]): string {
    if (errors.length === 0) return 'Unknown error';
    if (errors.length === 1) return errors[0].message;

    return `Multiple errors: ${errors.map(e => e.message).join(', ')}`;
  }

  /**
   * Check if a specific field has an error
   */
  static hasFieldError(errors: ApiError[], field: string): boolean {
    return errors.some(error => error.field === field);
  }

  /**
   * Get the error message for a specific field
   */
  static getFieldError(errors: ApiError[], field: string): string | null {
    const error = errors.find(error => error.field === field);
    return error ? error.message : null;
  }
}

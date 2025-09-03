
import { useState, useCallback } from 'react';
import { ErrorHandler } from '../utils/error.utils';
import { useNotifications } from './useNotifications';

interface AsyncOperationState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface AsyncOperationOptions {
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useAsyncOperation = <T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: AsyncOperationOptions = {}
) => {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { showSuccess, showError } = useNotifications();

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await operation(...args);
      
      setState({
        data: result,
        loading: false,
        error: null,
      });

      if (options.showSuccessNotification) {
        showSuccess(options.successMessage || 'Operation completed successfully');
      }

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(ErrorHandler.handleError(error));
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      if (options.showErrorNotification) {
        showError(errorMessage);
      }

      if (options.onError) {
        options.onError(errorMessage);
      }

      throw error;
    }
  }, [operation, options, showSuccess, showError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
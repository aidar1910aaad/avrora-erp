import { useState, useCallback, useRef } from 'react';
import type { AsyncState, ApiError } from '../types';

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onSettled?: () => void;
}

export function useAsync<T, Args extends unknown[] = unknown[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: 'idle',
    error: null,
  });

  const { onSuccess, onError, onSettled } = options;
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: Args) => {

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }


      abortControllerRef.current = new AbortController();

      setState(prev => ({ ...prev, loading: 'loading', error: null }));

      try {
        const data = await asyncFn(...args);
        
        setState({
          data,
          loading: 'success',
          error: null,
        });

        onSuccess?.(data);
        return data;
      } catch (error) {
        const apiError = error as ApiError;
        
        setState(prev => ({
          ...prev,
          loading: 'error',
          error: apiError,
        }));

        onError?.(apiError);
        throw apiError;
      } finally {
        onSettled?.();
      }
    },
    [asyncFn, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: 'idle',
      error: null,
    });
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
  };
} 
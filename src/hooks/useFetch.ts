import { useCallback, useEffect, useState } from 'react';
import { getFriendlyApiError } from '../utils/apiError';

type UseFetchOptions = {
  enabled?: boolean;
};

export function useFetch<T>(
  fetchFunction: () => Promise<T>,
  dependencies: unknown[] = [],
  options: UseFetchOptions = {}
) {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(getFriendlyApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, ...dependencies]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refetch: loadData,
  };
}

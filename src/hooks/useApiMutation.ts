import { useState } from 'react';
import { getFriendlyApiError } from '../utils/apiError';

export function useApiMutation<TData, TVariables>(
  mutationFunction: (variables: TVariables) => Promise<TData>
) {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mutate(variables: TVariables) {
    try {
      setIsLoading(true);
      setError(null);
      const result = await mutationFunction(variables);
      setData(result);
      return result;
    } catch (err) {
      const message = getFriendlyApiError(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

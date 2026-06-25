import { useState } from 'react';

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
    } catch {
      setError('No se pudo completar la acción. Inténtalo nuevamente.');
      throw new Error('Mutation failed');
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
import { useEffect, useState } from 'react';

export function useFetch<T>(fetchFunction: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchFunction();
      setData(result);
    } catch {
      setError('No pudimos cargar la información. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    refetch: loadData,
  };
}
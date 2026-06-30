import { useFetch } from './useFetch';
import { getCurrentUserProfile } from '../services/userService';

export function useCurrentUser() {
  const { data: user, isLoading, error, refetch } = useFetch(
    getCurrentUserProfile,
    []
  );

  return {
    user,
    userId: user?.id ?? null,
    loading: isLoading,
    error,
    refetch,
  };
}

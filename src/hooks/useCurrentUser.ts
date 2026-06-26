import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '../services/tokenService';

interface TokenPayload {
  sub: string;
  userId: number;
  role: string;
}

export function useCurrentUser() {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = await getAccessToken();
        if (token) {
          const decoded = jwtDecode<TokenPayload>(token);
          setUserId(decoded.userId);
        }
      } catch {
        setUserId(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  return { userId, loading };
}
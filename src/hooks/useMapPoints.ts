import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { getMapPoints, MapPoint } from '../services/mapPointService';

export function useMapPoints() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadPoints = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getMapPoints();
      setPoints(data);
    } catch {
      setError(true);
      Toast.show({
        type: 'error',
        text1: 'Error al cargar el mapa',
        text2: 'No se pudieron obtener los puntos. Inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPoints();
  }, [loadPoints]);

  return { points, loading, error, reload: loadPoints };
}
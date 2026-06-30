import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { getMapPoints, MapPoint } from '../services/mapPointService';
import { getAllReportesZona } from '../services/reporteZonaService';

export function useMapPoints() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadPoints = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const [officialPoints, zoneReports] = await Promise.all([
        getMapPoints().catch(() => []),
        getAllReportesZona().catch(() => []),
      ]);

      const reportedPoints: MapPoint[] = zoneReports.map((report) => ({
        id: -report.id,
        latitude: report.latitude,
        longitude: report.longitude,
        nombre: report.descripcion?.trim() ? `Reporte: ${report.descripcion}` : 'Zona reportada por la comunidad',
        tipo: report.procesado ? 'ZONA_SUCIA' : 'ZONA_REPORTADA',
      }));

      setPoints([...officialPoints, ...reportedPoints]);
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

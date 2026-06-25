import { useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';

export function useLocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  async function getLocation() {
    setLocationLoading(true);
    setLocationDenied(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationDenied(true);
        Alert.alert(
          'Permiso de ubicación denegado',
          'Ve a Configuración > Aplicaciones > ReciScore > Permisos para habilitarla.',
          [{ text: 'Entendido' }]
        );
        return;
      }
      const coords = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      });
      Toast.show({
        type: 'success',
        text1: 'Ubicación obtenida',
        text2: 'Tu ubicación fue registrada correctamente.',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error de ubicación',
        text2: 'No se pudo obtener tu ubicación. Inténtalo de nuevo.',
      });
    } finally {
      setLocationLoading(false);
    }
  }

  function resetLocation() {
    setLocation(null);
    setLocationDenied(false);
  }

  return { location, locationLoading, locationDenied, getLocation, resetLocation };
}
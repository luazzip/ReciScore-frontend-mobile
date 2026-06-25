import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { useMapPoints } from '../hooks/useMapPoints';
import { createReporteZona } from '../services/reporteZonaService';

const LIMA_REGION: Region = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function MapScreen() {
  const { points, loading, error, reload } = useMapPoints();

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportCoords, setReportCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  async function centerOnUser() {
    setLocatingUser(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación denegado',
          'Ve a Configuración > Aplicaciones > ReciScore > Permisos para habilitarla. Mientras tanto, puedes explorar el mapa manualmente.',
          [{ text: 'Entendido' }]
        );
        return;
      }
      const coords = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation({ latitude: coords.coords.latitude, longitude: coords.coords.longitude });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'No se pudo obtener tu ubicación',
        text2: 'Inténtalo de nuevo en unos segundos.',
      });
    } finally {
      setLocatingUser(false);
    }
  }

  function openReportModal(latitude: number, longitude: number) {
    setReportCoords({ latitude, longitude });
    setDescripcion('');
    setReportModalVisible(true);
  }

  async function handleSubmitReport() {
    if (!reportCoords) {
      Toast.show({ type: 'error', text1: 'Ubicación requerida', text2: 'Toca un punto del mapa primero.' });
      return;
    }
    setSubmittingReport(true);
    try {
      await createReporteZona({
        latitude: reportCoords.latitude,
        longitude: reportCoords.longitude,
        descripcion: descripcion.trim() || undefined,
      });
      Toast.show({
        type: 'success',
        text1: 'Zona reportada',
        text2: 'Gracias por ayudar a mantener tu comunidad limpia.',
      });
      setReportModalVisible(false);
      setReportCoords(null);
      setDescripcion('');
      reload();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400) {
        Toast.show({ type: 'error', text1: 'Datos inválidos', text2: 'Revisa la información e inténtalo de nuevo.' });
      } else if (status === 401) {
        Toast.show({ type: 'error', text1: 'Sesión expirada', text2: 'Vuelve a iniciar sesión.' });
      } else {
        Toast.show({ type: 'error', text1: 'Error de conexión', text2: 'No se pudo enviar el reporte. Inténtalo de nuevo.' });
      }
    } finally {
      setSubmittingReport(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Cargando puntos del mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se pudieron cargar los puntos del mapa.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={reload}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={LIMA_REGION}
        region={userLocation ? { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 } : undefined}
        onLongPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          openReportModal(latitude, longitude);
        }}
      >
        {points.map((point) => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.nombre}
            description={point.tipo === 'ACOPIO_OFICIAL' ? 'Punto de acopio oficial' : 'Zona reportada por la comunidad'}
            pinColor={point.tipo === 'ACOPIO_OFICIAL' ? '#2e7d32' : '#c62828'}
          />
        ))}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Tu ubicación"
            pinColor="#1565c0"
          />
        )}
      </MapView>

      <View style={styles.hint}>
        <Text style={styles.hintText}>📍 Mantén presionado el mapa para reportar una zona sucia</Text>
      </View>

      <TouchableOpacity style={styles.locateBtn} onPress={centerOnUser} disabled={locatingUser}>
        {locatingUser
          ? <ActivityIndicator size="small" color="#fff" />
          : <Text style={styles.locateBtnText}>📍 Mi ubicación</Text>
        }
      </TouchableOpacity>

      <Modal visible={reportModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reportar zona sucia</Text>
            <Text style={styles.modalSubtitle}>
              {reportCoords
                ? `Lat: ${reportCoords.latitude.toFixed(5)}, Lon: ${reportCoords.longitude.toFixed(5)}`
                : ''}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Describe brevemente la situación (opcional)"
              value={descripcion}
              onChangeText={setDescripcion}
              maxLength={255}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReportModalVisible(false)}
                disabled={submittingReport}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitReport}
                disabled={submittingReport}
              >
                {submittingReport
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.modalSubmitBtnText}>Reportar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, color: '#555', fontSize: 14 },
  errorText: { color: '#c62828', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#2e7d32', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  hint: { position: 'absolute', top: 12, left: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 10, padding: 10 },
  hintText: { color: '#fff', fontSize: 12, textAlign: 'center' },
  locateBtn: { position: 'absolute', bottom: 24, right: 16, backgroundColor: '#1565c0', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 30, elevation: 4 },
  locateBtnText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#555', marginBottom: 16 },
  modalInput: { borderWidth: 1.5, borderColor: '#ccc', borderRadius: 10, padding: 12, fontSize: 14, minHeight: 70, textAlignVertical: 'top', marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#999', alignItems: 'center' },
  modalCancelBtnText: { color: '#555', fontWeight: '600' },
  modalSubmitBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#c62828', alignItems: 'center' },
  modalSubmitBtnText: { color: '#fff', fontWeight: '600' },
});
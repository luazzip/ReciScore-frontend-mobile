import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, TextInput,
} from 'react-native';
import { CameraView } from 'expo-camera';
import Toast from 'react-native-toast-message';
import { useCamera } from '../hooks/useCamera';
import { useLocation } from '../hooks/useLocation';
import { MaterialPicker } from '../components/MaterialPicker';
import { SizePicker } from '../components/SizePicker';
import { getMaterials, Material } from '../services/materialService';
import { createRecyclingReport } from '../services/recyclingService';

type TamanoObjeto = 'PEQUENO' | 'MEDIANO' | 'GRANDE';

export function RegisterRecyclingScreen() {
  const { cameraRef, showCamera, setShowCamera, photoUri, uploadedPhotoUrl, uploading, openCamera, takePhoto, resetCamera } = useCamera();
  const { location, locationLoading, locationDenied, getLocation, resetLocation } = useLocation();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [tamano, setTamano] = useState<TamanoObjeto>('MEDIANO');
  const [cantidad, setCantidad] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMaterials()
      .then(setMaterials)
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar los materiales.' }))
      .finally(() => setMaterialsLoading(false));
  }, []);

  async function handleSubmit() {
    if (!photoUri || !uploadedPhotoUrl) {
      Toast.show({ type: 'error', text1: 'Foto requerida', text2: 'Debes tomar una foto del material.' });
      return;
    }
    if (!selectedMaterialId) {
      Toast.show({ type: 'error', text1: 'Material requerido', text2: 'Selecciona el tipo de material.' });
      return;
    }
    const cantidadNum = parseInt(cantidad, 10);
    if (!cantidad || isNaN(cantidadNum) || cantidadNum < 1) {
      Toast.show({ type: 'error', text1: 'Cantidad inválida', text2: 'Ingresa una cantidad válida (mínimo 1).' });
      return;
    }
    if (!location && !locationDenied) {
      Toast.show({ type: 'error', text1: 'Ubicación requerida', text2: 'Obtén tu ubicación GPS antes de registrar.' });
      return;
    }

    setSubmitting(true);
    try {
      await createRecyclingReport({
        userId: 0,
        materialId: selectedMaterialId,
        fotoUrl: uploadedPhotoUrl,
        tamanoObjeto: tamano,
        numeroArticulos: cantidadNum,
        latitud: location?.latitude ?? 0,
        longitud: location?.longitude ?? 0,
      });
      Toast.show({ type: 'success', text1: '¡Reciclaje registrado!', text2: 'Ganaste puntos por tu acción. ¡Gracias!' });
      resetCamera();
      resetLocation();
      setSelectedMaterialId(null);
      setTamano('MEDIANO');
      setCantidad('1');
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 400) {
        Toast.show({ type: 'error', text1: 'Datos inválidos', text2: 'Revisa los campos e inténtalo de nuevo.' });
      } else if (status === 401) {
        Toast.show({ type: 'error', text1: 'Sesión expirada', text2: 'Vuelve a iniciar sesión.' });
      } else if (status >= 500) {
        Toast.show({ type: 'error', text1: 'Error del servidor', text2: 'El servicio no está disponible. Inténtalo más tarde.' });
      } else {
        Toast.show({ type: 'error', text1: 'Error de conexión', text2: 'Revisa tu internet e inténtalo de nuevo.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing="back" ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Registrar Reciclaje</Text>
      <Text style={styles.subtitle}>Valida tu acción para ganar puntos</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📷 Foto del material</Text>
        <TouchableOpacity style={[styles.photoBtn, photoUri && styles.photoBtnDone]} onPress={openCamera}>
          <Text style={styles.photoBtnText}>
            {photoUri ? '✅ Foto tomada — toca para cambiar' : 'Tomar foto'}
          </Text>
        </TouchableOpacity>
        {uploading && (
          <View style={styles.row}>
            <ActivityIndicator size="small" color="#2e7d32" />
            <Text style={styles.uploadingText}>Subiendo foto...</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>♻️ Tipo de material</Text>
        <MaterialPicker
          materials={materials}
          loading={materialsLoading}
          selectedId={selectedMaterialId}
          onSelect={setSelectedMaterialId}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Tamaño del objeto</Text>
        <SizePicker selected={tamano} onSelect={setTamano} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔢 Cantidad de artículos</Text>
        <TextInput
          style={styles.input}
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
          placeholder="Ej: 3"
          maxLength={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Ubicación GPS</Text>
        {location && (
          <Text style={styles.locationText}>
            ✅ Lat: {location.latitude.toFixed(5)}, Lon: {location.longitude.toFixed(5)}
          </Text>
        )}
        {locationDenied && (
          <Text style={styles.warningText}>
            ⚠️ Permiso denegado — el reciclaje se registrará sin ubicación.
          </Text>
        )}
        <TouchableOpacity
          style={[styles.gpsBtn, locationLoading && styles.gpsBtnDisabled]}
          onPress={getLocation}
          disabled={locationLoading}
        >
          {locationLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.gpsBtnText}>{location ? 'Actualizar ubicación' : 'Obtener ubicación'}</Text>
          }
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator size="small" color="#fff" />
          : <Text style={styles.submitBtnText}>Validar y Ganar Puntos →</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1b5e20', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2e2e2e', marginBottom: 10 },
  photoBtn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 12, alignItems: 'center' },
  photoBtnDone: { backgroundColor: '#388e3c' },
  photoBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  uploadingText: { color: '#555', fontSize: 13, marginLeft: 8 },
  input: { borderWidth: 1.5, borderColor: '#ccc', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  locationText: { color: '#2e7d32', fontSize: 13, marginBottom: 10 },
  warningText: { color: '#e65100', fontSize: 13, marginBottom: 10 },
  gpsBtn: { backgroundColor: '#1565c0', padding: 14, borderRadius: 12, alignItems: 'center' },
  gpsBtnDisabled: { backgroundColor: '#90a4ae' },
  gpsBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  submitBtn: { backgroundColor: '#2e7d32', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { backgroundColor: '#a5d6a7' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraControls: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center', gap: 20 },
  captureBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#2e7d32' },
  cancelBtn: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  cancelBtnText: { color: '#fff', fontWeight: '600' },
});
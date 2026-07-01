import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView } from 'expo-camera';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';
import { useCamera } from '../hooks/useCamera';
import { useLocation } from '../hooks/useLocation';
import { MaterialPicker } from '../components/MaterialPicker';
import { SizePicker } from '../components/SizePicker';
import { getMaterials, Material } from '../services/materialService';
import { createRecyclingReport } from '../services/recyclingService';
import { colors, radius } from '../styles/theme';

type TamanoObjeto = 'PEQUENO' | 'MEDIANO' | 'GRANDE';

export function RegisterRecyclingScreen() {
  const {
    cameraRef,
    showCamera,
    setShowCamera,
    photoUri,
    uploadedPhotoUrl,
    uploading,
    openCamera,
    takePhoto,
    resetCamera,
  } = useCamera();

  const {
    location,
    locationLoading,
    locationDenied,
    getLocation,
    resetLocation,
  } = useLocation();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [tamano, setTamano] = useState<TamanoObjeto>('MEDIANO');
  const [cantidad, setCantidad] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const estimatedWeight = getEstimatedWeight(cantidad, tamano);

  useEffect(() => {
    getMaterials()
      .then(setMaterials)
      .catch(() =>
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudieron cargar los materiales.',
        })
      )
      .finally(() => setMaterialsLoading(false));
  }, []);

  function increaseQuantity() {
    setCantidad((current) => Math.min(current + 1, 99));
  }

  function decreaseQuantity() {
    setCantidad((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit() {
    if (!photoUri || !uploadedPhotoUrl) {
      Toast.show({
        type: 'error',
        text1: 'Foto requerida',
        text2: 'Debes tomar una foto del material.',
      });
      return;
    }

    if (!selectedMaterialId) {
      Toast.show({
        type: 'error',
        text1: 'Material requerido',
        text2: 'Selecciona el tipo de material.',
      });
      return;
    }

    if (!location) {
      Toast.show({
        type: 'error',
        text1: 'Ubicación requerida',
        text2: locationDenied
          ? 'Activa el permiso de ubicación para validar puntos en la demo.'
          : 'Obtén tu ubicación GPS antes de registrar.',
      });
      return;
    }

    setSubmitting(true);

    try {
      const report = await createRecyclingReport({
        materialId: selectedMaterialId,
        fotoUrl: uploadedPhotoUrl,
        tamanoObjeto: tamano,
        numeroArticulos: cantidad,
        latitud: location.latitude,
        longitud: location.longitude,
      });

      Toast.show({
        type: 'success',
        text1: report.validadoIa && report.gpsValidado ? '¡Reciclaje validado!' : 'Reciclaje registrado',
        text2: report.validadoIa && report.gpsValidado
          ? 'La IA y la ubicación fueron validadas. Tus puntos se actualizarán.'
          : 'Quedó guardado, pero falta validación de IA o GPS para sumar puntos.',
      });

      resetCamera();
      resetLocation();
      setSelectedMaterialId(null);
      setTamano('MEDIANO');
      setCantidad(1);
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 400) {
        Toast.show({
          type: 'error',
          text1: 'Datos inválidos',
          text2: 'Revisa los campos e inténtalo de nuevo.',
        });
      } else if (status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Sesión expirada',
          text2: 'Vuelve a iniciar sesión.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error de conexión',
          text2: 'No se pudo registrar el reciclaje.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (showCamera) {
  return (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} />
      <View style={styles.cameraControls}>
        <Pressable style={styles.cancelBtn} onPress={() => setShowCamera(false)}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </Pressable>
        <Pressable style={styles.captureBtn} onPress={takePhoto}>
          <View style={styles.captureBtnInner} />
        </Pressable>
      </View>
    </View>
  );
}

  return (
    <View style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.logo}>ReciScore</Text>

        <View style={styles.headerRight}>
          <Text style={styles.notificationIcon}>🔔</Text>

          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>4,250 pts</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Registrar Residuos</Text>
          <Text style={styles.subtitle}>
            Valida tus materiales con IA para maximizar tus Eco-Points.
          </Text>
        </View>

        <Pressable style={styles.photoCard} onPress={openCamera}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <>
              <View style={styles.cameraIconBox}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>

              <Text style={styles.photoTitle}>Sube o Toma una Foto</Text>
              <Text style={styles.photoSubtitle}>
                Captura el residuo directamente para validarlo.
              </Text>
            </>
          )}

          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>⚡ IA ACTIVA</Text>
          </View>
        </Pressable>

        {uploading && (
          <View style={styles.uploadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadingText}>Subiendo foto...</Text>
          </View>
        )}

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>ESTADÍSTICAS DE IA</Text>
            <Text style={styles.aiStatus}>Análisis en tiempo real</Text>
          </View>

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>CONFIANZA DE OBJETO</Text>
            <Text style={styles.confidenceValue}>{photoUri ? '98.4%' : '0%'}</Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: photoUri ? '98%' : '0%' }]} />
          </View>

          <View style={styles.aiGrid}>
            <View style={styles.aiMiniCard}>
              <Text style={styles.aiMiniLabel}>MATERIAL DETECTADO</Text>
              <Text style={styles.aiMiniValue}>
                {selectedMaterialId ? 'Seleccionado' : 'Pendiente'}
              </Text>
            </View>

            <View style={styles.aiMiniCard}>
              <Text style={styles.aiMiniLabel}>ESTADO</Text>
              <Text style={styles.aiMiniValue}>
                {photoUri ? 'Limpio / Seco' : 'Sin foto'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de material</Text>

          <MaterialPicker
            materials={materials}
            loading={materialsLoading}
            selectedId={selectedMaterialId}
            onSelect={setSelectedMaterialId}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tamaño del objeto</Text>

          <SizePicker selected={tamano} onSelect={setTamano} />
        </View>

        <View style={styles.counterCard}>
          <View>
            <Text style={styles.counterTitle}>Cantidad de ítems</Text>
            <Text style={styles.counterSubtitle}>Unidades individuales</Text>
          </View>

          <View style={styles.counterControls}>
            <Pressable style={styles.counterButtonSecondary} onPress={decreaseQuantity}>
              <Text style={styles.counterButtonTextSecondary}>−</Text>
            </Pressable>

            <Text style={styles.counterValue}>{cantidad}</Text>

            <Pressable style={styles.counterButtonPrimary} onPress={increaseQuantity}>
              <Text style={styles.counterButtonTextPrimary}>＋</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.weightSection}>
          <View style={styles.weightHeader}>
            <View>
              <Text style={styles.counterTitle}>Peso Estimado</Text>
              <Text style={styles.counterSubtitle}>Calculado según tamaño y cantidad</Text>
            </View>

            <View style={styles.weightValueBox}>
              <Text style={styles.weightValue}>{estimatedWeight}</Text>
              <Text style={styles.weightUnit}>kg</Text>
            </View>
          </View>

          <View style={styles.weightBarBackground}>
            <View
              style={[
                styles.weightBarFill,
                { width: `${Math.min(Number(estimatedWeight) * 12, 100)}%` },
              ]}
            />
          </View>

          <View style={styles.weightScale}>
            <Text style={styles.weightScaleText}>0.1 kg</Text>
            <Text style={styles.weightScaleText}>5.0 kg</Text>
            <Text style={styles.weightScaleText}>10.0 kg</Text>
          </View>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>Ubicación GPS</Text>

          {location && (
            <Text style={styles.locationText}>
              ✅ Lat: {location.latitude.toFixed(5)}, Lon: {location.longitude.toFixed(5)}
            </Text>
          )}

          {locationDenied && (
            <Text style={styles.warningText}>
              ⚠️ Permiso denegado — no se podrá validar ni sumar puntos hasta activar GPS.
            </Text>
          )}

          <Pressable
            style={[styles.gpsButton, locationLoading && styles.disabledButton]}
            onPress={getLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.gpsButtonText}>
                {location ? 'Actualizar ubicación' : 'Obtener ubicación'}
              </Text>
            )}
          </Pressable>
        </View>

        <Pressable
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>✅ VALIDAR Y SUMAR PUNTOS</Text>
          )}
        </Pressable>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>ℹ️ Instrucciones de Registro</Text>

          <Instruction number="1" text="Asegúrate de que los envases estén vacíos y limpios." />
          <Instruction number="2" text="Toma la foto desde arriba con buena iluminación natural." />
          <Instruction number="3" text="Verifica que el material detectado coincida con tu residuo." />
        </View>
      </ScrollView>

    </View>
  );
}

function getEstimatedWeight(cantidad: number, tamano: TamanoObjeto) {
  const baseWeight = {
    PEQUENO: 0.08,
    MEDIANO: 0.125,
    GRANDE: 0.25,
  };

  return (cantidad * baseWeight[tamano]).toFixed(1);
}

type InstructionProps = {
  number: string;
  text: string;
};

function Instruction({ number, text }: InstructionProps) {
  return (
    <View style={styles.instructionRow}>
      <View style={styles.instructionNumber}>
        <Text style={styles.instructionNumberText}>{number}</Text>
      </View>

      <Text style={styles.instructionText}>{text}</Text>
    </View>
  );
}

type BottomNavItemProps = {
  icon: string;
  label: string;
};

function BottomNavItem({ icon, label }: BottomNavItemProps) {
  return (
    <Pressable style={styles.navItem}>
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={styles.navLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 72,
    paddingTop: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.surfaceHigh,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.primary,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  notificationIcon: {
    fontSize: 21,
  },

  pointsBadge: {
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },

  pointsBadgeText: {
    color: '#594a00',
    fontWeight: '900',
    fontSize: 13,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },

  titleSection: {
    marginBottom: 28,
  },

  title: {
    fontSize: 31,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },

  photoCard: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#aaaeac',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    marginBottom: 14,
    overflow: 'hidden',
  },

  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
  },

  cameraIconBox: {
    backgroundColor: colors.primaryLight,
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  cameraIcon: {
    fontSize: 34,
  },

  photoTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  photoSubtitle: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  aiBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },

  aiBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },

  uploadingText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },

  aiCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#aaaeac22',
  },

  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },

  aiTitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '900',
    letterSpacing: 1,
  },

  aiStatus: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },

  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  confidenceLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.text,
  },

  confidenceValue: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
  },

  progressBackground: {
    height: 8,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: 16,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },

  aiGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  aiMiniCard: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.md,
    padding: 14,
  },

  aiMiniLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 5,
  },

  aiMiniValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },

  section: {
    marginBottom: 26,
  },

  sectionTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },

  counterCard: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  counterTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },

  counterSubtitle: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 12,
  },

  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  counterButtonSecondary: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterButtonPrimary: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterButtonTextSecondary: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: '900',
  },

  counterButtonTextPrimary: {
    color: '#d1ffc8',
    fontSize: 22,
    fontWeight: '900',
  },

  counterValue: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    minWidth: 32,
    textAlign: 'center',
  },

  weightSection: {
    marginBottom: 28,
  },

  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
    gap: 12,
  },

  weightValueBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  weightValue: {
    color: colors.primary,
    fontSize: 38,
    fontWeight: '900',
  },

  weightUnit: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },

  weightBarBackground: {
    height: 8,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.full,
    overflow: 'hidden',
  },

  weightBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  weightScale: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  weightScaleText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },

  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 24,
  },

  locationText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },

  warningText: {
    color: '#b92902',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },

  gpsButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
  },

  gpsButtonText: {
    color: '#bbfffe',
    fontWeight: '900',
    fontSize: 14,
  },

  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 36,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 6,
  },

  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  disabledButton: {
    opacity: 0.7,
  },

  instructionsCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: 22,
    marginBottom: 30,
  },

  instructionsTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 16,
  },

  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },

  instructionNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  instructionNumberText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 12,
  },

  instructionText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 84,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 12,
  },

  navItem: {
    width: 64,
    alignItems: 'center',
  },

  navIcon: {
    fontSize: 20,
    color: '#57534e',
  },

  navLabel: {
    marginTop: 4,
    color: '#57534e',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  centerAction: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    marginTop: -36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },

  centerActionIcon: {
    color: colors.white,
    fontSize: 27,
  },

  cameraContainer: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  cameraControls: {
    position: 'absolute',
    bottom: 42,
    width: '100%',
    alignItems: 'center',
    gap: 22,
  },

  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },

  cancelBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: radius.full,
  },

  cancelBtnText: {
    color: colors.white,
    fontWeight: '800',
  },
});
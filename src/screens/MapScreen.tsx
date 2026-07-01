import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useMapPoints } from '../hooks/useMapPoints';
import { useCurrentUser } from '../hooks/useCurrentUser';
//service de reportezona
import { createReporteZona } from '../services/reporteZonaService';
import { colors, radius } from '../styles/theme';

const LIMA_REGION: Region = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type FilterType = 'TODOS' | 'ACOPIO_OFICIAL' | 'ZONA_SUCIA' | 'ZONA_REPORTADA';

export function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
  const { points, loading, error, reload } = useMapPoints();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('TODOS');
  const [search, setSearch] = useState('');
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportCoords, setReportCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const { user } = useCurrentUser();

  const filteredPoints = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return points.filter((point) => {
      const matchesSearch =
        !normalizedSearch ||
        point.nombre.toLowerCase().includes(normalizedSearch) ||
        point.tipo.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        selectedFilter === 'TODOS' ||
        point.tipo.toUpperCase() === selectedFilter ||
        (selectedFilter === 'ZONA_REPORTADA' && point.tipo.toUpperCase() === 'ZONA_SUCIA');

      return matchesSearch && matchesFilter;
    });
  }, [points, search, selectedFilter]);

  const selectedPoint = points.find((point) => point.id === selectedPointId);

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

      const coords = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const location = {
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      };

      setUserLocation(location);

      mapRef.current?.animateToRegion(
        {
          ...location,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
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
      Toast.show({
        type: 'error',
        text1: 'Ubicación requerida',
        text2: 'Toca un punto del mapa primero.',
      });
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
        Toast.show({
          type: 'error',
          text1: 'Datos inválidos',
          text2: 'Revisa la información e inténtalo de nuevo.',
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
          text2: 'No se pudo enviar el reporte. Inténtalo de nuevo.',
        });
      }
    } finally {
      setSubmittingReport(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando puntos del mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se pudieron cargar los puntos del mapa.</Text>

        <Pressable style={styles.retryButton} onPress={reload}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={LIMA_REGION}
        onPress={() => setSelectedPointId(null)}
        onLongPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          openReportModal(latitude, longitude);
        }}
      >
        {filteredPoints.map((point) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            title={point.nombre}
            description={
              point.tipo === 'ACOPIO_OFICIAL'
                ? 'Punto de acopio oficial'
                : 'Zona reportada por la comunidad'
            }
            pinColor={point.tipo === 'ACOPIO_OFICIAL' ? colors.primary : '#b02500'}
            onPress={() => setSelectedPointId(point.id)}
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

      <View style={styles.header}>
        <Text style={styles.logo}>ReciScore</Text>

        <View style={styles.headerRight}>
          <Text style={styles.notificationIcon}>🔔</Text>

          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>{user?.points?.toLocaleString('es-PE') ?? '0'} pts</Text>
          </View>
        </View>
      </View>

      <View style={styles.topOverlay}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔎</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar puntos de reciclaje..."
            placeholderTextColor="#747876"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          <FilterChip
            label="Todos"
            icon="⚙️"
            active={selectedFilter === 'TODOS'}
            onPress={() => setSelectedFilter('TODOS')}
          />

          <FilterChip
            label="Acopio"
            icon="📍"
            active={selectedFilter === 'ACOPIO_OFICIAL'}
            onPress={() => setSelectedFilter('ACOPIO_OFICIAL')}
          />

          <FilterChip
            label="Reportes"
            icon="⚠️"
            active={selectedFilter === 'ZONA_REPORTADA'}
            onPress={() => setSelectedFilter('ZONA_REPORTADA')}
          />
        </ScrollView>
      </View>

      <View style={styles.bottomControls}>
        <Pressable
          style={styles.reportButton}
          onPress={() => {
            Alert.alert(
              'Reportar basura',
              'Mantén presionado el punto del mapa donde quieres reportar una zona sucia.'
            );
          }}
        >
          <Text style={styles.reportButtonIcon}>⚠️</Text>
          <Text style={styles.reportButtonText}>REPORTAR BASURA</Text>
        </Pressable>

        <Pressable
          style={styles.locationButton}
          onPress={centerOnUser}
          disabled={locatingUser}
        >
          {locatingUser ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.locationButtonText}>⌖</Text>
          )}
        </Pressable>

        {selectedPoint && (
          <View style={styles.detailCard}>
            <View style={styles.detailAccent} />

            <View style={styles.detailHeader}>
              <View style={styles.detailTitleContainer}>
                <Text style={styles.detailTitle}>{selectedPoint.nombre}</Text>

                <Text style={styles.detailSubtitle}>
                  {selectedPoint.tipo === 'ACOPIO_OFICIAL'
                    ? 'Punto de acopio oficial'
                    : 'Zona sucia o reportada por la comunidad'}
                </Text>
              </View>

              <Pressable onPress={() => setSelectedPointId(null)}>
                <Text style={styles.closeButton}>×</Text>
              </Pressable>
            </View>

            <View style={styles.detailCommunityRow}>
              <View style={styles.avatarStack}>
                <View style={styles.smallAvatar}>
                  <Text style={styles.smallAvatarText}>🌱</Text>
                </View>

                <View style={[styles.smallAvatar, styles.smallAvatarOverlap]}>
                  <Text style={styles.smallAvatarText}>♻️</Text>
                </View>
              </View>

              <Text style={styles.communityText}>+12 Eco-Warriors aquí hoy</Text>
            </View>

            <View style={styles.detailStatsGrid}>
              <View style={styles.detailStatBox}>
                <Text style={styles.detailStatLabel}>RECOMPENSA</Text>
                <Text style={styles.detailStatValue}>⭐ +150 pts</Text>
              </View>

              <View style={styles.detailStatBox}>
                <Text style={styles.detailStatLabel}>ESTADO</Text>
                <Text style={styles.detailStatValueSecondary}>✓ Disponible</Text>
              </View>
            </View>

            <Pressable
              style={styles.routeButton}
              onPress={() => {
                mapRef.current?.animateToRegion(
                  {
                    latitude: selectedPoint.latitude,
                    longitude: selectedPoint.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  500
                );
              }}
            >
              <Text style={styles.routeButtonText}>CÓMO LLEGAR</Text>
            </Pressable>
          </View>
        )}
      </View>


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
              placeholderTextColor="#747876"
              value={descripcion}
              onChangeText={setDescripcion}
              maxLength={255}
              multiline
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setReportModalVisible(false)}
                disabled={submittingReport}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.modalSubmitButton}
                onPress={handleSubmitReport}
                disabled={submittingReport}
              >
                {submittingReport ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Reportar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type FilterChipProps = {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
};

function FilterChip({ label, icon, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={styles.filterIcon}>{icon}</Text>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  map: {
    ...StyleSheet.absoluteFill,
  },

  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },

  errorText: {
    color: '#b02500',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },

  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.lg,
  },

  retryButtonText: {
    color: colors.white,
    fontWeight: '800',
  },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    paddingTop: 14,
    paddingHorizontal: 24,
    backgroundColor: '#f4f7f5ee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },

  logo: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.8,
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
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
  },

  pointsBadgeText: {
    fontSize: 13,
    color: '#005c15',
    fontWeight: '900',
  },

  topOverlay: {
    position: 'absolute',
    top: 84,
    left: 16,
    right: 16,
    zIndex: 15,
  },

  searchBar: {
    backgroundColor: '#f4f7f5dd',
    minHeight: 56,
    borderRadius: radius.full,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },

  searchIcon: {
    fontSize: 18,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },

  filtersRow: {
    gap: 10,
    paddingTop: 14,
    paddingBottom: 4,
  },

  filterChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  filterChipActive: {
    backgroundColor: colors.primary,
  },

  filterIcon: {
    fontSize: 14,
  },

  filterText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  filterTextActive: {
    color: colors.white,
  },

  bottomControls: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 92,
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 15,
  },

  reportButton: {
    backgroundColor: '#f95630',
    borderRadius: radius.full,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#b02500',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },

  reportButtonIcon: {
    fontSize: 17,
  },

  reportButtonText: {
    color: '#520c00',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  locationButton: {
    backgroundColor: colors.surface,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 5,
  },

  locationButtonText: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },

  detailCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.10,
    shadowRadius: 26,
    elevation: 8,
  },

  detailAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: colors.primary,
  },

  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },

  detailTitleContainer: {
    flex: 1,
  },

  detailTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  detailSubtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },

  closeButton: {
    color: colors.outline,
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 30,
  },

  detailCommunityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  avatarStack: {
    width: 52,
    flexDirection: 'row',
    marginRight: 8,
  },

  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallAvatarOverlap: {
    marginLeft: -10,
  },

  smallAvatarText: {
    fontSize: 15,
  },

  communityText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  detailStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  detailStatBox: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.md,
    padding: 14,
  },

  detailStatLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 5,
  },

  detailStatValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },

  detailStatValueSecondary: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '900',
  },

  routeButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },

  routeButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 84,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 12,
  },

  navItem: {
    width: 64,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    fontSize: 20,
    color: '#57534e',
  },

  navLabel: {
    marginTop: 3,
    color: '#57534e',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  mapNavButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1.08 }],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },

  mapNavIcon: {
    fontSize: 26,
    color: colors.white,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
  },

  modalInput: {
    borderWidth: 1.5,
    borderColor: colors.outlineLight,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 16,
    color: colors.text,
    backgroundColor: colors.surfaceLow,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  modalCancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: 'center',
  },

  modalCancelButtonText: {
    color: colors.textMuted,
    fontWeight: '800',
  },

  modalSubmitButton: {
    flex: 1,
    padding: 15,
    borderRadius: radius.md,
    backgroundColor: '#b02500',
    alignItems: 'center',
  },

  modalSubmitButtonText: {
    color: colors.white,
    fontWeight: '800',
  },
});
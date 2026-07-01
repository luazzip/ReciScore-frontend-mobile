import { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFetch } from '../hooks/useFetch';
import { getRecyclingHistoryByUser } from '../services/recyclingService';
import { RecyclingReport } from '../types/recycling';
import { colors, radius } from '../styles/theme';
import { useCurrentUser } from '../hooks/useCurrentUser';

const PAGE_SIZE = 5;

export function RecyclingHistoryScreen({ userId }: { userId: number }) {
  const { user } = useCurrentUser();
  const {
    data: reports,
    isLoading,
    error,
    refetch,
  } = useFetch(() => getRecyclingHistoryByUser(userId), [userId]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const totalItems =
    reports?.reduce((sum, report) => sum + report.numeroArticulos, 0) ?? 0;
  const totalReports = reports?.length ?? 0;
  const plasticReports =
    reports?.filter((report) =>
      report.materialNombre.toLowerCase().includes('plástico') ||
      report.materialNombre.toLowerCase().includes('plastico')
    ).length ?? 0;
  const paperReports =
    reports?.filter((report) =>
      report.materialNombre.toLowerCase().includes('papel') ||
      report.materialNombre.toLowerCase().includes('cartón') ||
      report.materialNombre.toLowerCase().includes('carton')
    ).length ?? 0;

  const visibleReports = useMemo(
    () => (reports ?? []).slice(0, visibleCount),
    [reports, visibleCount]
  );

  const hasMore = (reports?.length ?? 0) > visibleCount;
  const allVisible = !hasMore && (reports?.length ?? 0) > 0;

  function loadMore() {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.logo}>ReciScore</Text>
        <View style={styles.headerRight}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>⭐ {user?.points.toLocaleString() ?? 0} pts</Text>
          </View>
          <Pressable>
            <Text style={styles.notificationIcon}>🔔</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={visibleReports}
        keyExtractor={(item) => item.numeroReporte.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.titleSection}>
              <Text style={styles.title}>
                Tu Impacto{'\n'}
                <Text style={styles.titleSecondary}>Historial de Reciclaje</Text>
              </Text>
            </View>
            <View style={styles.summaryGrid}>
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>TOTAL DE ARTÍCULOS REGISTRADOS</Text>
                <View style={styles.totalValueRow}>
                  <Text style={styles.totalValue}>{totalItems}</Text>
                  <Text style={styles.totalUnit}>ítems</Text>
                </View>
                <Text style={styles.totalDecor}>🌱</Text>
              </View>
              <View style={styles.smallSummaryCard}>
                <View style={styles.smallSummaryHeader}>
                  <View style={styles.smallSummaryIconBox}>
                    <Text style={styles.smallSummaryIcon}>♻️</Text>
                  </View>
                  <Text style={styles.smallSummaryBadge}>+12%</Text>
                </View>
                <Text style={styles.smallSummaryLabel}>Plástico</Text>
                <Text style={styles.smallSummaryValue}>{plasticReports} registros</Text>
              </View>
              <View style={styles.smallSummaryCard}>
                <View style={styles.smallSummaryHeader}>
                  <View style={styles.smallSummaryIconBoxYellow}>
                    <Text style={styles.smallSummaryIcon}>📄</Text>
                  </View>
                  <Text style={styles.smallSummaryBadgeYellow}>+5%</Text>
                </View>
                <Text style={styles.smallSummaryLabel}>Papel / Cartón</Text>
                <Text style={styles.smallSummaryValue}>{paperReports} registros</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersRow}
            >
              <Pressable style={styles.filterPrimary}>
                <Text style={styles.filterPrimaryText}>☰ FILTROS</Text>
              </Pressable>
              <View style={styles.filterDivider} />
              <Pressable style={styles.filterChip}>
                <Text style={styles.filterChipText}>Este Mes</Text>
              </Pressable>
              <Pressable style={styles.filterChip}>
                <Text style={styles.filterChipText}>Materiales</Text>
              </Pressable>
            </ScrollView>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>ACTIVIDAD RECIENTE</Text>
              <Text style={styles.activityBadge}>{totalReports} depósitos totales</Text>
            </View>
            {(!reports || reports.length === 0) && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📜</Text>
                <Text style={styles.emptyTitle}>Todavía no tienes reciclajes registrados.</Text>
                <Text style={styles.emptySubtitle}>
                  Registra tu primer residuo para comenzar a construir tu historial.
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => <HistoryCard report={item} />}
        ListFooterComponent={
          <>
            {hasMore && (
              <Pressable style={styles.loadMoreButton} onPress={loadMore}>
                <Text style={styles.loadMoreText}>VER MÁS</Text>
              </Pressable>
            )}
            {allVisible && (
              <View style={styles.footerEnd}>
                <Text style={styles.footerIcon}>📚</Text>
                <Text style={styles.footerText}>
                  Has llegado al fin de tu historial.
                </Text>
              </View>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
}

type HistoryCardProps = {
  report: RecyclingReport;
};

function HistoryCard({ report }: HistoryCardProps) {
  const isValidated = report.validadoIa;
  const points = calculatePoints(report.numeroArticulos, isValidated);
  const formattedDate = formatDate(report.fecha);

  return (
    <Pressable style={styles.historyCard}>
      <View style={styles.historyIconBox}>
        <Text style={styles.historyIcon}>
          {isValidated ? '♻️' : '🕒'}
        </Text>
      </View>
      <View style={styles.historyContent}>
        <View style={styles.historyTopRow}>
          <Text style={styles.historyTitle}>
            {report.materialNombre}
          </Text>
          <View style={[styles.statusBadge, !isValidated && styles.statusBadgePending]}>
            <Text style={[styles.statusText, !isValidated && styles.statusTextPending]}>
              {isValidated ? 'Validado' : 'Pendiente'}
            </Text>
          </View>
        </View>
        <Text style={styles.historySubtitle}>
          {formattedDate} • {report.numeroArticulos} artículos • {report.materialCategoria}
        </Text>
        <Text style={isValidated ? styles.pointsText : styles.pendingText}>
          {isValidated ? `＋${points} pts` : '⏱ Validando puntos...'}
        </Text>
        <Text style={styles.validationText}>
          {report.gpsValidado ? '📍 Ubicación válida' : '📍 Ubicación no validada'} ·{' '}
          {report.materialDetectadoIa ? 'IA detectó material' : 'IA pendiente'}
        </Text>
      </View>
    </Pressable>
  );
}

function calculatePoints(items: number, validated: boolean) {
  if (!validated) return 0;
  return items * 20;
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible';
  }
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontWeight: '600',
  },
  errorText: {
    color: '#b02500',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.lg,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '900',
  },
  header: {
    height: 64,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
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
    gap: 12,
  },
  pointsBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  pointsBadgeText: {
    color: '#005c15',
    fontSize: 12,
    fontWeight: '900',
  },
  notificationIcon: {
    fontSize: 21,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  titleSection: {
    marginBottom: 28,
  },
  title: {
    color: colors.primary,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
    letterSpacing: -1.3,
  },
  titleSecondary: {
    color: colors.textMuted,
    fontSize: 24,
    fontWeight: '800',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 26,
  },
  totalCard: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 24,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  totalLabel: {
    color: '#d1ffc8cc',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  totalValueRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  totalValue: {
    color: '#d1ffc8',
    fontSize: 40,
    fontWeight: '900',
  },
  totalUnit: {
    color: '#d1ffc8dd',
    fontSize: 18,
    fontWeight: '800',
  },
  totalDecor: {
    position: 'absolute',
    right: -16,
    bottom: -18,
    fontSize: 96,
    opacity: 0.12,
  },
  smallSummaryCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    borderBottomWidth: 4,
    borderBottomColor: '#8dedec55',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  smallSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  smallSummaryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00666618',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallSummaryIconBoxYellow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fdd40022',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallSummaryIcon: {
    fontSize: 18,
  },
  smallSummaryBadge: {
    backgroundColor: '#00666612',
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  smallSummaryBadgeYellow: {
    backgroundColor: '#6d5a0012',
    color: colors.tertiary,
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  smallSummaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  smallSummaryValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  filtersRow: {
    gap: 10,
    paddingBottom: 22,
  },
  filterPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  filterPrimaryText: {
    color: '#d1ffc8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  filterDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#aaaeac55',
    alignSelf: 'center',
  },
  filterChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#aaaeac33',
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  activityHeader: {
    paddingHorizontal: 4,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    color: colors.outline,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  activityBadge: {
    color: colors.primary,
    backgroundColor: '#176a2110',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  historyIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9df19733',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyIcon: {
    fontSize: 23,
  },
  historyContent: {
    flex: 1,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'flex-start',
  },
  historyTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  statusBadgePending: {
    backgroundColor: colors.tertiaryContainer,
  },
  statusText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusTextPending: {
    color: '#594a00',
  },
  historySubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  pointsText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 5,
  },
  pendingText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
    fontStyle: 'italic',
  },
  validationText: {
    color: colors.outline,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  loadMoreButton: {
    marginTop: 4,
    marginBottom: 8,
    marginHorizontal: 4,
    paddingVertical: 15,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  loadMoreText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerEnd: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 26,
  },
  footerIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 84,
    backgroundColor: '#f4f7f5dd',
    paddingHorizontal: 18,
    paddingBottom: 10,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 20,
    color: '#57534e',
  },
  navLabel: {
    color: '#57534e',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  activeNavItem: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
  },
  activeNavIcon: {
    color: colors.white,
    fontSize: 19,
  },
  activeNavLabel: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
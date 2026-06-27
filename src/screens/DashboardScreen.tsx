import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, radius } from '../styles/theme';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useFetch } from '../hooks/useFetch';
import { getUserById } from '../services/userService';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';

export function DashboardScreen({ navigation }: any) {
  const { userId, loading: loadingId } = useCurrentUser();
  const { data: user, isLoading, error, refetch } = useFetch(
    () => getUserById(userId as number),
    [userId]
  );

  if (loadingId || isLoading) {
    return <LoadingView label="Cargando tu panel..." />;
  }

  if (error || !user) {
    return <ErrorView message="No pudimos cargar tu información." onRetry={refetch} />;
  }

  const pointsToNextLevel = Math.max(0, user.nivel * 1000 - user.points);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.logo}>ReciScore</Text>

        <View style={styles.headerRight}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>{user.points.toLocaleString()} pts</Text>
          </View>

          <Pressable>
            <Text style={styles.notificationIcon}>🔔</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            ¡Hola, <Text style={styles.greetingHighlight}>{user.name}</Text>!
          </Text>

          <Text style={styles.greetingSubtitle}>
            {`Estás a ${pointsToNextLevel} pts de subir al Nivel ${user.nivel + 1}.`}
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroDecor}>
            <Text style={styles.heroDecorIcon}>🌱</Text>
          </View>

          <View>
            <Text style={styles.heroLabel}>BALANCE DE IMPACTO</Text>

            <View style={styles.pointsRow}>
              <Text style={styles.pointsNumber}>{user.points.toLocaleString()}</Text>
              <Text style={styles.pointsUnit}>RP</Text>
            </View>
          </View>

          <View>
            <View style={styles.levelRow}>
              <Text style={styles.levelText}>{`NIVEL ${user.nivel}: GUARDIÁN`}</Text>
              <Text style={styles.levelText}>85%</Text>
            </View>

            <View style={styles.progressBackground}>
              <View style={styles.progressFill} />
            </View>

            <Pressable style={styles.rewardButton}>
              <Text style={styles.rewardButtonText}>CANJEAR RECOMPENSAS</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Retos Diarios</Text>
          <Text style={styles.sectionLink}>VER TODOS</Text>
        </View>

        <View style={styles.challengeGrid}>
          <View style={styles.challengeCard}>
            <View style={styles.challengeIconGreen}>
              <Text style={styles.challengeIcon}>♻️</Text>
            </View>

            <View>
              <Text style={styles.challengeTitle}>3kg de Plástico</Text>
              <Text style={styles.challengeDescription}>
                Deposita botellas PET en el punto naranja.
              </Text>
            </View>

            <View style={styles.challengeProgressRow}>
              <View style={styles.challengeProgressBackground}>
                <View style={styles.challengeProgressFill} />
              </View>
              <Text style={styles.challengeProgressText}>2/3</Text>
            </View>
          </View>

          <View style={styles.challengeCard}>
            <View style={styles.challengeIconBlue}>
              <Text style={styles.challengeIcon}>🗺️</Text>
            </View>

            <View>
              <Text style={styles.challengeTitle}>Explora el Mapa</Text>
              <Text style={styles.challengeDescription}>
                Descubre 2 puntos de acopio nuevos.
              </Text>
            </View>

            <Pressable style={styles.mapButton} onPress={() => navigation.navigate('Mapa')}>
              <Text style={styles.mapButtonText}>IR AL MAPA</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>Tu Impacto Real</Text>

          <View style={styles.impactCard}>
            <View style={styles.impactMainRow}>
              <View style={styles.impactIconBox}>
                <Text style={styles.impactIcon}>🌍</Text>
              </View>

              <View>
                <Text style={styles.impactNumber}>12.4 kg</Text>
                <Text style={styles.impactLabel}>CO2 AHORRADO ESTE MES</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.statsGrid}>
              <View>
                <Text style={styles.statLabel}>● MATERIALES</Text>
                <Text style={styles.statValue}>45.2 kg</Text>
              </View>

              <View>
                <Text style={styles.statLabelYellow}>● AGUA AHORRADA</Text>
                <Text style={styles.statValue}>1.2k L</Text>
              </View>
            </View>

            <View style={styles.treeCard}>
              <Text style={styles.treeText}>
                Has salvado el equivalente a
              </Text>
              <Text style={styles.treeHighlight}>3 árboles maduros</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.rankingCard} onPress={() => navigation.navigate('Ranking')}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarEmoji}>🧑‍🌾</Text>

            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>12</Text>
            </View>
          </View>

          <View style={styles.rankingInfo}>
            <Text style={styles.rankingTitle}>Ver ranking completo</Text>
            <Text style={styles.rankingSubtitle}>
              Superaste a 45 usuarios ayer.
            </Text>
          </View>

          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </ScrollView>

      <Pressable style={styles.fab}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 64, paddingHorizontal: 24, backgroundColor: '#f4f7f5cc',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { fontSize: 21, fontWeight: '900', color: colors.primary, letterSpacing: -0.8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  pointsBadge: {
    backgroundColor: colors.tertiaryContainer, paddingHorizontal: 16,
    paddingVertical: 7, borderRadius: radius.full,
  },
  pointsBadgeText: { color: '#594a00', fontWeight: '900', fontSize: 13 },
  notificationIcon: { fontSize: 22 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 },
  greetingSection: { marginTop: 8, marginBottom: 24 },
  greetingTitle: {
    fontSize: 30, lineHeight: 36, fontWeight: '900',
    color: colors.text, letterSpacing: -1,
  },
  greetingHighlight: { color: colors.primary },
  greetingSubtitle: { marginTop: 4, color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  heroCard: {
    minHeight: 220, backgroundColor: colors.primary, borderRadius: radius.lg, padding: 28,
    justifyContent: 'space-between', overflow: 'hidden', shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.22, shadowRadius: 28,
    elevation: 8, marginBottom: 32,
  },
  heroDecor: { position: 'absolute', right: 16, top: 16, opacity: 0.18 },
  heroDecorIcon: { fontSize: 82 },
  heroLabel: { color: '#d1ffc8cc', fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  pointsNumber: { fontSize: 50, fontWeight: '900', color: '#d1ffc8', letterSpacing: -1.5 },
  pointsUnit: { fontSize: 18, fontWeight: '900', color: '#d1ffc8dd' },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  levelText: { color: '#d1ffc8dd', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  progressBackground: {
    height: 8, borderRadius: radius.full, backgroundColor: '#d1ffc833',
    overflow: 'hidden', marginBottom: 14,
  },
  progressFill: { width: '85%', height: '100%', backgroundColor: colors.secondaryLight, borderRadius: radius.full },
  rewardButton: { backgroundColor: colors.tertiaryContainer, borderRadius: radius.full, paddingVertical: 13, alignItems: 'center' },
  rewardButtonText: { color: '#594a00', fontWeight: '900', fontSize: 13, letterSpacing: 0.7 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  sectionLink: { fontSize: 11, fontWeight: '900', color: colors.primary, letterSpacing: 0.8 },
  challengeGrid: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  challengeCard: {
    flex: 1, minHeight: 170, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: 18, justifyContent: 'space-between', borderBottomWidth: 4, borderBottomColor: '#176a2133',
  },
  challengeIconGreen: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  challengeIconBlue: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center' },
  challengeIcon: { fontSize: 22 },
  challengeTitle: { fontSize: 14, fontWeight: '900', color: colors.text, lineHeight: 18 },
  challengeDescription: { marginTop: 4, fontSize: 10, color: colors.textMuted, lineHeight: 14 },
  challengeProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  challengeProgressBackground: { flex: 1, height: 6, backgroundColor: colors.surfaceHigh, borderRadius: radius.full, overflow: 'hidden' },
  challengeProgressFill: { width: '66%', height: '100%', backgroundColor: colors.primary },
  challengeProgressText: { fontSize: 10, fontWeight: '900', color: colors.primary },
  mapButton: { backgroundColor: colors.secondary, borderRadius: radius.full, paddingVertical: 8, alignItems: 'center' },
  mapButtonText: { color: '#bbfffe', fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  impactSection: { marginBottom: 24 },
  impactCard: { marginTop: 14, backgroundColor: colors.surfaceLow, borderRadius: radius.lg, padding: 22 },
  impactMainRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  impactIconBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  impactIcon: { fontSize: 25 },
  impactNumber: { fontSize: 25, fontWeight: '900', color: colors.text },
  impactLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '800', letterSpacing: 0.8 },
  separator: { height: 1, backgroundColor: '#aaaeac33', marginVertical: 20 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '900' },
  statLabelYellow: { color: colors.tertiary, fontSize: 10, fontWeight: '900' },
  statValue: { marginTop: 4, fontSize: 18, fontWeight: '900', color: colors.text },
  treeCard: { marginTop: 20, height: 120, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'flex-end', padding: 18 },
  treeText: { color: colors.white, fontSize: 11 },
  treeHighlight: { marginTop: 2, color: colors.primaryLight, fontSize: 15, fontWeight: '900' },
  rankingCard: { backgroundColor: colors.surfaceHighest, borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 26 },
  rankBadge: {
    position: 'absolute', right: -3, bottom: -3, width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.tertiary, borderWidth: 2, borderColor: colors.surfaceHighest,
    justifyContent: 'center', alignItems: 'center',
  },
  rankBadgeText: { color: '#fff2ce', fontSize: 9, fontWeight: '900' },
  rankingInfo: { flex: 1 },
  rankingTitle: { fontSize: 14, fontWeight: '900', color: colors.text },
  rankingSubtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 34, color: colors.primary },
  fab: {
    position: 'absolute', right: 24, bottom: 96, width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  fabText: { color: '#bbfffe', fontSize: 30, fontWeight: '700' },
});
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
import { getCurrentUserImpact } from '../services/userService';
import { getChallenges } from '../services/challengeService';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';

export function DashboardScreen({ navigation }: any) {
  const { user, loading, error, refetch } = useCurrentUser();

  const {
    data: impact,
    isLoading: impactLoading,
    error: impactError,
    refetch: refetchImpact,
  } = useFetch(getCurrentUserImpact, []);

  const { data: challenges } = useFetch(getChallenges, []);

  if (loading || impactLoading) {
    return <LoadingView label="Cargando tu panel..." />;
  }

  if (error || impactError || !user || !impact) {
    return (
      <ErrorView
        message="No pudimos cargar tu información. Revisa tu conexión e inténtalo de nuevo."
        onRetry={() => {
          refetch();
          refetchImpact();
        }}
      />
    );
  }

  const pointsToNextLevel = Math.max(0, user.nivel * 1000 - user.points);
  const currentLevelStart = Math.max(0, (user.nivel - 1) * 1000);
  const currentLevelProgress = Math.min(
    100,
    Math.round(((user.points - currentLevelStart) / 1000) * 100)
  );
  const topChallenges = (challenges ?? []).slice(0, 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.logo}>ReciScore</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsBadgeText}>{user.points.toLocaleString()} pts</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            ¡Hola, <Text style={styles.greetingHighlight}>{user.name}</Text>!
          </Text>
          <Text style={styles.greetingSubtitle}>
            {`Estás a ${pointsToNextLevel} pts de subir al Nivel ${user.nivel + 1}.`}
          </Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>BALANCE DE IMPACTO</Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsNumber}>{user.points.toLocaleString()}</Text>
            <Text style={styles.pointsUnit}>RP</Text>
          </View>
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>{`NIVEL ${user.nivel}`}</Text>
            <Text style={styles.levelText}>{currentLevelProgress}%</Text>
          </View>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${currentLevelProgress}%` }]} />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Registrar')}>
            <Text style={styles.primaryButtonText}>REGISTRAR RECICLAJE</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Retos activos</Text>
          <Pressable onPress={() => navigation.navigate('Ranking')}>
            <Text style={styles.sectionLink}>VER RANKING</Text>
          </Pressable>
        </View>

        <View style={styles.challengeGrid}>
          {topChallenges.length > 0 ? (
            topChallenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <Text style={styles.challengeIcon}>♻️</Text>
                <Text style={styles.challengeTitle}>{challenge.titulo}</Text>
                <Text style={styles.challengeDescription} numberOfLines={3}>
                  {challenge.descripcion ?? `Completa el reto y gana ${challenge.puntos} puntos.`}
                </Text>
                <Text style={styles.challengePoints}>+{challenge.puntos} pts</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No hay retos activos todavía.</Text>
              <Text style={styles.emptySubtitle}>Cuando el backend publique retos, aparecerán aquí.</Text>
            </View>
          )}
        </View>

        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>Tu Impacto Real</Text>
          <View style={styles.impactCard}>
            <View style={styles.impactMainRow}>
              <Text style={styles.impactIcon}>🌍</Text>
              <View>
                <Text style={styles.impactNumber}>{impact.co2SavedKg.toFixed(1)} kg</Text>
                <Text style={styles.impactLabel}>CO₂ AHORRADO ESTIMADO</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>MATERIALES</Text>
                <Text style={styles.statValue}>{impact.estimatedKg.toFixed(1)} kg</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>AGUA</Text>
                <Text style={styles.statValue}>{Math.round(impact.waterSavedLiters)} L</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>VALIDADOS</Text>
                <Text style={styles.statValue}>{impact.validatedReports}</Text>
              </View>
            </View>

            <View style={styles.treeCard}>
              <Text style={styles.treeText}>Equivalente aproximado a</Text>
              <Text style={styles.treeHighlight}>{impact.treesEquivalent.toFixed(1)} árboles maduros</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.rankingCard} onPress={() => navigation.navigate('Ranking')}>
          <Text style={styles.avatarEmoji}>🏆</Text>
          <View style={styles.rankingInfo}>
            <Text style={styles.rankingTitle}>Ver ranking completo</Text>
            <Text style={styles.rankingSubtitle}>Tus puntos se actualizan desde el backend.</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { height: 64, paddingHorizontal: 24, backgroundColor: '#f4f7f5cc', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: 21, fontWeight: '900', color: colors.primary, letterSpacing: -0.8 },
  pointsBadge: { backgroundColor: colors.tertiaryContainer, paddingHorizontal: 16, paddingVertical: 7, borderRadius: radius.full },
  pointsBadgeText: { color: '#594a00', fontWeight: '900', fontSize: 13 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 },
  greetingSection: { marginTop: 8, marginBottom: 24 },
  greetingTitle: { fontSize: 30, lineHeight: 36, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  greetingHighlight: { color: colors.primary },
  greetingSubtitle: { marginTop: 4, color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  heroCard: { minHeight: 220, backgroundColor: colors.primary, borderRadius: radius.lg, padding: 28, justifyContent: 'space-between', shadowColor: colors.primary, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.22, shadowRadius: 28, elevation: 8, marginBottom: 32 },
  heroLabel: { color: '#d1ffc8cc', fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  pointsNumber: { fontSize: 50, fontWeight: '900', color: '#d1ffc8', letterSpacing: -1.5 },
  pointsUnit: { fontSize: 18, fontWeight: '900', color: '#d1ffc8dd' },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 },
  levelText: { color: '#d1ffc8dd', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  progressBackground: { height: 8, borderRadius: radius.full, backgroundColor: '#d1ffc833', overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', backgroundColor: colors.secondaryLight, borderRadius: radius.full },
  primaryButton: { backgroundColor: colors.tertiaryContainer, borderRadius: radius.full, paddingVertical: 13, alignItems: 'center' },
  primaryButtonText: { color: '#594a00', fontWeight: '900', fontSize: 13, letterSpacing: 0.7 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  sectionLink: { fontSize: 11, fontWeight: '900', color: colors.primary, letterSpacing: 0.8 },
  challengeGrid: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  challengeCard: { flex: 1, minHeight: 170, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, justifyContent: 'space-between', borderBottomWidth: 4, borderBottomColor: '#176a2133' },
  challengeIcon: { fontSize: 22 },
  challengeTitle: { fontSize: 14, fontWeight: '900', color: colors.text, lineHeight: 18 },
  challengeDescription: { marginTop: 4, fontSize: 10, color: colors.textMuted, lineHeight: 14 },
  challengePoints: { color: colors.primary, fontWeight: '900', fontSize: 12 },
  impactSection: { marginBottom: 24 },
  impactCard: { marginTop: 14, backgroundColor: colors.surfaceLow, borderRadius: radius.lg, padding: 22 },
  impactMainRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  impactIcon: { fontSize: 35 },
  impactNumber: { fontSize: 25, fontWeight: '900', color: colors.text },
  impactLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '800', letterSpacing: 0.8 },
  separator: { height: 1, backgroundColor: '#aaaeac33', marginVertical: 20 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1 },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '900' },
  statValue: { marginTop: 4, fontSize: 18, fontWeight: '900', color: colors.text },
  treeCard: { marginTop: 20, borderRadius: radius.lg, backgroundColor: colors.primary, padding: 18 },
  treeText: { color: '#d1ffc8dd', fontSize: 13, fontWeight: '700' },
  treeHighlight: { marginTop: 3, color: '#d1ffc8', fontSize: 20, fontWeight: '900' },
  rankingCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarEmoji: { fontSize: 34 },
  rankingInfo: { flex: 1 },
  rankingTitle: { fontSize: 16, fontWeight: '900', color: colors.text },
  rankingSubtitle: { marginTop: 3, color: colors.textMuted, fontWeight: '600', fontSize: 12 },
  chevron: { fontSize: 34, color: colors.primary, fontWeight: '300' },
  emptyCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18 },
  emptyTitle: { color: colors.text, fontWeight: '900', fontSize: 15 },
  emptySubtitle: { color: colors.textMuted, marginTop: 4, fontSize: 12 },
});

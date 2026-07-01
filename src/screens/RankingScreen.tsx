import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors, radius } from "../styles/theme";
import { ErrorView } from "../components/ErrorView";
import { useFetch } from "../hooks/useFetch";
import { getRanking, RankingUser } from "../services/rankingService";

export function RankingScreen() {
  const { data: ranking, isLoading, error, refetch } = useFetch(getRanking, []);
  const users = ranking ?? [];
  const topUsers = users.slice(0, 10);
  const totalPoints = users.reduce((sum, user) => sum + user.points, 0);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centeredStateText}>Cargando ranking...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return <ErrorView message={error} onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.logo}>ReciScore</Text>

        <View style={styles.headerRight}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>🏆 Top {users.length}</Text>
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
        <View style={styles.titleSection}>
          <Text style={styles.title}>Recicladores de Élite</Text>

          <Text style={styles.subtitle}>
            Ranking real generado desde el backend según puntos acumulados.
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <Text style={styles.summaryIcon}>🌱</Text>
            <Text style={styles.summaryValue}>{users.length}</Text>
            <Text style={styles.summaryLabel}>USUARIOS</Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardYellow]}>
            <Text style={styles.summaryIcon}>🏅</Text>
            <Text style={styles.summaryValue}>{totalPoints}</Text>
            <Text style={styles.summaryLabel}>PTS TOTALES</Text>
          </View>
        </View>

        <View style={styles.rankingSection}>
          <Text style={styles.sectionLabel}>TOP CONTRIBUYENTES</Text>

          <View style={styles.rankingList}>
            {topUsers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🏆</Text>
                <Text style={styles.emptyTitle}>
                  Aún no hay usuarios en el ranking.
                </Text>
                <Text style={styles.emptySubtitle}>
                  Registra un reciclaje validado para aparecer aquí.
                </Text>
              </View>
            ) : (
              topUsers.map((user) => (
                <RankingRow key={user.userId} user={user} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type BadgeProps = {
  icon: string;
  title: string;
  color?: string;
  locked?: boolean;
};


type RankingRowProps = {
  user: RankingUser;
};

function RankingRow({ user }: RankingRowProps) {
  const first = user.posicion === 1;
  const avatar =
    user.posicion === 1
      ? "👑"
      : user.posicion === 2
        ? "🥈"
        : user.posicion === 3
          ? "🥉"
          : "♻️";

  return (
    <Pressable style={styles.rankingRow}>
      <View style={[styles.rankCircle, first && styles.firstRankCircle]}>
        <Text style={[styles.rankText, first && styles.firstRankText]}>
          {user.posicion}
        </Text>
      </View>

      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{avatar}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name || user.username}</Text>
        <Text style={styles.userLevel}>
          Nivel {user.nivel} · {user.location ?? "Sin distrito"}
        </Text>
      </View>

      <View style={styles.pointsColumn}>
        <Text style={styles.userPoints}>
          {user.points.toLocaleString("es-PE")}
        </Text>
        <Text style={styles.pointsLabel}>PTS</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centeredState: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
  },
  centeredStateText: { color: colors.textMuted, fontWeight: "700" },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 19,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 64,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    fontSize: 21,
    fontWeight: "900",
    color: colors.primary,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  pointsBadge: {
    backgroundColor: colors.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
  },

  pointsBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "900",
  },

  notificationIcon: {
    fontSize: 21,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 120,
  },

  titleSection: {
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    color: colors.primary,
    fontWeight: "900",
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
  },

  bold: {
    fontWeight: "900",
    color: colors.text,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    borderBottomWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  summaryCardGreen: {
    borderBottomColor: colors.primary,
  },

  summaryCardYellow: {
    borderBottomColor: colors.tertiary,
  },

  summaryIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },

  summaryUnit: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
  },

  summaryLabel: {
    marginTop: 6,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "900",
    letterSpacing: 1.2,
  },


  sectionLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  rankingSection: {
    gap: 14,
  },

  rankingList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
  },

  currentUserRow: {
    padding: 16,
    backgroundColor: "#9df19733",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  currentRankCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  currentRankText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
  },

  rankingRow: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  rankCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },

  firstRankCircle: {
    backgroundColor: colors.tertiaryContainer,
  },

  rankText: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: "900",
  },

  firstRankText: {
    color: "#594a00",
  },

  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 25,
  },

  userInfo: {
    flex: 1,
  },

  currentUserName: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.text,
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  userLevel: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },

  pointsColumn: {
    alignItems: "flex-end",
  },

  currentPoints: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.primary,
  },

  userPoints: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.text,
  },

  pointsLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 0.7,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 82,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 10,
  },

  navItem: {
    alignItems: "center",
    gap: 4,
  },

  navIcon: {
    fontSize: 20,
    color: "#57534e",
  },

  navLabel: {
    fontSize: 9,
    color: "#57534e",
    fontWeight: "900",
    textTransform: "uppercase",
  },

  navActive: {
    color: colors.primary,
  },

  centerActionWrapper: {
    marginTop: -42,
  },

  centerAction: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },

  centerActionIcon: {
    color: colors.white,
    fontSize: 27,
  },
});

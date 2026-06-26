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

export function RankingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.logo}>ReciScore</Text>

        <View style={styles.headerRight}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>⭐ 4,250 pts</Text>
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
            Resumen de impacto en tu distrito: <Text style={styles.bold}>Miraflores</Text>
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <Text style={styles.summaryIcon}>🌱</Text>
            <Text style={styles.summaryValue}>
              142.5 <Text style={styles.summaryUnit}>kg</Text>
            </Text>
            <Text style={styles.summaryLabel}>AHORRO CO2</Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardYellow]}>
            <Text style={styles.summaryIcon}>🏅</Text>
            <Text style={styles.summaryValue}>12</Text>
            <Text style={styles.summaryLabel}>MIS INSIGNIAS</Text>
          </View>
        </View>

        <View style={styles.badgesHeader}>
          <Text style={styles.sectionLabel}>MIS INSIGNIAS</Text>
          <Text style={styles.sectionLink}>Ver todas</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgesRow}
        >
          <Badge icon="🏆" title="Primeros Pasos" color={colors.primary} />
          <Badge icon="♻️" title="Rey del Vidrio" color={colors.tertiary} />
          <Badge icon="🌿" title="Bio-Guardián" color={colors.secondary} />
          <Badge icon="🔒" title="Master Pro" locked />
        </ScrollView>

        <View style={styles.rankingSection}>
          <Text style={styles.sectionLabel}>TOP CONTRIBUYENTES</Text>

          <View style={styles.rankingList}>
            <View style={styles.currentUserRow}>
              <View style={styles.currentRankCircle}>
                <Text style={styles.currentRankText}>4</Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.currentUserName}>Tú (User_99)</Text>
                <Text style={styles.userLevel}>Nivel 4 Eco-Warrior</Text>
              </View>

              <View style={styles.pointsColumn}>
                <Text style={styles.currentPoints}>4,250</Text>
                <Text style={styles.pointsLabel}>PTS</Text>
              </View>
            </View>

            <RankingRow
              rank={1}
              name="Elena Green"
              level="Líder Ambiental"
              points="8,920"
              avatar="👩‍🌾"
              first
            />

            <RankingRow
              rank={2}
              name="Marco Rivers"
              level="Eco-Guardian"
              points="7,140"
              avatar="🧑‍💼"
            />

            <RankingRow
              rank={3}
              name="Ana Terra"
              level="Bio-Warrior"
              points="6,800"
              avatar="👩‍🔬"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <BottomNavItem icon="▦" label="Panel" />
        <BottomNavItem icon="🗺️" label="Mapa" />
        <View style={styles.centerActionWrapper}>
          <Pressable style={styles.centerAction}>
            <Text style={styles.centerActionIcon}>✍️</Text>
          </Pressable>
        </View>
        <BottomNavItem icon="🏆" label="Ranking" active />
        <BottomNavItem icon="🕒" label="Historial" />
      </View>
    </SafeAreaView>
  );
}

type BadgeProps = {
  icon: string;
  title: string;
  color?: string;
  locked?: boolean;
};

function Badge({ icon, title, color = colors.primary, locked = false }: BadgeProps) {
  return (
    <View
      style={[
        styles.badgeOuter,
        { backgroundColor: locked ? colors.surfaceContainer : color },
      ]}
    >
      <View style={[styles.badgeInner, locked && styles.badgeInnerLocked]}>
        <Text style={styles.badgeIcon}>{icon}</Text>
        <Text style={[styles.badgeTitle, locked && styles.badgeTitleLocked]}>
          {title}
        </Text>
      </View>
    </View>
  );
}

type RankingRowProps = {
  rank: number;
  name: string;
  level: string;
  points: string;
  avatar: string;
  first?: boolean;
};

function RankingRow({ rank, name, level, points, avatar, first = false }: RankingRowProps) {
  return (
    <Pressable style={styles.rankingRow}>
      <View style={[styles.rankCircle, first && styles.firstRankCircle]}>
        <Text style={[styles.rankText, first && styles.firstRankText]}>{rank}</Text>
      </View>

      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{avatar}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userLevel}>{level}</Text>
      </View>

      <View style={styles.pointsColumn}>
        <Text style={styles.userPoints}>{points}</Text>
        <Text style={styles.pointsLabel}>PTS</Text>
      </View>
    </Pressable>
  );
}

type BottomNavItemProps = {
  icon: string;
  label: string;
  active?: boolean;
};

function BottomNavItem({ icon, label, active = false }: BottomNavItemProps) {
  return (
    <Pressable style={styles.navItem}>
      <Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 64,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  pointsBadge: {
    backgroundColor: colors.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
  },

  pointsBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '900',
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
    fontWeight: '900',
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
  },

  bold: {
    fontWeight: '900',
    color: colors.text,
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    borderBottomWidth: 4,
    shadowColor: '#000',
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
    fontWeight: '900',
    color: colors.text,
  },

  summaryUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },

  summaryLabel: {
    marginTop: 6,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  badgesHeader: {
    paddingHorizontal: 8,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sectionLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  sectionLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '900',
  },

  badgesRow: {
    gap: 16,
    paddingHorizontal: 8,
    paddingBottom: 28,
  },

  badgeOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  badgeInner: {
    flex: 1,
    borderRadius: 64,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  badgeInnerLocked: {
    backgroundColor: colors.surfaceLow,
    opacity: 0.65,
  },

  badgeIcon: {
    fontSize: 38,
  },

  badgeTitle: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 13,
  },

  badgeTitleLocked: {
    color: colors.outline,
  },

  rankingSection: {
    gap: 14,
  },

  rankingList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },

  currentUserRow: {
    padding: 16,
    backgroundColor: '#9df19733',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  currentRankCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  currentRankText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },

  rankingRow: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  rankCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },

  firstRankCircle: {
    backgroundColor: colors.tertiaryContainer,
  },

  rankText: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '900',
  },

  firstRankText: {
    color: '#594a00',
  },

  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 25,
  },

  userInfo: {
    flex: 1,
  },

  currentUserName: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },

  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  userLevel: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },

  pointsColumn: {
    alignItems: 'flex-end',
  },

  currentPoints: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
  },

  userPoints: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },

  pointsLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.7,
  },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 82,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 10,
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
    fontSize: 9,
    color: '#57534e',
    fontWeight: '900',
    textTransform: 'uppercase',
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
    alignItems: 'center',
    justifyContent: 'center',
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
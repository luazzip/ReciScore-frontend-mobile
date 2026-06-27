import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { colors } from '../styles/theme';

export function LoadingView({ label = 'Cargando...' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  label: { color: colors.textMuted, fontSize: 14 },
});
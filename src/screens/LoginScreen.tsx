import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { colors, radius } from '../styles/theme';

export function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [rememberSession, setRememberSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa tu correo y contraseña.');
      return;
    }

    try {
      setIsSubmitting(true);

      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      Alert.alert('Bienvenida', 'Inicio de sesión correcto.');
    } catch {
      Alert.alert('Error', 'Correo o contraseña incorrectos.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.logoIcon}>🌱</Text>
            <Text style={styles.logo}>ReciScore</Text>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroIconShadow} />

            <View style={styles.heroIconBox}>
              <Text style={styles.heroIcon}>🔐</Text>
            </View>

            <Text style={styles.title}>
              ¡Bienvenido de{'\n'}nuevo!
            </Text>

            <Text style={styles.subtitle}>
              Inicia sesión para seguir transformando el planeta con ReciScore.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CORREO ELECTRÓNICO</Text>

              <View style={styles.inputBox}>
                <Text style={styles.inputIcon}>✉️</Text>

                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>CONTRASEÑA</Text>

                <Pressable>
                  <Text style={styles.forgotText}>¿Olvidaste?</Text>
                </Pressable>
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputIcon}>🔒</Text>

                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />

                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={10}
                >
                  <Text style={styles.passwordToggle}>
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberSession((current) => !current)}
            >
              <View style={[styles.checkbox, rememberSession && styles.checkboxChecked]}>
                {rememberSession && <Text style={styles.checkboxText}>✓</Text>}
              </View>

              <Text style={styles.rememberText}>Recordar mi sesión</Text>
            </Pressable>

            <Pressable
              style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#d1ffc8" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  <Text style={styles.loginButtonIcon}>→</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O CONTINÚA CON</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </Pressable>

            <Pressable style={styles.socialButton}>
              <Text style={styles.socialIcon}></Text>
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>
          </View>

          <Text style={styles.registerText}>
            ¿No tienes una cuenta?{' '}
            <Text style={styles.registerLink}>Regístrate gratis</Text>
          </Text>

          <Text style={styles.footerText}>
            © 2026 ReciScore • Digital Greenhouse
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },

  header: {
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  logoIcon: {
    fontSize: 28,
  },

  logo: {
    fontSize: 25,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -1,
  },

  hero: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 36,
  },

  heroIconShadow: {
    position: 'absolute',
    top: 0,
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    opacity: 0.35,
    transform: [{ rotate: '12deg' }],
  },

  heroIconBox: {
    width: 84,
    height: 84,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
    transform: [{ rotate: '3deg' }],
  },

  heroIcon: {
    fontSize: 38,
  },

  title: {
    marginTop: 28,
    fontSize: 38,
    lineHeight: 44,
    textAlign: 'center',
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1.5,
  },

  subtitle: {
    marginTop: 10,
    maxWidth: 310,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.textMuted,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.outline,
    letterSpacing: 1,
    marginBottom: 8,
  },

  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  forgotText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  inputBox: {
    minHeight: 56,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  inputIcon: {
    width: 32,
    fontSize: 18,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
  },

  passwordToggle: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '700',
  },

  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.outlineLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkboxText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 14,
  },

  rememberText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  loginButton: {
    minHeight: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: '#d1ffc8',
    fontSize: 18,
    fontWeight: '900',
  },

  loginButtonIcon: {
    color: '#d1ffc8',
    fontSize: 24,
    fontWeight: '900',
  },

  divider: {
    marginVertical: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineLight,
  },

  dividerText: {
    fontSize: 10,
    color: colors.outline,
    fontWeight: '800',
    letterSpacing: 1,
  },

  socialRow: {
    flexDirection: 'row',
    gap: 14,
  },

  socialButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  socialIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },

  socialText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  registerText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 15,
    color: colors.textMuted,
  },

  registerLink: {
    color: colors.primary,
    fontWeight: '900',
  },

  footerText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 10,
    color: colors.outline,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
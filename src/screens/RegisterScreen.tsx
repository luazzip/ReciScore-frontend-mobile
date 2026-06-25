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

export function RegisterScreen() {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Datos incompletos', 'Completa todos los campos para crear tu cuenta.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Términos requeridos', 'Debes aceptar los términos y condiciones.');
      return;
    }

    try {
      setIsSubmitting(true);

      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      Alert.alert('Bienvenida', 'Tu cuenta fue creada correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudo crear la cuenta. Revisa tus datos o intenta nuevamente.');
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
            <Pressable style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>

            <Text style={styles.logo}>ReciScore</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.backgroundCircleOne} />
          <View style={styles.backgroundCircleTwo} />

          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              Únete al <Text style={styles.titleHighlight}>Ecosistema</Text>
            </Text>

            <Text style={styles.subtitle}>
              Convierte tus residuos en recompensas digitales.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>👤</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ej. Alex Green"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>USUARIO</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>@</Text>

                <TextInput
                  style={styles.input}
                  placeholder="alexgreen"
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CORREO ELECTRÓNICO</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>✉️</Text>

                <TextInput
                  style={styles.input}
                  placeholder="hola@ejemplo.com"
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
              <Text style={styles.label}>CONTRASEÑA</Text>

              <View style={styles.inputRow}>
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
              style={styles.termsContainer}
              onPress={() => setAcceptTerms((current) => !current)}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Text style={styles.checkboxText}>✓</Text>}
              </View>

              <Text style={styles.termsText}>
                Acepto los Términos de Servicio y la Política de Privacidad.
              </Text>
            </Pressable>

            <Pressable
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#d1ffc8" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Crear Cuenta</Text>
                  <Text style={styles.submitButtonIcon}>→</Text>
                </>
              )}
            </Pressable>

            <View style={styles.socialContainer}>
              <Text style={styles.socialTitle}>O REGÍSTRATE CON</Text>

              <View style={styles.socialButtons}>
                <Pressable style={styles.socialButton}>
                  <Text style={styles.socialButtonText}>G</Text>
                </Pressable>

                <Pressable style={styles.socialButton}>
                  <Text style={styles.socialButtonText}>f</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Text style={styles.loginText}>
            ¿Ya tienes una cuenta?{' '}
            <Text style={styles.loginLink}>
              Inicia Sesión
            </Text>
          </Text>

          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Text style={styles.tipIcon}>🌱</Text>
            </View>

            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>¿Sabías que?</Text>

              <Text style={styles.tipDescription}>
                Reciclar una sola lata de aluminio ahorra energía suficiente para ver televisión durante tres horas.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerLogo}>ReciScore</Text>
            <Text style={styles.footerText}>© 2026 ReciScore</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const colors = {
  background: '#f4f7f5',
  surface: '#ffffff',
  surfaceLow: '#eef2ef',
  surfaceContainer: '#e5e9e7',
  primary: '#176a21',
  primaryDark: '#025d16',
  primaryLight: '#9df197',
  secondary: '#006666',
  text: '#2b2f2e',
  textMuted: '#585c5b',
  outline: '#747876',
  outlineLight: '#d8dedc',
  white: '#ffffff',
};

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
    paddingBottom: 40,
  },

  header: {
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '700',
  },

  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
  },

  headerSpacer: {
    width: 42,
  },

  backgroundCircleOne: {
    position: 'absolute',
    top: 70,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#9df19755',
  },

  backgroundCircleTwo: {
    position: 'absolute',
    bottom: 120,
    left: -90,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#8dedec44',
  },

  titleContainer: {
    marginBottom: 28,
  },

  title: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1.5,
  },

  titleHighlight: {
    color: colors.primary,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMuted,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 24,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 6,
  },

  inputGroup: {
    marginBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineLight,
    paddingBottom: 4,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.outline,
    letterSpacing: 1,
    marginBottom: 4,
  },

  inputRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputIcon: {
    width: 32,
    fontSize: 18,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 10,
  },

  passwordToggle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
    paddingLeft: 8,
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
    marginBottom: 22,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.outlineLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkboxText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },

  submitButton: {
    minHeight: 58,
    borderRadius: 28,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5,
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitButtonText: {
    color: '#d1ffc8',
    fontSize: 18,
    fontWeight: '800',
  },

  submitButtonIcon: {
    color: '#d1ffc8',
    fontSize: 24,
    fontWeight: '800',
  },

  socialContainer: {
    marginTop: 28,
    alignItems: 'center',
  },

  socialTitle: {
    fontSize: 11,
    color: colors.outline,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
  },

  socialButtons: {
    flexDirection: 'row',
    gap: 14,
  },

  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  socialButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },

  loginText: {
    marginTop: 28,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
  },

  loginLink: {
    color: colors.primary,
    fontWeight: '800',
  },

  tipCard: {
    marginTop: 36,
    backgroundColor: '#176a210d',
    borderWidth: 1,
    borderColor: '#176a211a',
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  tipIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#176a2126',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tipIcon: {
    fontSize: 26,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '900',
    marginBottom: 3,
  },

  tipDescription: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },

  footer: {
    marginTop: 36,
    alignItems: 'center',
  },

  footerLogo: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },

  footerText: {
    marginTop: 6,
    fontSize: 11,
    color: colors.outline,
    letterSpacing: 1,
  },
});
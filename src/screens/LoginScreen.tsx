import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa tu correo y contraseña.');
      return;
    }

    try {
      setIsSubmitting(true);

      await login({
        email,
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
    <View>
      <Text>Iniciar sesión</Text>

      <TextInput
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={isSubmitting ? 'Ingresando...' : 'Ingresar'}
        onPress={handleLogin}
        disabled={isSubmitting}
      />
    </View>
  );
}
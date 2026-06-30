import React, { useContext } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RegisterRecyclingScreen } from '../screens/RegisterRecyclingScreen';
import { MapScreen } from '../screens/MapScreen';
import { RankingScreen } from '../screens/RankingScreen';
import { RecyclingHistoryScreen } from '../screens/RecyclingHistoryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { AuthContext } from '../contexts/AuthContext';
import { colors } from '../styles/theme';

export type AppTabParamList = {
  Inicio: undefined;
  Registrar: undefined;
  Mapa: undefined;
  Ranking: undefined;
  Historial: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

const ICONS: Record<keyof AppTabParamList, string> = {
  Inicio: '🏠',
  Registrar: '📷',
  Mapa: '🗺️',
  Ranking: '🏆',
  Historial: '📋',
};

function LogoutButton() {
  const auth = useContext(AuthContext);

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => auth?.logout() },
    ]);
  }

  return (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
      <Text style={{ fontSize: 14, color: '#c62828', fontWeight: '700' }}>Salir</Text>
    </TouchableOpacity>
  );
}

function HistoryTab() {
  const { userId, loading } = useCurrentUser();

  if (loading) {
    return <CenteredLoader label="Identificando usuario..." />;
  }

  if (!userId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ textAlign: 'center', color: colors.textMuted }}>
          No se pudo identificar tu usuario. Cierra sesión e ingresa nuevamente.
        </Text>
      </View>
    );
  }

  return <RecyclingHistoryScreen userId={userId} />;
}

function CenteredLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textMuted }}>{label}</Text>
    </View>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerRight: () => <LogoutButton />,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 22 : 20 }}>{ICONS[route.name]}</Text>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6 },
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} />
      <Tab.Screen name="Registrar" component={RegisterRecyclingScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
      <Tab.Screen name="Historial" component={HistoryTab} />
    </Tab.Navigator>
  );
}

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export function AppNavigator() {
  const auth = useContext(AuthContext);

  if (!auth || auth.isLoading) {
    return <CenteredLoader label="Preparando ReciScore..." />;
  }

  return auth.isAuthenticated ? <AppTabs /> : <AuthFlow />;
}

import React, { useContext } from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RegisterRecyclingScreen } from '../screens/RegisterRecyclingScreen';
import { MapScreen } from '../screens/MapScreen';
import { RecyclingHistoryScreen } from '../screens/RecyclingHistoryScreen';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = {
  Registrar: '📷',
  Mapa: '🗺️',
  Historial: '📋',
};

function LogoutButton() {
  const auth = useContext(AuthContext);

  function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => auth?.logout() },
      ]
    );
  }

  return (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
      <Text style={{ fontSize: 14, color: '#c62828', fontWeight: '600' }}>Salir</Text>
    </TouchableOpacity>
  );
}

function HistoryTab() {
  const { userId, loading } = useCurrentUser();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>No se pudo identificar tu usuario. Vuelve a iniciar sesión.</Text>
      </View>
    );
  }

  return <RecyclingHistoryScreen userId={userId} />;
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerRight: () => <LogoutButton />,
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name]}</Text>,
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: '#888',
      })}
    >
      <Tab.Screen name="Registrar" component={RegisterRecyclingScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Historial" component={HistoryTab} />
    </Tab.Navigator>
  );
}
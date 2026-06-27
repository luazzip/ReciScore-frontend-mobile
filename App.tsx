import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/contexts/AuthContext';
import { PointsProvider } from './src/contexts/PointsContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PointsProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <Toast />
      </PointsProvider>
    </AuthProvider>
  );
}
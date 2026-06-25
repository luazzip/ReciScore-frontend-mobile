import { AuthProvider } from './src/contexts/AuthContext';
import { PointsProvider } from './src/contexts/PointsContext';
import { MapScreen } from './src/screens/MapScreen';

export default function App() {
  return (
    <AuthProvider>
      <PointsProvider>
        <MapScreen />
      </PointsProvider>
    </AuthProvider>
  );
}
import { AuthProvider } from './src/contexts/AuthContext';
import { PointsProvider } from './src/contexts/PointsContext';

export default function App() {
  return (
    <AuthProvider>
      <PointsProvider>
        {/* Aquí va tu navegación o tus pantallas */}
      </PointsProvider>
    </AuthProvider>
  );
}
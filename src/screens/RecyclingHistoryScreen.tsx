import { Text, View, FlatList } from 'react-native';
import { useFetch } from '../hooks/useFetch';
import { getRecyclingHistoryByUser } from '../services/recyclingService';

interface Props {
  userId: number;
}

export function RecyclingHistoryScreen({ userId }: Props) {
  const {
    data: reports,
    isLoading,
    error,
    refetch,
  } = useFetch(() => getRecyclingHistoryByUser(userId), [userId]);

  if (isLoading) {
    return <Text>Cargando historial...</Text>;
  }

  if (error) {
    return (
      <View>
        <Text>{error}</Text>
        <Text onPress={refetch}>Reintentar</Text>
      </View>
    );
  }

  if (!reports || reports.length === 0) {
    return <Text>Todavía no tienes reciclajes registrados.</Text>;
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.numeroReporte.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item.materialNombre}</Text>
          <Text>{item.numeroArticulos} artículos</Text>
          <Text>{item.validadoIa ? 'Validado por IA' : 'Pendiente de validación'}</Text>
          <Text>{item.gpsValidado ? 'Ubicación válida' : 'Ubicación no validada'}</Text>
        </View>
      )}
    />
  );
}
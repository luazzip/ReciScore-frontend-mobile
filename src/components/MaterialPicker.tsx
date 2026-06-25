import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Material } from '../services/materialService';

interface Props {
  materials: Material[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function MaterialPicker({ materials, loading, selectedId, onSelect }: Props) {
  if (loading) return <ActivityIndicator size="small" color="#2e7d32" />;
  if (materials.length === 0) return <Text style={styles.empty}>No hay materiales disponibles.</Text>;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {materials.map((m) => (
        <TouchableOpacity
          key={m.id}
          style={[styles.chip, selectedId === m.id && styles.chipSelected]}
          onPress={() => onSelect(m.id)}
        >
          <Text style={[styles.chipText, selectedId === m.id && styles.chipTextSelected]}>
            {m.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5, borderColor: '#2e7d32', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
  },
  chipSelected: { backgroundColor: '#2e7d32' },
  chipText: { color: '#2e7d32', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  empty: { color: '#999', fontSize: 14 },
});
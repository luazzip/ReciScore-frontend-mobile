import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type TamanoObjeto = 'PEQUENO' | 'MEDIANO' | 'GRANDE';

const OPCIONES: { value: TamanoObjeto; label: string }[] = [
  { value: 'PEQUENO', label: 'Pequeño' },
  { value: 'MEDIANO', label: 'Mediano' },
  { value: 'GRANDE', label: 'Grande' },
];

interface Props {
  selected: TamanoObjeto;
  onSelect: (value: TamanoObjeto) => void;
}

export function SizePicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {OPCIONES.map((o) => (
        <TouchableOpacity
          key={o.value}
          style={[styles.chip, selected === o.value && styles.chipSelected]}
          onPress={() => onSelect(o.value)}
        >
          <Text style={[styles.chipText, selected === o.value && styles.chipTextSelected]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    borderWidth: 1.5, borderColor: '#2e7d32', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  chipSelected: { backgroundColor: '#2e7d32' },
  chipText: { color: '#2e7d32', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
});
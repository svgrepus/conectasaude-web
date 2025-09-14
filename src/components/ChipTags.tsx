import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChipTagsProps {
  tags: string[];
  onRemove: (tag: string) => void;
  maxWidth?: number;
  editable?: boolean;
}

export const ChipTags = ({
  tags,
  onRemove,
  maxWidth,
  editable = true,
}: ChipTagsProps) => {
  if (tags.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum medicamento selecionado</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, maxWidth ? { maxWidth } : null]}>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={`${tag}-${index}`} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>
                {tag}
              </Text>
              {editable && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => onRemove(tag)}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 120,
    minHeight: 40,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD', // Azul claro similar à imagem
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
    maxWidth: 200, // Limitar largura dos chips
  },
  chipText: {
    fontSize: 14,
    color: '#1976D2', // Azul escuro para o texto
    fontWeight: '500',
    marginRight: 6,
    flex: 1,
  },
  removeButton: {
    marginLeft: 4,
    padding: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    minHeight: 50,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default ChipTags;

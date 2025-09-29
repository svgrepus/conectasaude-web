import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface HealthDataItem {
  id: string;
  nome: string;
  codigo?: string;
  descricao?: string;
}

interface HealthDropdownProps {
  data: HealthDataItem[];
  onSelect: (item: HealthDataItem) => void;
  selectedValue?: string;
  placeholder?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const HealthDropdown = ({
  data,
  onSelect,
  selectedValue,
  placeholder = "Selecionar...",
  iconName = "search",
}: HealthDropdownProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<HealthDataItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HealthDataItem | null>(null);

  // Encontrar o item selecionado quando selectedValue muda
  useEffect(() => {
    if (selectedValue) {
      const item = data.find(d => d.id === selectedValue);
      setSelectedItem(item || null);
    } else {
      setSelectedItem(null);
    }
  }, [selectedValue, data]);

  // Filtrar dados baseado na busca
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const filtered = data.filter(item =>
        item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.codigo && item.codigo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.descricao && item.descricao.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchQuery, data]);

  const handleSelectItem = (item: HealthDataItem) => {
    onSelect(item);
    setSelectedItem(item);
    setShowModal(false);
    setSearchQuery('');
  };

  const clearSelection = () => {
    setSelectedItem(null);
    onSelect({ id: '', nome: '', codigo: '', descricao: '' });
  };

  const openModal = () => {
    setSearchQuery('');
    setFilteredData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSearchQuery('');
  };

  const renderDataItem = ({ item }: { item: HealthDataItem }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectItem(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultItemContent}>
        <Ionicons name={iconName} size={20} color="#1976D2" />
        <View style={styles.itemTextContainer}>
          <Text style={styles.resultItemText} numberOfLines={1}>
            {item.nome}
          </Text>
          {item.codigo && (
            <Text style={styles.resultItemSubtext} numberOfLines={1}>
              Código: {item.codigo}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Campo de seleção */}
      <TouchableOpacity
        style={styles.selectionContainer}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Ionicons name={iconName} size={20} color="#666" style={styles.selectionIcon} />
        <Text style={[
          styles.selectionText,
          !selectedItem && styles.placeholderText
        ]} numberOfLines={1}>
          {selectedItem ? selectedItem.nome : placeholder}
        </Text>
        <View style={styles.rightIcons}>
          {selectedItem && (
            <TouchableOpacity onPress={clearSelection} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-down" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {/* Modal para seleção */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1}>
              {/* Header do modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar {placeholder.toLowerCase()}</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Campo de busca */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Digite para filtrar..."
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Lista de resultados */}
              <View style={styles.resultsContainer}>
                <FlatList
                  data={filteredData}
                  renderItem={renderDataItem}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                  ListEmptyComponent={
                    <View style={styles.emptyResults}>
                      <Text style={styles.emptyResultsText}>
                        Nenhum resultado encontrado
                      </Text>
                    </View>
                  }
                />
              </View>

              {/* Botões do footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 48,
  },
  selectionIcon: {
    marginRight: 8,
  },
  selectionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearSearchButton: {
    marginLeft: 8,
    padding: 4,
  },
  resultsContainer: {
    maxHeight: 300,
    minHeight: 200,
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 56,
  },
  itemTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  resultItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  resultItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyResults: {
    padding: 40,
    alignItems: 'center',
  },
  emptyResultsText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default HealthDropdown;
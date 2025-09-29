import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface HealthDataItem {
  id: string;
  nome: string;
  codigo?: string;
  descricao?: string;
}



interface HealthDataSearchProps {
  data: HealthDataItem[];
  onSelect: (item: HealthDataItem) => void;
  selectedValue?: string;
  placeholder?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  label?: string;
  zIndex?: number;
  onOpen?: () => void; // Callback para quando o dropdown for aberto
  forceClose?: boolean; // Para forçar fechamento externo
}

export const HealthDataSearch = ({
  data,
  onSelect,
  selectedValue,
  placeholder = "Pesquisar...",
  iconName = "search",
  label = "Selecionar item",
  zIndex = 1000,
  onOpen,
  forceClose = false
}: HealthDataSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<HealthDataItem[]>([]);
  const [showResults, setShowResults] = useState(false);
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

  // Fechar quando forceClose for true
  useEffect(() => {
    if (forceClose && showResults) {
      setShowResults(false);
      setSearchQuery('');
      setFilteredData([]);
    }
  }, [forceClose, showResults]);

  // Filtrar dados baseado na busca
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const filtered = data.filter(item =>
        item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.codigo && item.codigo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.descricao && item.descricao.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredData(filtered);
      setShowResults(filtered.length > 0);
    } else {
      setFilteredData([]);
      setShowResults(false);
    }
  }, [searchQuery, data]);

  const handleSelectItem = (item: HealthDataItem) => {
    onSelect(item);
    setSearchQuery('');
    setFilteredData([]);
    setShowResults(false);
    setSelectedItem(item);
  };

  const clearSelection = () => {
    setSearchQuery('');
    setFilteredData([]);
    setShowResults(false);
    setSelectedItem(null);
    // Chamar onSelect com um item vazio para limpar a seleção
    onSelect({ id: '', nome: '', codigo: '', descricao: '' });
  };

  const openSearch = () => {
    // Chamar callback para fechar outros dropdowns
    if (onOpen && !showResults) {
      onOpen();
    }
    setSearchQuery('');
    setShowResults(data.length > 0);
    setFilteredData(data);
  };

  const renderDataItem = ({ item }: { item: HealthDataItem }) => (
    <View style={styles.resultItem}>
      <TouchableOpacity
        style={styles.resultItemContent}
        onPress={() => handleSelectItem(item)}
        activeOpacity={0.7}
      >
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
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { zIndex: showResults ? zIndex + 1000 : zIndex }]}>
      {/* Campo de exibição/seleção */}
      <TouchableOpacity
        style={[
          styles.selectionContainer,
          showResults && styles.selectionContainerActive
        ]}
        onPress={openSearch}
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

      {/* Campo de busca quando ativo */}
      {showResults && (
        <View style={[styles.searchContainer, { zIndex: zIndex + 2000, elevation: zIndex / 100 + 10 }]}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Digite para filtrar..."
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
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
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              ListEmptyComponent={
                <View style={styles.emptyResults}>
                  <Text style={styles.emptyResultsText}>
                    Nenhum resultado encontrado
                  </Text>
                </View>
              }
            />
          </View>

          {/* Botão para fechar */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowResults(false)}
          >
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    elevation: 1,
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
  selectionContainerActive: {
    borderColor: '#1976D2',
    backgroundColor: '#FFF',
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
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    maxHeight: 200,
    backgroundColor: '#FFF',
  },
  resultsList: {
    maxHeight: 200,
    backgroundColor: '#FFF',
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    minHeight: 48,
  },
  resultItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 48,
    flex: 1,
  },
  itemTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  resultItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  resultItemSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyResults: {
    padding: 20,
    alignItems: 'center',
  },
  emptyResultsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  closeButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
});

export default HealthDataSearch;
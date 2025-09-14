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
import { medicamentosService } from '../services/medicamentosService';

interface MedicamentoSearchProps {
  onSelectMedicamento: (medicamento: string) => void;
  selectedMedicamentos: string[];
  placeholder?: string;
}

interface MedicamentoOption {
  id: string;
  dcb_dci: string;
}

export const MedicamentoSearch = ({
  onSelectMedicamento,
  selectedMedicamentos,
  placeholder = "Pesquisar medicamento...",
}: MedicamentoSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicamentoOption[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchMedicamentos(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchMedicamentos = async (query: string) => {
    try {
      setLoading(true);
      const results = await medicamentosService.searchMedicamentosAtivos(query);
      
      // Filtrar medicamentos já selecionados
      const filteredResults = results.filter(
        med => !selectedMedicamentos.includes(med.dcb_dci)
      );
      
      setSearchResults(filteredResults);
      setShowResults(filteredResults.length > 0);
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedicamento = (medicamento: MedicamentoOption) => {
    onSelectMedicamento(medicamento.dcb_dci);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const renderMedicamentoItem = ({ item }: { item: MedicamentoOption }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectMedicamento(item)}
    >
      <View style={styles.resultItemContent}>
        <Ionicons name="medical" size={20} color="#1976D2" />
        <Text style={styles.resultItemText} numberOfLines={2}>
          {item.dcb_dci}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={placeholder}
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
        {loading && (
          <ActivityIndicator size="small" color="#1976D2" style={styles.loadingIndicator} />
        )}
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults}
            renderItem={renderMedicamentoItem}
            keyExtractor={(item) => item.id}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyResults}>
                <Text style={styles.emptyResultsText}>
                  Nenhum medicamento encontrado
                </Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1001,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultItemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
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
});

export default MedicamentoSearch;

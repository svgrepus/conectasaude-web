import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DoencaCronicaForm } from '../../components/DoencaCronicaForm';
import { doencaCronicaService, DoencaCronica } from '../../services/doencaCronicaService';
import { theme } from '../../constants/theme';

export const DoencaCronicaScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [doencas, setDoencas] = useState<DoencaCronica[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedDoenca, setSelectedDoenca] = useState<DoencaCronica | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const itemsPerPage = 10;

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Debounce para busca
  const debounceSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log('🔍 Realizando busca com debounce:', searchTerm);
          loadDoencas(1, searchTerm);
        }, 500); // 500ms de delay
      };
    })(),
    []
  );

  // Carregar dados da API
  const loadDoencas = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      console.log('🔍 DoencaCronicaScreen: Carregando doenças crônicas', { page, search });

      const response = await doencaCronicaService.getDoencasCronicas(page, itemsPerPage, search);
      
      setDoencas(response.data);
      setTotalCount(response.count);
      setCurrentPage(page);

      console.log('✅ DoencaCronicaScreen: Dados carregados:', {
        total: response.count,
        loaded: response.data.length
      });

    } catch (error) {
      console.error('❌ DoencaCronicaScreen: Erro ao carregar dados:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as doenças crônicas. Verifique sua conexão e faça login novamente.',
        [{ text: 'OK' }]
      );
      setDoencas([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadDoencas(1);
  }, []);

  // Recarregar quando pesquisa mudar
  // Handler para mudança de busca
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      // Se a busca estiver vazia, carrega imediatamente
      loadDoencas(1);
    } else {
      // Se há texto, usa debounce
      debounceSearch(text);
    }
  };

  const handleAdd = () => {
    setSelectedDoenca(null);
    setFormVisible(true);
  };

  const handleEdit = async (doenca: DoencaCronica) => {
    setSelectedDoenca(doenca);
    setFormVisible(true);
  };

  const handleFormSave = async (formData: Pick<DoencaCronica, 'name' | 'description'>) => {
    try {
      if (selectedDoenca) {
        console.log('✏️ Editando doença crônica:', selectedDoenca.id);
        await doencaCronicaService.updateDoencaCronica(selectedDoenca.id, formData);
        Alert.alert('Sucesso', 'Doença crônica atualizada com sucesso');
      } else {
        console.log('➕ Criando nova doença crônica');
        await doencaCronicaService.createDoencaCronica(formData);
        Alert.alert('Sucesso', 'Doença crônica criada com sucesso');
      }
      
      await loadDoencas(currentPage, searchQuery);
      
    } catch (error) {
      console.error('❌ Erro ao salvar doença crônica:', error);
      Alert.alert(
        'Erro', 
        `Não foi possível ${selectedDoenca ? 'atualizar' : 'criar'} a doença crônica. Tente novamente.`
      );
      throw error;
    }
  };

  const handleDelete = async (doenca: DoencaCronica) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a doença "${doenca.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await doencaCronicaService.deleteDoencaCronica(doenca.id);
              await loadDoencas(currentPage, searchQuery);
              Alert.alert('Sucesso', 'Doença crônica excluída com sucesso');
            } catch (error) {
              console.error('❌ Erro ao excluir doença crônica:', error);
              Alert.alert('Erro', 'Não foi possível excluir a doença crônica');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Calcular informações de paginação
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  // Função para mudar página
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages && !loading) {
      loadDoencas(page, searchQuery);
    }
  };

  // Renderizar item da tabela
  const renderDoencaItem = ({ item }: { item: DoencaCronica }) => (
    <View style={[styles.tableRow, { borderTopColor: currentTheme.border }]}>
      <View style={styles.nameCell}>
        <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]}>
          {item.name}
        </Text>
      </View>
      <View style={styles.descriptionCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.description || '-'}
        </Text>
      </View>
      <View style={styles.dateCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={[styles.actionCell]}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
          <Text style={[styles.editButtonText, { color: '#8A9E8E' }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar botões de paginação
  const renderPaginationButton = (page: number) => (
    <TouchableOpacity
      key={page}
      style={[
        styles.paginationButton,
        currentPage === page && styles.paginationButtonActive,
        { backgroundColor: currentPage === page ? '#8A9E8E' : 'transparent' }
      ]}
      onPress={() => handlePageChange(page)}
      disabled={loading}
    >
      <Text style={[
        styles.paginationText,
        { color: currentPage === page ? '#ffffff' : currentTheme.mutedForeground }
      ]}>
        {page}
      </Text>
    </TouchableOpacity>
  );

  if (loading && doencas.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A9E8E" />
          <Text style={[styles.loadingText, { color: currentTheme.text }]}>
            Carregando doenças crônicas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Doenças Crônicas
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Nova Doença</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.surface }]}>
            <Ionicons name="search" size={16} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar por nome ou descrição..."
              placeholderTextColor={currentTheme.mutedForeground}
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            {loading && (
              <ActivityIndicator size="small" color="#8A9E8E" />
            )}
          </View>
        </View>

        {/* Table */}
        <View style={[styles.tableContainer, { 
          backgroundColor: currentTheme.surface, 
          borderColor: currentTheme.border 
        }]}>
          {/* Table Header */}
          <View style={[styles.tableHeader, { backgroundColor: currentTheme.muted }]}>
            <View style={styles.nameCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                NOME
              </Text>
            </View>
            <View style={styles.descriptionCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                DESCRIÇÃO
              </Text>
            </View>
            <View style={styles.dateCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                CRIADO EM
              </Text>
            </View>
            <View style={styles.actionCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                AÇÕES
              </Text>
            </View>
          </View>

          {/* Table Body */}
          {doencas.length > 0 ? (
            <FlatList
              data={doencas}
              renderItem={renderDoencaItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                {searchQuery ? 'Nenhuma doença encontrada para a busca realizada' : 'Nenhuma doença crônica cadastrada'}
              </Text>
            </View>
          )}
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity 
              style={styles.paginationArrow}
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <Ionicons 
                name="chevron-back" 
                size={20} 
                color={currentPage === 1 ? '#ccc' : currentTheme.mutedForeground} 
              />
            </TouchableOpacity>
            
            {currentPage > 2 && renderPaginationButton(1)}
            {currentPage > 3 && (
              <Text style={[styles.paginationDots, { color: currentTheme.mutedForeground }]}>
                ...
              </Text>
            )}
            
            {currentPage > 1 && renderPaginationButton(currentPage - 1)}
            {renderPaginationButton(currentPage)}
            {currentPage < totalPages && renderPaginationButton(currentPage + 1)}
            
            {currentPage < totalPages - 2 && (
              <Text style={[styles.paginationDots, { color: currentTheme.mutedForeground }]}>
                ...
              </Text>
            )}
            {currentPage < totalPages - 1 && renderPaginationButton(totalPages)}
            
            <TouchableOpacity 
              style={styles.paginationArrow}
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={currentPage === totalPages ? '#ccc' : currentTheme.mutedForeground} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Info Footer */}
        {totalCount > 0 && (
          <View style={styles.infoFooter}>
            <Text style={[styles.infoText, { color: currentTheme.mutedForeground }]}>
              Exibindo {startIndex}-{endIndex} de {totalCount} registros
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Formulário Modal */}
      <DoencaCronicaForm
        visible={formVisible}
        doenca={selectedDoenca}
        onClose={() => setFormVisible(false)}
        onSave={handleFormSave}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A9E8E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    minHeight: 20,
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  nameCell: {
    flex: 2,
    justifyContent: 'center',
  },
  descriptionCell: {
    flex: 3,
    justifyContent: 'center',
    paddingRight: 8,
  },
  dateCell: {
    flex: 1.5,
    justifyContent: 'center',
  },
  actionCell: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cellTextPrimary: {
    fontSize: 14,
    fontWeight: '500',
  },
  cellTextSecondary: {
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  paginationArrow: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  paginationButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  paginationButtonActive: {
    backgroundColor: '#8A9E8E',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paginationDots: {
    fontSize: 14,
    paddingHorizontal: 8,
  },
  infoFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

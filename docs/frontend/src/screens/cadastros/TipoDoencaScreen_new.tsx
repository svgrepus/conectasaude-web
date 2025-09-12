import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, FlatList, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { tipoDoencaService, TipoDoenca } from '../../services/tipoDoencaService';
import { TipoDoencaForm } from '../../components/TipoDoencaForm';

export const TipoDoencaScreen: React.FC = () => {
  const [tiposDoenca, setTiposDoenca] = useState<TipoDoenca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoDoenca | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TipoDoenca | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const itemsPerPage = 10;
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const fetchTiposDoenca = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await tipoDoencaService.getTiposDoenca(1, 1000);
      
      if (response.data) {
        setTiposDoenca(response.data);
      } else {
        setError('Erro ao carregar tipos de doença');
      }
    } catch (err) {
      console.error('Erro ao buscar tipos de doença:', err);
      setError('Erro ao carregar tipos de doença');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchTiposDoenca = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchTiposDoenca();
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await tipoDoencaService.getTiposDoenca(1, 1000, query);
      
      if (response.data) {
        setTiposDoenca(response.data);
      } else {
        setError('Erro ao buscar tipos de doença');
      }
    } catch (err) {
      console.error('Erro ao buscar tipos de doença:', err);
      setError('Erro ao buscar tipos de doença');
    } finally {
      setLoading(false);
    }
  }, [fetchTiposDoenca]);

  useEffect(() => {
    fetchTiposDoenca();
  }, [fetchTiposDoenca]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchTiposDoenca(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchTiposDoenca]);

  const totalPages = Math.ceil(tiposDoenca.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTipos = tiposDoenca.slice(startIndex, endIndex);

  const handleEdit = (item: TipoDoenca) => {
    setSelectedTipo(item);
    setFormVisible(true);
  };

  const handleAdd = () => {
    setSelectedTipo(null);
    setFormVisible(true);
  };

  const handleFormSubmit = async (data: Pick<TipoDoenca, 'name' | 'description'>) => {
    try {
      setError('');
      
      if (selectedTipo) {
        await tipoDoencaService.updateTipoDoenca(selectedTipo.id, data);
        setSuccessMessage('Tipo de doença atualizado com sucesso!');
      } else {
        await tipoDoencaService.createTipoDoenca(data);
        setSuccessMessage('Tipo de doença criado com sucesso!');
      }
      
      setFormVisible(false);
      setSelectedTipo(null);
      await fetchTiposDoenca();
      setSuccessVisible(true);
      
    } catch (err) {
      console.error('Erro ao salvar tipo de doença:', err);
      setError('Erro ao salvar tipo de doença');
    }
  };

  const handleDelete = (item: TipoDoenca) => {
    setItemToDelete(item);
    setConfirmDeleteVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setError('');
      
      await tipoDoencaService.deleteTipoDoenca(itemToDelete.id);

      setConfirmDeleteVisible(false);
      setItemToDelete(null);
      setSuccessMessage('Tipo de doença excluído com sucesso!');
      await fetchTiposDoenca();
      setSuccessVisible(true);
      
    } catch (err) {
      console.error('Erro ao excluir tipo de doença:', err);
      setError('Erro ao excluir tipo de doença');
      setConfirmDeleteVisible(false);
      setItemToDelete(null);
    }
  };

  const renderTipoItem = ({ item }: { item: TipoDoenca }) => (
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
      <View style={styles.actionCell}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
          <Text style={[styles.editButtonText, { color: '#8A9E8E' }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaginationButton = (page: number) => (
    <TouchableOpacity
      key={page}
      style={[
        styles.paginationButton,
        currentPage === page && styles.paginationButtonActive,
        { backgroundColor: currentPage === page ? '#8A9E8E' : 'transparent' }
      ]}
      onPress={() => setCurrentPage(page)}
    >
      <Text style={[
        styles.paginationText,
        { color: currentPage === page ? '#ffffff' : currentTheme.mutedForeground }
      ]}>
        {page}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Tipos de Doença
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Novo Tipo</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Search */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.surface }]}>
            <Ionicons name="search" size={16} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar tipos de doença..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
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
            <View style={styles.actionCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                AÇÕES
              </Text>
            </View>
          </View>

          {/* Table Body */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: currentTheme.mutedForeground }]}>
                Carregando...
              </Text>
            </View>
          ) : currentTipos.length > 0 ? (
            <FlatList
              data={currentTipos}
              renderItem={renderTipoItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                {searchQuery ? 'Nenhum tipo encontrado para a busca realizada' : 'Nenhum tipo de doença cadastrado'}
              </Text>
            </View>
          )}
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity 
              style={styles.paginationArrow}
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <Ionicons 
                name="chevron-back" 
                size={20} 
                color={currentPage === 1 ? '#ccc' : currentTheme.mutedForeground} 
              />
            </TouchableOpacity>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(1, currentPage - 2);
              return startPage + i;
            }).filter(page => page <= totalPages).map(renderPaginationButton)}
            
            <TouchableOpacity 
              style={styles.paginationArrow}
              onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
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
        <View style={styles.infoFooter}>
          <Text style={[styles.infoText, { color: currentTheme.mutedForeground }]}>
            Total: {tiposDoenca.length} tipos de doença
          </Text>
          {tiposDoenca.length > itemsPerPage && (
            <Text style={[styles.infoText, { color: currentTheme.mutedForeground }]}>
              Página {currentPage} de {totalPages}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Form Modal */}
      <TipoDoencaForm
        visible={formVisible}
        tipoDoenca={selectedTipo}
        onSave={handleFormSubmit}
        onClose={() => {
          setFormVisible(false);
          setSelectedTipo(null);
        }}
      />

      {/* Confirm Delete Modal */}
      <Modal
        visible={confirmDeleteVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Confirmar Exclusão
              </Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.modalText, { color: currentTheme.text }]}>
                Tem certeza que deseja excluir o tipo de doença "{itemToDelete?.name}"?
              </Text>
              <Text style={[styles.modalSubtext, { color: currentTheme.mutedForeground }]}>
                Esta ação não pode ser desfeita.
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: currentTheme.border }]}
                onPress={() => setConfirmDeleteVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: currentTheme.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmButtonText}>
                  Excluir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.surface }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Sucesso!
              </Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.modalText, { color: currentTheme.text }]}>
                {successMessage}
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => setSuccessVisible(false)}
              >
                <Text style={styles.successButtonText}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
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
    flex: 3,
    justifyContent: 'center',
  },
  descriptionCell: {
    flex: 4,
    justifyContent: 'center',
    paddingRight: 8,
  },
  actionCell: {
    flex: 2,
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
  loadingContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
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
  infoFooter: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 8,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  successButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

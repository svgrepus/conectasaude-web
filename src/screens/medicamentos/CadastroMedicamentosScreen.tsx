import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, FlatList, Text, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { medicamentosService, Medicamento } from '../../services/medicamentosService';
import { MedicamentoForm } from '../../components/MedicamentoForm';

export const CadastroMedicamentosScreen: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Medicamento | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const itemsPerPage = 10;
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const fetchMedicamentos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Buscando medicamentos...');
      
      const response = await medicamentosService.getAll();
      console.log('✅ Medicamentos recebidos:', response.length, 'itens');
      setMedicamentos(response);
    } catch (err: any) {
      console.error('❌ Erro ao buscar medicamentos:', err);
      
      let errorMessage = 'Erro ao carregar medicamentos. Tente novamente.';
      if (err?.message) {
        errorMessage = `Erro ao carregar: ${err.message}`;
      }
      
      Alert.alert('Erro ao Carregar', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchMedicamentos = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchMedicamentos();
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await medicamentosService.search(query);
      setMedicamentos(response);
    } catch (err) {
      console.error('Erro ao buscar medicamentos:', err);
      Alert.alert(
        'Erro',
        'Erro ao buscar medicamentos. Tente novamente.',
        [{ text: 'OK' }]
      );
      setError('Erro ao buscar medicamentos');
    } finally {
      setLoading(false);
    }
  }, [fetchMedicamentos]);

  useEffect(() => {
    fetchMedicamentos();
  }, [fetchMedicamentos]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMedicamentos(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchMedicamentos]);

  const totalPages = Math.ceil(medicamentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicamentos = medicamentos.slice(startIndex, endIndex);

  const handleEdit = (item: Medicamento) => {
    setSelectedMedicamento(item);
    setFormVisible(true);
  };

  const handleAdd = () => {
    setSelectedMedicamento(null);
    setFormVisible(true);
  };

  const handleFormSubmit = async (data: Omit<Medicamento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError('');
      console.log('🔄 Salvando medicamento:', data);
      
      if (selectedMedicamento) {
        console.log('🔄 Atualizando medicamento ID:', selectedMedicamento.id);
        const result = await medicamentosService.update(selectedMedicamento.id!, data);
        console.log('✅ Medicamento atualizado:', result);
        setSuccessMessage('Medicamento atualizado com sucesso!');
      } else {
        console.log('🔄 Criando novo medicamento');
        const result = await medicamentosService.create(data);
        console.log('✅ Medicamento criado:', result);
        setSuccessMessage('Medicamento criado com sucesso!');
      }
      
      setFormVisible(false);
      setSelectedMedicamento(null);
      
      console.log('🔄 Recarregando lista de medicamentos...');
      await fetchMedicamentos();
      console.log('✅ Lista de medicamentos recarregada');
      
      setSuccessVisible(true);
      
    } catch (err: any) {
      console.error('❌ Erro ao salvar medicamento:', err);
      
      // Tratamento específico para diferentes tipos de erro
      let errorMessage = 'Erro ao salvar medicamento. Tente novamente.';
      
      if (err?.code === '23505' || err?.message?.includes('duplicate key')) {
        if (err?.message?.includes('codigo_interno')) {
          errorMessage = 'Código interno já existe. Por favor, use um código diferente.';
        } else {
          errorMessage = 'Já existe um medicamento com esses dados. Verifique os campos únicos.';
        }
      } else if (err?.code === '22008' || err?.message?.includes('date/time field value out of range')) {
        errorMessage = 'Data de validade inválida. Verifique o formato da data.';
      } else if (err?.message) {
        errorMessage = `Erro: ${err.message}`;
      }
      
      Alert.alert('Erro ao Salvar', errorMessage);
      setError(errorMessage);
    }
  };

  const handleDelete = (item: Medicamento) => {
    setItemToDelete(item);
    setConfirmDeleteVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setError('');
      console.log('🗑️ Excluindo medicamento:', itemToDelete.id, itemToDelete.nome_dcb);
      
      await medicamentosService.delete(itemToDelete.id!);
      console.log('✅ Medicamento excluído com sucesso');

      setConfirmDeleteVisible(false);
      setItemToDelete(null);
      setSuccessMessage('Medicamento excluído com sucesso!');
      
      console.log('🔄 Recarregando lista de medicamentos...');
      await fetchMedicamentos();
      console.log('✅ Lista recarregada após exclusão');
      
      setSuccessVisible(true);
      
    } catch (err: any) {
      console.error('❌ Erro ao excluir medicamento:', err);
      
      let errorMessage = 'Erro ao excluir medicamento. Tente novamente.';
      if (err?.message) {
        errorMessage = `Erro ao excluir: ${err.message}`;
      }
      
      Alert.alert('Erro ao Excluir', errorMessage);
      setError(errorMessage);
      setConfirmDeleteVisible(false);
      setItemToDelete(null);
    }
  };

  const renderMedicamentoItem = ({ item }: { item: Medicamento }) => (
    <View style={[styles.tableRow, { borderTopColor: currentTheme.border }]}>
      <View style={styles.nameCell}>
        <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]}>
          {item.nome_dcb || item.nome_dci || 'Sem nome'}
        </Text>
      </View>
      <View style={styles.descriptionCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.codigo_interno || '-'}
        </Text>
      </View>
      <View style={styles.statusCell}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'ATIVO' ? '#dcfce7' : '#fee2e2' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'ATIVO' ? '#166534' : '#991b1b' }
          ]}>
            {item.status || 'ATIVO'}
          </Text>
        </View>
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
            Cadastro de Medicamentos
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Novo Medicamento</Text>
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Search */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
            <Ionicons name="search" size={20} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar medicamentos..."
              placeholderTextColor={currentTheme.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Table */}
        <View style={[styles.tableContainer, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          {/* Table Header */}
          <View style={[styles.tableHeader, { borderBottomColor: currentTheme.border }]}>
            <View style={styles.nameCell}>
              <Text style={[styles.tableHeaderText, { color: currentTheme.mutedForeground }]}>NOME</Text>
            </View>
            <View style={styles.descriptionCell}>
              <Text style={[styles.tableHeaderText, { color: currentTheme.mutedForeground }]}>CÓDIGO</Text>
            </View>
            <View style={styles.statusCell}>
              <Text style={[styles.tableHeaderText, { color: currentTheme.mutedForeground }]}>STATUS</Text>
            </View>
            <View style={styles.actionCell}>
              <Text style={[styles.tableHeaderText, { color: currentTheme.mutedForeground }]}>AÇÕES</Text>
            </View>
          </View>

          {/* Table Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: currentTheme.mutedForeground }]}>
                Carregando medicamentos...
              </Text>
            </View>
          ) : currentMedicamentos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                {searchQuery ? 'Nenhum medicamento encontrado.' : 'Nenhum medicamento cadastrado.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={currentMedicamentos}
              renderItem={renderMedicamentoItem}
              keyExtractor={(item) => item.id || Math.random().toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationArrow, { opacity: currentPage === 1 ? 0.5 : 1 }]}
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <Ionicons name="chevron-back" size={20} color={currentTheme.mutedForeground} />
            </TouchableOpacity>

            <View style={styles.paginationNumbers}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, currentPage - 2);
                const page = startPage + i;
                return page <= totalPages ? renderPaginationButton(page) : null;
              })}
            </View>

            <TouchableOpacity
              style={[styles.paginationArrow, { opacity: currentPage === totalPages ? 0.5 : 1 }]}
              onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <Ionicons name="chevron-forward" size={20} color={currentTheme.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {/* Results Info */}
        {!loading && (
          <View style={styles.resultsInfo}>
            <Text style={[styles.resultsText, { color: currentTheme.mutedForeground }]}>
              Mostrando {startIndex + 1}-{Math.min(endIndex, medicamentos.length)} de {medicamentos.length} medicamentos
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Form Modal */}
      <Modal
        visible={formVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                {selectedMedicamento ? 'Editar Medicamento' : 'Novo Medicamento'}
              </Text>
              <TouchableOpacity onPress={() => setFormVisible(false)}>
                <Ionicons name="close" size={24} color={currentTheme.text} />
              </TouchableOpacity>
            </View>
            <MedicamentoForm
              initialData={selectedMedicamento}
              onSubmit={handleFormSubmit}
              onCancel={() => setFormVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={confirmDeleteVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModalContent, { backgroundColor: currentTheme.background }]}>
            <Text style={[styles.deleteModalTitle, { color: currentTheme.text }]}>
              Confirmar Exclusão
            </Text>
            <Text style={[styles.deleteModalText, { color: currentTheme.mutedForeground }]}>
              Tem certeza que deseja excluir o medicamento "{itemToDelete?.nome_dcb || itemToDelete?.nome_dci}"?
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: currentTheme.border }]}
                onPress={() => setConfirmDeleteVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: currentTheme.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.successModalContent, { backgroundColor: currentTheme.background }]}>
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            <Text style={[styles.successModalText, { color: currentTheme.text }]}>
              {successMessage}
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setSuccessVisible(false)}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A9E8E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 4,
  },
  tableContainer: {
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  nameCell: {
    flex: 3,
    paddingRight: 16,
  },
  descriptionCell: {
    flex: 2,
    paddingRight: 16,
  },
  statusCell: {
    flex: 1.5,
    paddingRight: 16,
  },
  actionCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cellTextPrimary: {
    fontSize: 14,
    fontWeight: '500',
  },
  cellTextSecondary: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#dc2626',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  paginationArrow: {
    padding: 8,
  },
  paginationNumbers: {
    flexDirection: 'row',
    gap: 4,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  paginationButtonActive: {
    backgroundColor: '#8A9E8E',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsInfo: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultsText: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  deleteModalContent: {
    width: '80%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 8,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteModalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  successModalContent: {
    width: '80%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  successModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  successButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#8A9E8E',
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
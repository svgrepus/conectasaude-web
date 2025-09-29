import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity, SafeAreaView, TextInput, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MicroareaForm } from '../../components/MicroareaForm';
import { microareaService, Microarea } from '../../services/microareaService';
import { theme } from '../../constants/theme';

export const MicroareaScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [microareas, setMicroareas] = useState<Microarea[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedMicroarea, setSelectedMicroarea] = useState<Microarea | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Estados para o modal de confirmação
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [microareaToDelete, setMicroareaToDelete] = useState<Microarea | null>(null);
  
  // Estado para modal de sucesso
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
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
          loadMicroareas(1, searchTerm);
        }, 500);
      };
    })(),
    []
  );

  // Carregar dados da API
  const loadMicroareas = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      console.log('🔍 MicroareaScreen: Carregando microareas', { page, search, searchQuery });

      const response = await microareaService.getMicroareas(page, itemsPerPage, search);
      
      console.log('📦 MicroareaScreen: Resposta recebida:', response);
      
      if (response.data) {
        setMicroareas(response.data);
        setCurrentPage(page);
        setTotalCount(response.count || 0);
        console.log('✅ MicroareaScreen: Estado atualizado', {
          microareasCount: response.data.length,
          totalCount: response.count,
          currentPage: page
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar microareas:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
      setMicroareas([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Effect para carregar dados iniciais
  useEffect(() => {
    console.log('🚀 MicroareaScreen: Componente montado, carregando dados iniciais');
    loadMicroareas(1);
  }, []);

  // Effect para busca com debounce
  useEffect(() => {
    console.log('🔄 Effect busca disparado:', searchQuery);
    if (searchQuery.trim() === '') {
      console.log('🔍 Busca vazia, carregando todos os dados');
      loadMicroareas(1);
    } else {
      console.log('🔍 Acionando debounce para:', searchQuery);
      debounceSearch(searchQuery);
    }
  }, [searchQuery, debounceSearch]);

  // Função para abrir formulário de criação
  const handleAdd = () => {
    setSelectedMicroarea(null);
    setFormVisible(true);
  };

  // Função para abrir formulário de edição
  const handleEdit = (microarea: Microarea) => {
    setSelectedMicroarea(microarea);
    setFormVisible(true);
  };

  // Função para salvar (criar/editar)
  const handleSave = async (data: { nome: string; descricao?: string; familias_cadastradas?: number; area_id: string; equipe_id?: string; ativa?: boolean }) => {
    try {
      setLoading(true);
      
      if (selectedMicroarea) {
        // Editando
        await microareaService.updateMicroarea(selectedMicroarea.id, data);
      } else {
        // Criando
        await microareaService.createMicroarea(data);
      }
      
      // Recarregar a lista
      await loadMicroareas(currentPage, searchQuery);
      
      // Fechar o formulário
      setFormVisible(false);
      setSelectedMicroarea(null);
      
      Alert.alert('Sucesso', selectedMicroarea ? 'Item atualizado com sucesso!' : 'Item criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar microarea:', error);
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir
  const handleDelete = async (microarea: Microarea) => {
    console.log('🚨 HANDLE DELETE CHAMADO!', microarea);
    console.log('🚨 ID:', microarea.id, 'Nome:', microarea.nome);
    
    // Abrir modal de confirmação
    setMicroareaToDelete(microarea);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!microareaToDelete) {
      console.log('❌ microareaToDelete é null, cancelando exclusão');
      return;
    }
    
    console.log('🚨 USUÁRIO CONFIRMOU EXCLUSÃO!');
    console.log('🚨 Fechando modal de confirmação...');
    setDeleteModalVisible(false);
    
    try {
      console.log('🚨 Iniciando processo de exclusão...');
      setLoading(true);
      console.log('🚨 CHAMANDO SERVIÇO DELETE...');
      
      // Executar exclusão no Supabase
      await microareaService.deleteMicroarea(microareaToDelete.id);
      console.log('🚨 EXCLUSÃO REALIZADA COM SUCESSO!');
      
      // Recarregar a lista
      console.log('🚨 RECARREGANDO LISTA...');
      await loadMicroareas(currentPage, searchQuery);
      console.log('🚨 TABELA ATUALIZADA!');
      
      // Mostrar sucesso usando modal personalizado
      console.log('🚨 Exibindo modal de sucesso...');
      setSuccessMessage('Item excluído com sucesso.');
      setSuccessModalVisible(true);
      
    } catch (error) {
      console.error('❌ Erro ao excluir microarea:', error);
      
      // Mostrar erro detalhado
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.log('🚨 Exibindo modal de erro...');
      setSuccessMessage(`Erro ao excluir: ${errorMessage}`);
      setSuccessModalVisible(true);
    } finally {
      console.log('🚨 Finalizando exclusão...');
      setLoading(false);
      setMicroareaToDelete(null);
    }
  };

  const cancelDelete = () => {
    console.log('🚫 Exclusão cancelada');
    setDeleteModalVisible(false);
    setMicroareaToDelete(null);
  };

  // Calcular informações de paginação
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  // Função para mudar página
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages && !loading) {
      loadMicroareas(page, searchQuery);
    }
  };

  // Renderizar item da tabela
  const renderMicroareaItem = ({ item }: { item: Microarea }) => {
    console.log('🔄 Renderizando item:', item.id, item.nome);
    return (
    <View style={[styles.tableRow, { borderTopColor: currentTheme.border }]}>
      <View style={styles.nameCell}>
        <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]}>
          {item.nome}
        </Text>
      </View>
      <View style={styles.areaCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.area_nome || '-'}
        </Text>
      </View>
      <View style={styles.equipeCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.equipe_nome || '-'}
        </Text>
      </View>
      <View style={styles.familiasCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.familias_cadastradas ? item.familias_cadastradas.toLocaleString() : '-'}
        </Text>
      </View>
      <View style={styles.statusCell}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.ativa ? '#dcfce7' : '#fee2e2' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.ativa ? '#166534' : '#991b1b' }
          ]}>
            {item.ativa ? 'Ativa' : 'Inativa'}
          </Text>
        </View>
      </View>
      <View style={styles.actionCell}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Text style={[styles.editButtonText, { color: '#8A9E8E' }]}>
            Editar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            console.log('🚨 CLIQUE NO BOTÃO EXCLUIR DETECTADO!');
            console.log('🚨 Item para excluir:', item.id, item.nome);
            handleDelete(item);
          }}
        >
          <Text style={styles.deleteButtonText}>
            Excluir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  // Renderizar componente de paginação
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View style={styles.paginationContainer}>
        {/* Botão anterior */}
        <TouchableOpacity
          style={[
            styles.paginationArrow,
            { 
              backgroundColor: currentPage > 1 ? currentTheme.muted : 'transparent',
              opacity: currentPage > 1 ? 1 : 0.5 
            }
          ]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
        >
          <Ionicons name="chevron-back" size={16} color={currentTheme.text} />
        </TouchableOpacity>

        {/* Primeira página se não estiver visível */}
        {startPage > 1 && (
          <>
            <TouchableOpacity
              style={[styles.paginationButton, { backgroundColor: currentTheme.muted }]}
              onPress={() => handlePageChange(1)}
              disabled={loading}
            >
              <Text style={[styles.paginationText, { color: currentTheme.text }]}>1</Text>
            </TouchableOpacity>
            {startPage > 2 && (
              <Text style={[styles.paginationDots, { color: currentTheme.mutedForeground }]}>...</Text>
            )}
          </>
        )}

        {/* Páginas visíveis */}
        {pageNumbers.map((pageNum) => (
          <TouchableOpacity
            key={pageNum}
            style={[
              styles.paginationButton,
              pageNum === currentPage && styles.paginationButtonActive,
              { backgroundColor: pageNum === currentPage ? '#8A9E8E' : currentTheme.muted }
            ]}
            onPress={() => handlePageChange(pageNum)}
            disabled={loading}
          >
            <Text 
              style={[
                styles.paginationText, 
                { color: pageNum === currentPage ? '#ffffff' : currentTheme.text }
              ]}
            >
              {pageNum}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Última página se não estiver visível */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <Text style={[styles.paginationDots, { color: currentTheme.mutedForeground }]}>...</Text>
            )}
            <TouchableOpacity
              style={[styles.paginationButton, { backgroundColor: currentTheme.muted }]}
              onPress={() => handlePageChange(totalPages)}
              disabled={loading}
            >
              <Text style={[styles.paginationText, { color: currentTheme.text }]}>
                {totalPages}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Botão próximo */}
        <TouchableOpacity
          style={[
            styles.paginationArrow,
            { 
              backgroundColor: currentPage < totalPages ? currentTheme.muted : 'transparent',
              opacity: currentPage < totalPages ? 1 : 0.5 
            }
          ]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
        >
          <Ionicons name="chevron-forward" size={16} color={currentTheme.text} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Microáreas
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.card }]}>
            <Ionicons name="search" size={16} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar por nome, área ou equipe..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Loading */}
        {loading && microareas.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8A9E8E" />
            <Text style={[styles.loadingText, { color: currentTheme.text }]}>
              Carregando microáreas...
            </Text>
          </View>
        )}

        {/* Tabela */}
        {!loading || microareas.length > 0 ? (
          <View style={[styles.tableContainer, { borderColor: currentTheme.border, backgroundColor: currentTheme.card }]}>
            {/* Header da tabela */}
            <View style={[styles.tableHeader, { backgroundColor: currentTheme.muted }]}>
              <View style={styles.nameCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Nome
                </Text>
              </View>
              <View style={styles.areaCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Área
                </Text>
              </View>
              <View style={styles.equipeCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Equipe
                </Text>
              </View>
              <View style={styles.familiasCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Famílias
                </Text>
              </View>
              <View style={styles.statusCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Status
                </Text>
              </View>
              <View style={styles.actionCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Ações
                </Text>
              </View>
            </View>

            {/* Lista de itens */}
            {microareas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                  {searchQuery ? 'Nenhum resultado encontrado para a busca.' : 'Nenhuma microárea cadastrada ainda.'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={microareas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMicroareaItem}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        ) : null}

        {/* Paginação */}
        {renderPagination()}

        {/* Informações do rodapé */}
        {totalCount > 0 && (
          <View style={styles.infoFooter}>
            <Text style={[styles.infoText, { color: currentTheme.mutedForeground }]}>
              Mostrando {startIndex} a {endIndex} de {totalCount} registros
            </Text>
          </View>
        )}
      </View>

      {/* Formulário Modal */}
      <MicroareaForm
        visible={formVisible}
        onClose={() => {
          setFormVisible(false);
          setSelectedMicroarea(null);
        }}
        onSave={handleSave}
        microarea={selectedMicroarea}
      />

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            
            <Text style={styles.modalMessage}>
              Deseja realmente deletar a microárea "{microareaToDelete?.nome}"?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteModalButton]} 
                onPress={confirmDelete}
              >
                <Text style={styles.deleteModalButtonText}>Deletar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Sucesso */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sucesso</Text>
            
            <Text style={styles.modalMessage}>
              {successMessage}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.successButton]} 
                onPress={() => setSuccessModalVisible(false)}
              >
                <Text style={styles.successButtonText}>OK</Text>
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
    flex: 1.8,
    justifyContent: 'center',
  },
  areaCell: {
    flex: 1.5,
    justifyContent: 'center',
    paddingRight: 8,
  },
  equipeCell: {
    flex: 1.5,
    justifyContent: 'center',
    paddingRight: 8,
  },
  familiasCell: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  statusCell: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCell: {
    flex: 1.2,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  deleteModalButton: {
    backgroundColor: '#dc2626',
  },
  deleteModalButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  successButton: {
    backgroundColor: '#22c55e',
  },
  successButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { MunicipeService } from '../../services/municipe';
import { Municipe } from '../../types';

interface ListaMunicipesScreenProps {
  onNavigateToCadastro: () => void;
  onNavigateToEdit: (municipe: Municipe) => void;
}

export interface ListaMunicipesScreenRef {
  reloadData: () => void;
}

export const ListaMunicipesScreen = forwardRef<ListaMunicipesScreenRef, ListaMunicipesScreenProps>(({ 
  onNavigateToCadastro,
  onNavigateToEdit
}, ref) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [municipes, setMunicipes] = useState<Municipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estados para o modal de confirmação
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [municipeToDelete, setMunicipeToDelete] = useState<Municipe | null>(null);

  const itemsPerPage = 10;
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Carregar dados da API
  const loadMunicipes = useCallback(async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      console.log('🔍 ListaMunicipesScreen: Carregando munícipes', { page, search, searchText });

      let response;
      if (search && search.trim()) {
        // Se há termo de busca, usar searchMunicipes
        response = await MunicipeService.searchMunicipes(search.trim());
        setMunicipes(response.data || []);
        setCurrentPage(1); // Reset para primeira página na busca
        setTotalCount(response.data?.length || 0);
      } else {
        // Se não há busca, carregar todos paginados
        response = await MunicipeService.getAllMunicipes(page, itemsPerPage);
        setMunicipes(response.data || []);
        setCurrentPage(page);
        setTotalCount((response as any).count || response.data?.length || 0);
      }
      
      console.log('📦 ListaMunicipesScreen: Resposta recebida:', response);
      console.log('✅ ListaMunicipesScreen: Estado atualizado', {
        municipesCount: response.data?.length || 0,
        totalCount: 'count' in response ? response.count : response.data?.length || 0,
        currentPage: page
      });
    } catch (error) {
      console.error('❌ Erro ao carregar munícipes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
      setMunicipes([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Expor função reloadData para o componente pai
  useImperativeHandle(ref, () => ({
    reloadData: () => {
      console.log("🔄 ListaMunicipesScreen: reloadData chamado via ref");
      setCurrentPage(1);
      setSearchText('');
      loadMunicipes(1, '');
    }
  }), [loadMunicipes]);

  // Debounce para busca
  const debounceSearch = useCallback(
    (() => {
      let timeoutId: any;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log('🔍 Realizando busca com debounce:', searchTerm);
          console.log('🔍 Resetando página para 1 na busca');
          setCurrentPage(1); // Reset da página antes de buscar
          loadMunicipes(1, searchTerm);
        }, 500); // 500ms de delay
      };
    })(),
    [loadMunicipes] // Agora podemos usar a dependência
  );

  // Effect para carregar dados iniciais
  useEffect(() => {
    console.log('🚀 ListaMunicipesScreen: Componente montado, carregando dados iniciais');
    loadMunicipes(1);
  }, []);

  // Effect para busca com debounce
  useEffect(() => {
    console.log('🔄 Effect busca disparado:', searchText);
    if (searchText.trim() === '') {
      console.log('🔍 Busca vazia, carregando todos os dados');
      loadMunicipes(1);
    } else {
      console.log('🔍 Acionando debounce para:', searchText);
      debounceSearch(searchText);
    }
  }, [searchText, debounceSearch]);

  // Função para editar munícipe
  const handleEdit = async (municipe: Municipe) => {
    try {
      console.log('✏️ Carregando dados completos do munícipe:', municipe);
      setLoading(true);
      
      // Buscar dados completos das views
      const municipeCompleto = await MunicipeService.getMunicipeById(municipe.id);
      console.log('✅ Dados completos carregados:', municipeCompleto);
      
      if (municipeCompleto.data) {
        onNavigateToEdit(municipeCompleto.data);
      } else {
        Alert.alert('Erro', municipeCompleto.error || 'Não foi possível carregar os dados completos do munícipe');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do munícipe:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados para edição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir munícipe
  const handleDelete = async (municipe: Municipe) => {
    console.log('🚨 HANDLE DELETE CHAMADO!', municipe);
    console.log('🚨 ID:', municipe.id, 'Nome:', municipe.nome_completo);
    
    // Abrir modal de confirmação
    setMunicipeToDelete(municipe);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!municipeToDelete) return;
    
    console.log('🚨 USUÁRIO CONFIRMOU EXCLUSÃO!');
    setDeleteModalVisible(false);
    
    try {
      setLoading(true);
      console.log('🚨 CHAMANDO SERVIÇO DELETE...');
      
      // Executar exclusão no Supabase
      await MunicipeService.deleteMunicipe(municipeToDelete.id);
      console.log('🚨 EXCLUSÃO REALIZADA COM SUCESSO!');
      
      // Recarregar a lista
      console.log('🚨 RECARREGANDO LISTA...');
      await loadMunicipes(currentPage, searchText);
      console.log('🚨 TABELA ATUALIZADA!');
      
      // Mostrar sucesso
      Alert.alert('Sucesso', 'Munícipe excluído com sucesso.');
      
    } catch (error) {
      console.error('❌ Erro ao excluir munícipe:', error);
      
      // Mostrar erro detalhado
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert(
        'Erro ao Excluir', 
        `Não foi possível excluir o munícipe.\n\nDetalhes: ${errorMessage}`
      );
    } finally {
      setLoading(false);
      setMunicipeToDelete(null);
    }
  };

  const cancelDelete = () => {
    console.log('🚫 Exclusão cancelada');
    setDeleteModalVisible(false);
    setMunicipeToDelete(null);
  };

  // Calcular informações de paginação
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  // Função para mudar página
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages && !loading) {
      loadMunicipes(page, searchText);
    }
  };

  // Renderizar item da tabela
  const renderMunicipeItem = ({ item }: { item: Municipe }) => {
    console.log('🔄 Renderizando item:', item.id, item.nome_completo);
    
    // Formatação de data para exibição
    const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString('pt-BR');
      } catch {
        return 'Data inválida';
      }
    };

    return (
      <View style={[styles.tableRow, { borderTopColor: currentTheme.border }]}>
        <View style={styles.nameCell}>
          <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]}>
            {item.nome_completo}
          </Text>
        </View>
        <View style={styles.cpfCell}>
          <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
            {item.cpf}
          </Text>
        </View>
        <View style={styles.phoneCell}>
          <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
            {item.telefone || '-'}
          </Text>
        </View>
        <View style={styles.dateCell}>
          <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View style={styles.actionCell}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editButtonText}>
              Editar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              console.log('🚨 CLIQUE NO BOTÃO EXCLUIR DETECTADO!');
              console.log('🚨 Item para excluir:', item.id, item.nome_completo);
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
            Munícipes
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onNavigateToCadastro}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Adicionar Munícipe</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.card }]}>
            <Ionicons name="search" size={16} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar por nome, CPF ou cartão SUS..."
              placeholderTextColor="#999999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Loading */}
        {loading && municipes.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8A9E8E" />
            <Text style={[styles.loadingText, { color: currentTheme.text }]}>
              Carregando munícipes...
            </Text>
          </View>
        )}

        {/* Tabela */}
        {!loading || municipes.length > 0 ? (
          <View style={[styles.tableContainer, { 
            backgroundColor: currentTheme.card, 
            borderColor: currentTheme.border 
          }]}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { backgroundColor: currentTheme.muted }]}>
              <View style={styles.nameCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  NOME
                </Text>
              </View>
              <View style={styles.cpfCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  CPF
                </Text>
              </View>
              <View style={styles.phoneCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  TELEFONE
                </Text>
              </View>
              <View style={styles.dateCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  CADASTRADO EM
                </Text>
              </View>
              <View style={styles.actionCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  AÇÕES
                </Text>
              </View>
            </View>

            {/* Lista de itens */}
            {municipes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                  {searchText ? 'Nenhum resultado encontrado para a busca.' : 'Nenhum munícipe cadastrado ainda.'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={municipes}
                keyExtractor={(item: Municipe) => item.id.toString()}
                renderItem={renderMunicipeItem}
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
              Deseja realmente deletar o munícipe "{municipeToDelete?.nome_completo}"?
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
    </SafeAreaView>
  );
});

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
    backgroundColor: '#8A9E8E', // Verde institucional da Prefeitura de Jambeiro
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
  cpfCell: {
    flex: 1.5,
    justifyContent: 'center',
    paddingRight: 8,
  },
  phoneCell: {
    flex: 1.5,
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
    color: '#8A9E8E', // Verde institucional da Prefeitura de Jambeiro - mesma cor dos outros cadastros
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
    backgroundColor: '#8A9E8E', // Verde institucional da Prefeitura de Jambeiro
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
});

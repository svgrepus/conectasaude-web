import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { 
  motoristasService, 
  type Motorista,
  type MotoristaCompleto
} from "../../services/motoristasService";

interface ListaMotoristasScreenProps {
  onNavigateToCadastro: () => void;
  onNavigateToEdit: (motorista: MotoristaCompleto) => void;
}

export interface ListaMotoristasScreenRef {
  reloadData: () => void;
}

export const ListaMotoristasScreen = forwardRef<ListaMotoristasScreenRef, ListaMotoristasScreenProps>(({ 
  onNavigateToCadastro,
  onNavigateToEdit
}, ref) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [motoristas, setMotoristas] = useState<MotoristaCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estados para o modal de confirmação
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [motoristaToDelete, setMotoristaToDelete] = useState<MotoristaCompleto | null>(null);

  const itemsPerPage = 10;
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Carregar dados da API
  const loadMotoristas = useCallback(async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      console.log('🔍 ListaMotoristasScreen: Carregando motoristas', { page, search, searchText });

      const response = await motoristasService.listarMotoristas();
      let filteredData = response || [];
      
      // Aplicar filtro de busca se necessário
      if (search && search.trim()) {
        const searchTerm = search.toLowerCase().trim();
        filteredData = response.filter((item: MotoristaCompleto) => 
          item.motorista.nome.toLowerCase().includes(searchTerm) ||
          item.motorista.cpf.includes(searchTerm) ||
          (item.motorista.email && item.motorista.email.toLowerCase().includes(searchTerm)) ||
          item.motorista.telefone.includes(searchTerm)
        );
      }
      
      setMotoristas(filteredData);
      setTotalCount(filteredData.length);
      
      console.log('📦 ListaMotoristasScreen: Resposta recebida:', filteredData.length);
    } catch (error) {
      console.error('❌ Erro ao carregar motoristas:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
      setMotoristas([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Expor função reloadData para o componente pai
  useImperativeHandle(ref, () => ({
    reloadData: () => {
      console.log("🔄 ListaMotoristasScreen: reloadData chamado via ref");
      setCurrentPage(1);
      setSearchText('');
      loadMotoristas(1, '');
    }
  }), [loadMotoristas]);

  // Debounce para busca
  const debounceSearch = useCallback(
    (() => {
      let timeoutId: any;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          loadMotoristas(1, searchTerm);
        }, 500);
      };
    })(),
    [loadMotoristas]
  );

  // Carregar motoristas ao focar na tela
  useEffect(() => {
    loadMotoristas();
  }, []);

  // Busca com debounce
  useEffect(() => {
    debounceSearch(searchText);
  }, [searchText, debounceSearch]);

  const handleEdit = async (motoristaCompleto: MotoristaCompleto) => {
    try {
      setLoading(true);
      // Os dados já estão completos, só navegar
      onNavigateToEdit(motoristaCompleto);
    } catch (error) {
      console.error('Erro ao editar motorista:', error);
      Alert.alert("Erro", "Não foi possível carregar os dados do motorista para edição");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (motoristaCompleto: MotoristaCompleto) => {
    console.log('🚨 CLIQUE NO BOTÃO EXCLUIR DETECTADO!');
    console.log('🚨 Item para excluir:', motoristaCompleto.motorista.id, motoristaCompleto.motorista.nome);
    setMotoristaToDelete(motoristaCompleto);
    setDeleteModalVisible(true);
  };

  const confirmarExclusao = async () => {
    if (!motoristaToDelete) return;
    
    try {
      await motoristasService.excluirMotorista(motoristaToDelete.motorista.id!, "Exclusão via aplicativo");
      setDeleteModalVisible(false);
      setMotoristaToDelete(null);
      loadMotoristas(); // Recarregar lista
      Alert.alert("Sucesso", "Motorista excluído com sucesso");
    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
      Alert.alert("Erro", "Não foi possível excluir o motorista");
    }
  };

  const cancelarExclusao = () => {
    setDeleteModalVisible(false);
    setMotoristaToDelete(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const renderMotoristaItem = ({ item }: { item: MotoristaCompleto }) => (
    <View style={[styles.tableRow, { borderBottomColor: currentTheme.border }]}>
      <View style={styles.nameCell}>
        <Text style={[styles.cellText, { color: currentTheme.text }]} numberOfLines={1}>
          {item.motorista.nome}
        </Text>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]} numberOfLines={1}>
          {formatCPF(item.motorista.cpf)}
        </Text>
      </View>
      <View style={styles.phoneCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {formatPhone(item.motorista.telefone)}
        </Text>
      </View>
      <View style={styles.dateCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {formatDate(item.motorista.created_at)}
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
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>
            Excluir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color={currentTheme.mutedForeground} />
      <Text style={[styles.emptyText, { color: currentTheme.text }]}>
        Nenhum motorista encontrado
      </Text>
      <Text style={[styles.emptySubtext, { color: currentTheme.mutedForeground }]}>
        {searchText ? 'Tente ajustar os filtros de busca' : 'Toque no botão Adicionar para cadastrar o primeiro motorista'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Motoristas
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onNavigateToCadastro}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Adicionar Motorista</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.card }]}>
            <Ionicons name="search" size={16} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar por nome, CPF, email ou telefone..."
              placeholderTextColor="#999999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Loading */}
        {loading && motoristas.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8A9E8E" />
            <Text style={[styles.loadingText, { color: currentTheme.text }]}>
              Carregando motoristas...
            </Text>
          </View>
        )}

        {/* Tabela */}
        {!loading || motoristas.length > 0 ? (
          <View style={[styles.tableContainer, { 
            backgroundColor: currentTheme.card, 
            borderColor: currentTheme.border 
          }]}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { backgroundColor: currentTheme.muted }]}>
              <View style={styles.nameCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Nome / CPF
                </Text>
              </View>
              <View style={styles.phoneCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Telefone
                </Text>
              </View>
              <View style={styles.dateCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Cadastro
                </Text>
              </View>
              <View style={styles.actionCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Ações
                </Text>
              </View>
            </View>

            {/* Lista */}
            <FlatList
              data={motoristas}
              renderItem={renderMotoristaItem}
              keyExtractor={(item) => item.id!}
              ListEmptyComponent={renderEmptyList}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            />
          </View>
        ) : null}

        {/* Total */}
        {!loading && (
          <View style={styles.totalContainer}>
            <Text style={[styles.totalText, { color: currentTheme.text }]}>
              Total: {totalCount} motorista{totalCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelarExclusao}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Confirmar Exclusão
            </Text>
            <Text style={[styles.modalMessage, { color: currentTheme.mutedForeground }]}>
              Deseja realmente excluir o motorista{' '}
              <Text style={{ fontWeight: 'bold', color: currentTheme.text }}>
                {motoristaToDelete?.motorista?.nome}
              </Text>
              ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelarExclusao}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmarExclusao}
              >
                <Text style={styles.confirmButtonText}>Excluir</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8A9E8E", // Verde institucional da Prefeitura de Jambeiro
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  tableContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  nameCell: {
    flex: 3,
    paddingRight: 8,
  },
  phoneCell: {
    flex: 2,
    paddingRight: 8,
  },
  dateCell: {
    flex: 2,
    paddingRight: 8,
  },
  actionCell: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cellText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  cellTextSecondary: {
    fontSize: 12,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    color: "#8A9E8E", // Verde institucional da Prefeitura de Jambeiro - mesma cor dos outros cadastros
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
  },
  totalContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    margin: 20,
    borderRadius: 8,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#dc2626",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ListaMotoristasScreen;
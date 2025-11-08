import React, { useState, useEffect, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { theme } from "../../constants/theme";
import { authService } from "../../services/auth-simple";
import { administradoresService } from "../../services/administradoresService";

interface AdminUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    display_name?: string;
    telefone?: string;
    data_nascimento?: string;
    role?: string;
  };
  app_metadata?: {
    role?: string;
  };
  created_at?: string;
  last_sign_in_at?: string;
}

interface ListaAdministradoresScreenProps {
  onNavigateToCadastro: () => void;
  onNavigateToEdit: (admin: AdminUser) => void;
  refreshTrigger?: number;
}

export const ListaAdministradoresScreen: React.FC<ListaAdministradoresScreenProps> = ({
  onNavigateToCadastro,
  onNavigateToEdit,
  refreshTrigger
}) => {
  const [isDarkMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [administradores, setAdministradores] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [administradorToDelete, setAdministradorToDelete] = useState<AdminUser | null>(null);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Carregar dados da API
  const loadAdministradores = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 ListaAdministradoresScreen: Carregando administradores');

      // Obter o token de acesso
      const accessToken = authService.getAccessToken();
      
      if (!accessToken) {
        throw new Error("Token de acesso não encontrado");
      }
      
      const response = await fetch('https://neqkqjpynrinlsodfrkf.functions.supabase.co/admin-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const usuarios = data.users || [];
      
      setAdministradores(usuarios);
      console.log('📦 ListaAdministradoresScreen: Administradores carregados:', usuarios.length);
    } catch (error) {
      console.error('❌ Erro ao carregar administradores:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
      setAdministradores([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recarregar quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 ListaAdministradoresScreen: Tela recebeu foco, recarregando dados...");
      loadAdministradores();
    }, [loadAdministradores])
  );

  // Recarregar quando refreshTrigger muda
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log("🔄 ListaAdministradoresScreen: RefreshTrigger ativado, recarregando dados...", refreshTrigger);
      loadAdministradores();
    }
  }, [refreshTrigger, loadAdministradores]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdministradores();
  };

  const handleDelete = (admin: AdminUser) => {
    setAdministradorToDelete(admin);
    setDeleteModalVisible(true);
  };

  const cancelarExclusao = () => {
    setDeleteModalVisible(false);
    setAdministradorToDelete(null);
  };

  const confirmarExclusao = async () => {
    if (!administradorToDelete) return;

    try {
      console.log("🗑️ Excluindo administrador:", administradorToDelete.id);
      
      // Chamar service de exclusão
      await administradoresService.deletarAdministrador(administradorToDelete.id);
      
      // Fechar modal
      setDeleteModalVisible(false);
      setAdministradorToDelete(null);
      
      // Recarregar lista
      await loadAdministradores();
      
      Alert.alert("Sucesso", "Administrador excluído com sucesso");
    } catch (error) {
      console.error("❌ Erro ao excluir:", error);
      Alert.alert("Erro", "Erro ao excluir administrador");
      
      // Fechar modal mesmo em caso de erro
      setDeleteModalVisible(false);
      setAdministradorToDelete(null);
    }
  };

  const handleEdit = (admin: AdminUser) => {
    onNavigateToEdit(admin);
  };

  // Filtrar administradores baseado na busca
  const filteredAdmins = administradores.filter(admin => 
    admin.email.toLowerCase().includes(searchText.toLowerCase()) ||
    (admin.user_metadata?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (admin.user_metadata?.full_name || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderAdminItem = ({ item }: { item: AdminUser }) => (
    <View style={[styles.tableRow, { borderBottomColor: currentTheme.border }]}>
      <View style={styles.nameCell}>
        <Text style={[styles.cellText, { color: currentTheme.text }]} numberOfLines={1}>
          {item.user_metadata?.full_name || item.user_metadata?.name || 'Nome não informado'}
        </Text>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]} numberOfLines={1}>
          {item.email}
        </Text>
      </View>
      <View style={styles.roleCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.app_metadata?.role || item.user_metadata?.role || 'N/A'}
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
      <Ionicons name="shield-outline" size={64} color={currentTheme.mutedForeground} />
      <Text style={[styles.emptyText, { color: currentTheme.text }]}>
        Nenhum administrador encontrado
      </Text>
      <Text style={[styles.emptySubtext, { color: currentTheme.mutedForeground }]}>
        {searchText ? 'Tente ajustar os filtros de busca' : 'Toque no botão Adicionar para cadastrar o primeiro administrador'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Administradores
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={onNavigateToCadastro}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Adicionar Administrador</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.card }]}>
            <Ionicons name="search" size={16} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar por email ou nome..."
              placeholderTextColor="#999999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Loading */}
        {loading && administradores.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8A9E8E" />
            <Text style={[styles.loadingText, { color: currentTheme.text }]}>
              Carregando administradores...
            </Text>
          </View>
        )}

        {/* Tabela */}
        {!loading || administradores.length > 0 ? (
          <View style={[styles.tableContainer, {
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border
          }]}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { backgroundColor: currentTheme.muted }]}>
              <View style={styles.nameCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Nome / Email
                </Text>
              </View>
              <View style={styles.roleCell}>
                <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                  Role
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
              data={filteredAdmins}
              keyExtractor={(item) => item.id}
              renderItem={renderAdminItem}
              ListEmptyComponent={renderEmptyList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
            />
          </View>
        ) : null}
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
              Deseja realmente excluir o administrador{' '}
              <Text style={{ fontWeight: 'bold', color: currentTheme.text }}>
                {administradorToDelete?.user_metadata?.full_name || 
                 administradorToDelete?.user_metadata?.name || 
                 administradorToDelete?.email}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
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
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  tableContainer: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerText: {
    fontWeight: "600",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  nameCell: {
    flex: 2,
  },
  roleCell: {
    flex: 1,
    alignItems: "center",
  },
  dateCell: {
    flex: 1,
    alignItems: "center",
  },
  actionCell: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  cellText: {
    fontSize: 16,
    fontWeight: "500",
  },
  cellTextSecondary: {
    fontSize: 14,
    marginTop: 2,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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

export default ListaAdministradoresScreen;
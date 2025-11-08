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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { authService } from "../../services/auth-simple";

interface AdminUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
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
  onNavigateToEdit: (administrador: AdminUser) => void;
}

const ListaAdministradoresScreen: React.FC<ListaAdministradoresScreenProps> = ({
  onNavigateToCadastro,
  onNavigateToEdit,
}) => {
  const [administradores, setAdministradores] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Verificar se usuário é admin ao montar o componente
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const user = await authService.getCurrentUser();
        const hasAdminRole = user?.role === "admin";
        setIsAdmin(hasAdminRole);
        
        if (!hasAdminRole) {
          Alert.alert(
            "Acesso Negado",
            "Você não tem permissão para acessar esta funcionalidade.",
            [{ text: "OK" }]
          );
          return;
        }
        
        // Se é admin, carregar a lista
        await loadAdministradores();
      } catch (error) {
        console.error("❌ Erro ao verificar permissões:", error);
        setIsAdmin(false);
        Alert.alert("Erro", "Erro ao verificar permissões de acesso.");
      }
    };

    checkAdminRole();
  }, []);

  const loadAdministradores = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📋 Carregando lista de administradores...");

      const listaAdministradores = await administradoresService.getAdministradores();
      console.log("✅ Administradores carregados:", listaAdministradores.length);
      
      setAdministradores(listaAdministradores);
    } catch (error) {
      console.error("❌ Erro ao carregar administradores:", error);
      Alert.alert(
        "Erro ao Carregar",
        "Não foi possível carregar a lista de administradores. Tente novamente."
      );
      setAdministradores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAdministradores();
    setRefreshing(false);
  }, [loadAdministradores]);

  const handleDeleteAdministrador = async (administrador: AdminUser) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir o administrador ${administrador.email}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await administradoresService.deletarAdministrador(administrador.id);
              Alert.alert("Sucesso", "Administrador excluído com sucesso!");
              await loadAdministradores();
            } catch (error) {
              console.error("❌ Erro ao excluir administrador:", error);
              Alert.alert("Erro", "Erro ao excluir administrador. Tente novamente.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Não informado";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
  };

  const getRoleDisplayName = (role: string | undefined): string => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "funcionario":
        return "Funcionário";
      case "municipe":
        return "Munícipe";
      default:
        return role || "Não definido";
    }
  };

  const getRoleColor = (role: string | undefined): string => {
    switch (role) {
      case "admin":
        return "#dc3545"; // Vermelho para admin
      case "funcionario":
        return "#0d6efd"; // Azul para funcionário
      case "municipe":
        return "#198754"; // Verde para munícipe
      default:
        return currentTheme.mutedForeground;
    }
  };

  // Se não é admin, não renderizar nada ou mostrar mensagem de acesso negado
  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="shield-outline" size={64} color={currentTheme.mutedForeground} />
          <Text style={[styles.accessDeniedTitle, { color: currentTheme.text }]}>
            Acesso Restrito
          </Text>
          <Text style={[styles.accessDeniedText, { color: currentTheme.mutedForeground }]}>
            Esta funcionalidade é exclusiva para administradores do sistema.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.surface, borderBottomColor: currentTheme.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#8A9E8E" />
            <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
              Administradores
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={onNavigateToCadastro}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Novo Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A9E8E" />
          <Text style={[styles.loadingText, { color: currentTheme.text }]}>
            Carregando administradores...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#8A9E8E"]}
              tintColor="#8A9E8E"
            />
          }
        >
          {administradores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={currentTheme.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: currentTheme.text }]}>
                Nenhum administrador encontrado
              </Text>
              <Text style={[styles.emptySubtitle, { color: currentTheme.mutedForeground }]}>
                Clique em "Novo Admin" para cadastrar o primeiro administrador.
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {administradores.map((administrador, index) => (
                <View
                  key={administrador.id || index}
                  style={[
                    styles.administradorCard,
                    { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }
                  ]}
                >
                  {/* Header do Card */}
                  <View style={styles.cardHeader}>
                    <View style={styles.administradorInfo}>
                      <Text style={[styles.administradorEmail, { color: currentTheme.text }]}>
                        {administrador.email}
                      </Text>
                      <Text style={[styles.administradorName, { color: currentTheme.mutedForeground }]}>
                        {administrador.user_metadata?.full_name || 
                         administrador.user_metadata?.name || 
                         "Nome não informado"}
                      </Text>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => onNavigateToEdit(administrador)}
                      >
                        <Ionicons name="pencil" size={16} color="#0d6efd" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteAdministrador(administrador)}
                      >
                        <Ionicons name="trash" size={16} color="#dc3545" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Informações do Administrador */}
                  <View style={styles.administradorDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="shield" size={14} color={getRoleColor(administrador.app_metadata?.role)} />
                      <Text style={[styles.detailLabel, { color: currentTheme.mutedForeground }]}>
                        Função:
                      </Text>
                      <Text style={[styles.detailValue, { color: getRoleColor(administrador.app_metadata?.role) }]}>
                        {getRoleDisplayName(administrador.app_metadata?.role)}
                      </Text>
                    </View>

                    {administrador.phone && (
                      <View style={styles.detailRow}>
                        <Ionicons name="call" size={14} color={currentTheme.mutedForeground} />
                        <Text style={[styles.detailLabel, { color: currentTheme.mutedForeground }]}>
                          Telefone:
                        </Text>
                        <Text style={[styles.detailValue, { color: currentTheme.text }]}>
                          {administrador.phone}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Ionicons name="calendar" size={14} color={currentTheme.mutedForeground} />
                      <Text style={[styles.detailLabel, { color: currentTheme.mutedForeground }]}>
                        Criado em:
                      </Text>
                      <Text style={[styles.detailValue, { color: currentTheme.text }]}>
                        {formatDate(administrador.created_at)}
                      </Text>
                    </View>

                    {administrador.last_sign_in_at && (
                      <View style={styles.detailRow}>
                        <Ionicons name="time" size={14} color={currentTheme.mutedForeground} />
                        <Text style={[styles.detailLabel, { color: currentTheme.mutedForeground }]}>
                          Último acesso:
                        </Text>
                        <Text style={[styles.detailValue, { color: currentTheme.text }]}>
                          {formatDate(administrador.last_sign_in_at)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: "#8A9E8E",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
  },
  administradorCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  administradorInfo: {
    flex: 1,
  },
  administradorEmail: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  administradorName: {
    fontSize: 14,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#e3f2fd",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#ffebee",
  },
  administradorDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
});

export default ListaAdministradoresScreen;
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../../services/auth-simple";
import { theme } from "../../constants/theme";

// Container de Administradores funcional
const AdministradoresContainer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const currentTheme = theme.light; // Usando tema padrão

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      setLoading(true);
      
      // getCurrentUser retorna Promise
      const user = await authService.getCurrentUser();
      
      console.log("🔍 DEBUG - Dados completos do usuário:", JSON.stringify(user, null, 2));
      console.log("🔍 DEBUG - Tipo do usuário:", typeof user);
      console.log("🔍 DEBUG - Keys do usuário:", user ? Object.keys(user) : 'N/A');
      console.log("🔍 DEBUG - Role do usuário:", user?.role);
      console.log("🔍 DEBUG - Verificação role === 'admin':", user?.role === 'admin');
      
      // Verificar também no sessionStorage
      const storedUser = sessionStorage.getItem('auth_user');
      console.log("🔍 DEBUG - Usuário no sessionStorage:", storedUser);
      
      if (!user) {
        console.log("❌ Usuário não encontrado");
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      // Verificar role (agora salva corretamente pelo AuthService)
      const userRole = user.role;
      
      console.log("🔍 Verificação de role:");
      console.log("  - Role do usuário:", userRole);
      console.log("  - É admin?", userRole === "admin");

      if (userRole === "admin") {
        console.log("✅ Usuário é admin, liberando acesso");
        setIsAdmin(true);
      } else {
        console.log("❌ Usuário não é admin");
        console.log("❌ Role encontrada:", userRole);
        setAccessDenied(true);
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Erro ao verificar permissões:", error);
      setAccessDenied(true);
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Verificando permissões...
        </Text>
      </View>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={[styles.header, { backgroundColor: currentTheme.destructive }]}>
          <Text style={styles.headerTitle}>🚫 Acesso Negado</Text>
          <Text style={styles.headerSubtitle}>Permissão insuficiente</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.developmentText, { backgroundColor: "#fee", color: "#721c24" }]}>
            ❌ Acesso negado ao módulo de Administradores
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.text }]}>
            • Apenas usuários com perfil de administrador podem acessar este módulo{'\n'}
            • Verifique com o administrador do sistema suas permissões{'\n'}
            • Faça login com uma conta que tenha privilégios administrativos
          </Text>
        </View>
      </View>
    );
  }

  // Admin access granted - render the full admin management system
  return <AdminManagementSystem />;
};

// Sistema completo de gerenciamento de administradores
const AdminManagementSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<"lista" | "cadastro" | "editar">("lista");
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigateToCadastro = () => {
    setSelectedAdmin(null);
    setCurrentView("cadastro");
  };

  const handleNavigateToEdit = (admin: any) => {
    setSelectedAdmin(admin);
    setCurrentView("editar");
  };

  const handleBackToList = () => {
    setSelectedAdmin(null);
    setCurrentView("lista");
    setRefreshKey(prev => prev + 1); // Force refresh
  };

  if (currentView === "cadastro") {
    return (
      <CadastroAdminScreen 
        onBack={handleBackToList}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  if (currentView === "editar" && selectedAdmin) {
    return (
      <CadastroAdminScreen
        onBack={handleBackToList}
        adminToEdit={selectedAdmin}
        isEdit={true}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  return (
    <ListaAdminScreen 
      key={refreshKey}
      onNavigateToCadastro={handleNavigateToCadastro}
      onNavigateToEdit={handleNavigateToEdit}
    />
  );
};

// Tela de listagem dos administradores
const ListaAdminScreen: React.FC<{
  onNavigateToCadastro: () => void;
  onNavigateToEdit: (admin: any) => void;
}> = ({ onNavigateToCadastro, onNavigateToEdit }) => {
  const [administradores, setAdministradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const currentTheme = theme.light;

  useEffect(() => {
    loadAdministradores();
  }, []);

  const loadAdministradores = async () => {
    try {
      setLoading(true);
      
      // Fazer chamada para a Edge Function
      const user = await authService.getCurrentUser();
      console.log("🔍 Usuário completo:", user);
      
      // Obter o token de acesso
      const accessToken = authService.getAccessToken();
      
      console.log("🔑 Access token encontrado:", accessToken ? 'Sim' : 'Não');
      console.log("🔑 Token preview:", accessToken?.substring(0, 50) + '...');
      
      if (!accessToken) {
        throw new Error("Token de acesso não encontrado");
      }
      
      console.log("🌐 Fazendo chamada para Edge Function...");
      const response = await fetch('https://neqkqjpynrinlsodfrkf.functions.supabase.co/admin-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro na resposta:", errorText);
        throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Resposta da API:", data);
      
      // A API retorna { users: [...], total: number, etc }
      const usuarios = data.users || [];
      console.log("✅ Administradores encontrados:", usuarios.length);
      
      setAdministradores(usuarios);
      
    } catch (error) {
      console.error("❌ Erro ao carregar administradores:", error);
      Alert.alert("Erro", `Erro ao carregar lista de administradores: ${(error as any)?.message || error}`);
      setAdministradores([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdministradores();
  };

  const handleDeleteAdmin = async (admin: any) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir o administrador ${admin.email}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: async () => {
            try {
              // Implementar delete via Edge Function
              console.log("🗑️ Excluindo administrador:", admin.id);
              // Por enquanto apenas remover da lista local
              setAdministradores(prev => prev.filter(a => a.id !== admin.id));
              Alert.alert("Sucesso", "Administrador excluído com sucesso");
            } catch (error) {
              console.error("❌ Erro ao excluir:", error);
              Alert.alert("Erro", "Erro ao excluir administrador");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[adminStyles.loadingContainer, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={[adminStyles.loadingText, { color: currentTheme.text }]}>
          Carregando administradores...
        </Text>
      </View>
    );
  }

  return (
    <View style={[adminStyles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[adminStyles.header, { backgroundColor: currentTheme.surface, borderBottomColor: currentTheme.border }]}>
        <View style={adminStyles.headerContent}>
          <Text style={[adminStyles.headerTitle, { color: currentTheme.text }]}>
            Administradores
          </Text>
          <TouchableOpacity 
            style={[adminStyles.addButton, { backgroundColor: currentTheme.primary }]}
            onPress={onNavigateToCadastro}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={adminStyles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista */}
      <ScrollView 
        style={adminStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {administradores.length === 0 ? (
          <View style={adminStyles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={currentTheme.mutedForeground} />
            <Text style={[adminStyles.emptyTitle, { color: currentTheme.text }]}>
              Nenhum administrador encontrado
            </Text>
            <Text style={[adminStyles.emptySubtitle, { color: currentTheme.mutedForeground }]}>
              Clique em "Novo" para adicionar um administrador
            </Text>
          </View>
        ) : (
          administradores.map((admin, index) => (
            <View 
              key={admin.id || index} 
              style={[adminStyles.adminCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
            >
              <View style={adminStyles.adminInfo}>
                <Text style={[adminStyles.adminEmail, { color: currentTheme.text }]}>
                  {admin.email}
                </Text>
                <Text style={[adminStyles.adminName, { color: currentTheme.mutedForeground }]}>
                  {admin.user_metadata?.full_name || admin.user_metadata?.name || 'Nome não informado'}
                </Text>
                <Text style={[adminStyles.adminRole, { color: currentTheme.primary }]}>
                  Role: {admin.app_metadata?.role || admin.user_metadata?.role || 'N/A'}
                </Text>
                <Text style={[adminStyles.adminMeta, { color: currentTheme.mutedForeground }]}>
                  Criado: {admin.created_at ? new Date(admin.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </Text>
                {admin.last_sign_in_at && (
                  <Text style={[adminStyles.adminMeta, { color: currentTheme.mutedForeground }]}>
                    Último login: {new Date(admin.last_sign_in_at).toLocaleDateString('pt-BR')}
                  </Text>
                )}
              </View>
              
              <View style={adminStyles.adminActions}>
                <TouchableOpacity 
                  style={adminStyles.editButton}
                  onPress={() => onNavigateToEdit(admin)}
                >
                  <Ionicons name="pencil" size={16} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={adminStyles.deleteButton}
                  onPress={() => handleDeleteAdmin(admin)}
                >
                  <Ionicons name="trash" size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

// Tela de cadastro/edição (placeholder)
const CadastroAdminScreen: React.FC<{
  onBack: () => void;
  adminToEdit?: any;
  isEdit?: boolean;
  onSaveSuccess: () => void;
}> = ({ onBack, adminToEdit, isEdit = false }) => {
  const currentTheme = theme.light;

  return (
    <View style={[adminStyles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[adminStyles.header, { backgroundColor: currentTheme.surface, borderBottomColor: currentTheme.border }]}>
        <View style={adminStyles.headerContent}>
          <TouchableOpacity onPress={onBack} style={adminStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={currentTheme.text} />
          </TouchableOpacity>
          <Text style={[adminStyles.headerTitle, { color: currentTheme.text }]}>
            {isEdit ? "Editar Administrador" : "Novo Administrador"}
          </Text>
        </View>
      </View>
      
      <View style={adminStyles.content}>
        <Text style={[adminStyles.developmentNotice, { color: currentTheme.mutedForeground }]}>
          🚧 Tela de cadastro em desenvolvimento
        </Text>
        <Text style={[adminStyles.developmentText, { color: currentTheme.text }]}>
          Esta tela seguirá o mesmo layout do cadastro de motoristas{'\n'}
          e permitirá criar/editar administradores via Edge Functions.
        </Text>
      </View>
    </View>
  );
};

const adminStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  addButton: {
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
  content: {
    flex: 1,
    padding: 20,
  },
  adminCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  adminInfo: {
    flex: 1,
  },
  adminEmail: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  adminName: {
    fontSize: 14,
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 12,
    fontWeight: "500",
  },
  adminMeta: {
    fontSize: 11,
    fontWeight: "400",
    marginTop: 2,
  },
  adminActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#e0f2fe",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#fef2f2",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  developmentNotice: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  developmentText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#8A9E8E",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  developmentText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d5016",
    textAlign: "center",
    marginBottom: 20,
    backgroundColor: "#d4edda",
    padding: 15,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
    marginBottom: 30,
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#8A9E8E",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginRight: 10,
  },
  statusReady: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d5016",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },
  nextStepsContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  nextStepsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AdministradoresContainer;
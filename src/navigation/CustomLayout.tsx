import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks";
import { BrasaoJambeiro } from "../components/BrasaoJambeiro";
import { createStackNavigator } from "@react-navigation/stack";
import { navigate, onRouteChange, getCurrentRoute } from "./navigationService";
import { authService } from "../services/auth-simple";

// Screens
import { DashboardScreen } from "../screens/DashboardScreen";
import {
  MedicamentosScreen,
  MotoristasScreen,
  VeiculosScreen,
  CadastrosBasicosScreen,
} from "../screens/PlaceholderScreens";
import { MunicipesContainer } from "../screens/municipes/MunicipesContainer";
import {
  DoencaCronicaScreen,
  TipoDoencaScreen,
  TipoVeiculoScreen,
  CargoScreen,
  EquipeScreen,
  UnidadeScreen,
  AreaScreen,
  MicroareaScreen,
  CadastroMedicamentosScreen,
  EstoqueMedicamentosScreen,
} from "../screens/cadastros";
import { MunicipeDetailScreen } from "../screens/municipes/MunicipeDetailScreen";
import { MunicipeDetailScreenWrapper } from "../screens/municipes/MunicipeDetailScreenWrapper";
import { LoginScreen } from "../screens/LoginScreen";
import AdministradoresContainer from "../screens/administradores/AdministradoresContainer";

const Stack = createStackNavigator();

const { width } = Dimensions.get("window");
const isWeb = width > 768; // Detecta se é web/desktop

// Function to get screen component based on screen name
const getScreenComponent = (screenName: string) => {
  const screenComponents: { [key: string]: React.ComponentType<any> } = {
    Dashboard: DashboardScreen,
    Medicamentos: MedicamentosScreen,
    CadastroMedicamentos: CadastroMedicamentosScreen,
    EstoqueMedicamentos: EstoqueMedicamentosScreen,
    Motoristas: MotoristasScreen,
    Veículos: VeiculosScreen,
    Munícipes: MunicipesContainer,
    Administradores: AdministradoresContainer,
    DoencaCronica: DoencaCronicaScreen,
    TipoDoenca: TipoDoencaScreen,
    TipoVeiculo: TipoVeiculoScreen,
    Cargo: CargoScreen,
    Equipe: EquipeScreen,
    Unidade: UnidadeScreen,
    Area: AreaScreen,
    Microarea: MicroareaScreen,
  };

  return screenComponents[screenName];
};

interface CustomLayoutProps {
  isDarkMode?: boolean;
  children?: React.ReactNode;
}

// Create internal Stack Navigator
function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Dashboard"
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Medicamentos" component={MedicamentosScreen} />
      <Stack.Screen name="CadastroMedicamentos" component={CadastroMedicamentosScreen} />
      <Stack.Screen name="EstoqueMedicamentos" component={EstoqueMedicamentosScreen} />
      <Stack.Screen name="Motoristas" component={MotoristasScreen} />
      <Stack.Screen name="Veiculos" component={VeiculosScreen} />
      <Stack.Screen name="Municipes" component={MunicipesContainer} />
      <Stack.Screen 
        name="Administradores" 
        component={AdministradoresContainer}
        options={{
          headerShown: false,
          // Força a remontagem do componente a cada navegação
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="MunicipeDetail"
        component={MunicipeDetailScreenWrapper}
        options={({ route }) => ({
          title: `Munícipe ${(route.params as any)?.id || ""}`,
        })}
      />
      <Stack.Screen name="DoencasCronicas" component={DoencaCronicaScreen} />
      <Stack.Screen name="TipoDoenca" component={TipoDoencaScreen} />
      <Stack.Screen name="TipoVeiculo" component={TipoVeiculoScreen} />
      <Stack.Screen name="Cargo" component={CargoScreen} />
      <Stack.Screen name="Equipes" component={EquipeScreen} />
      <Stack.Screen name="Unidades" component={UnidadeScreen} />
      <Stack.Screen name="Areas" component={AreaScreen} />
      <Stack.Screen name="Microareas" component={MicroareaScreen} />
    </Stack.Navigator>
  );
}

// Map navigation screen names to your internal screen keys
const navigationScreenMap: { [key: string]: string } = {
  Dashboard: "Dashboard",
  Medicamentos: "Medicamentos",
  CadastroMedicamentos: "CadastroMedicamentos",
  EstoqueMedicamentos: "EstoqueMedicamentos",
  Motoristas: "Motoristas",
  Veiculos: "Veículos",
  Municipes: "Munícipes",
  Administradores: "Administradores",
  MunicipeDetail: "Munícipes",
  DoencasCronicas: "DoencaCronica",
  TipoDoenca: "TipoDoenca",
  TipoVeiculo: "TipoVeiculo",
  Cargo: "Cargo",
  Equipes: "Equipe",
  Unidades: "Unidade",
  Areas: "Area",
  Microareas: "Microarea",
};

// Reverse map: internal screen keys to React Navigation screen names
const screenToNavigation: { [key: string]: string } = {
  Dashboard: "Dashboard",
  Medicamentos: "Medicamentos",
  CadastroMedicamentos: "CadastroMedicamentos",
  EstoqueMedicamentos: "EstoqueMedicamentos",
  Motoristas: "Motoristas",
  Veículos: "Veiculos",
  Munícipes: "Municipes",
  Administradores: "Administradores",
  DoencaCronica: "DoencasCronicas",
  TipoDoenca: "TipoDoenca",
  TipoVeiculo: "TipoVeiculo",
  Cargo: "Cargo",
  Equipe: "Equipes",
  Unidade: "Unidades",
  Area: "Areas",
  Microarea: "Microareas",
};

export const CustomLayout: React.FC<CustomLayoutProps> = ({
  isDarkMode = false,
  children,
}) => {
  const { isDark, toggleTheme } = useTheme();
  
  // Estado do usuário atual para verificar permissões
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Track current route
  const [currentRoute, setCurrentRoute] = useState<any>(null);

  // Carregar usuário atual
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error);
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    // Set initial route
    const initialRoute = getCurrentRoute();
    if (initialRoute) {
      setCurrentRoute(initialRoute);
    }

    // Listen for route changes
    const unsubscribe = onRouteChange((route) => {
      setCurrentRoute(route);
    });

    return unsubscribe;
  }, []);

  // Get current screen from tracked route
  const currentScreenName = currentRoute?.name || "Dashboard";
  const activeScreen = navigationScreenMap[currentScreenName] || "Dashboard";
  const params = currentRoute?.params || {};

  const [sidebarOpen, setSidebarOpen] = useState(isWeb);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]); // Menus principais
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]); // Categorias expandidas

  // Auto-expand menus based on current screen
  useEffect(() => {
    if (["DoencaCronica", "TipoDoenca", "Equipe", "Unidade", "Area", "Microarea"].includes(activeScreen)) {
      setExpandedMenus(["CadastrosBasicos"]);
      setExpandedCategories(["AreaSaude"]);
    } else if (activeScreen === "TipoVeiculo") {
      setExpandedMenus(["CadastrosBasicos"]);
      setExpandedCategories(["Logistica"]);
    } else if (activeScreen === "Cargo") {
      setExpandedMenus(["CadastrosBasicos"]);
      setExpandedCategories(["Administrativo"]);
    }
  }, [activeScreen]);

  // Fix document title for web
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "ConectaSaúde - Jambeiro";
    }
  }, []);

  // Update document title when screen changes
  useEffect(() => {
    if (Platform.OS === "web") {
      const baseTitle = "ConectaSaúde - Jambeiro";
      const screenTitle =
        activeScreen === "Dashboard"
          ? baseTitle
          : `${activeScreen} - ${baseTitle}`;
      document.title = screenTitle;
    }
  }, [activeScreen]);

  // Verificação SIMPLES de admin - salvar na sessão
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar e salvar role de admin quando currentUser mudar
  useEffect(() => {
    if (currentUser) {
      const realAdminRole = currentUser?.app_metadata?.role === 'admin' || 
                           currentUser?.user_metadata?.role === 'admin';
      

      
      // Salvar no localStorage E no state APENAS se realmente for admin
      localStorage.setItem('conectasaude_is_admin', realAdminRole.toString());
      setIsAdmin(realAdminRole);
    } else {
      // Usuário deslogado - limpar tudo
      localStorage.removeItem('conectasaude_is_admin');
      setIsAdmin(false);
    }
  }, [currentUser]);

  // Ao carregar o componente, verificar se já tem admin salvo
  useEffect(() => {
    const savedAdminRole = localStorage.getItem('conectasaude_is_admin');
    if (savedAdminRole === 'true') {
      setIsAdmin(true);
    }
  }, []);



  // Log do usuário completo para debug


  const allMenuItems = [
    {
      key: "Dashboard",
      label: "Dashboard",
      icon: "grid",
      component: DashboardScreen,
    },
    {
      key: "Medicamentos",
      label: "Medicamentos",
      icon: "medical",
      component: MedicamentosScreen,
      hasSubmenu: true,
      submenu: [
        {
          key: "CadastroMedicamentos",
          label: "  • Cadastro de Medicamentos",
          component: CadastroMedicamentosScreen,
        },
        {
          key: "EstoqueMedicamentos",
          label: "  • Estoque de Medicamentos",
          component: EstoqueMedicamentosScreen,
        },
      ],
    },
    {
      key: "Motoristas",
      label: "Motoristas",
      icon: "people",
      component: MotoristasScreen,
    },
    {
      key: "Veículos",
      label: "Veículos",
      icon: "car",
      component: VeiculosScreen,
    },
    {
      key: "Munícipes",
      label: "Munícipes",
      icon: "person",
      component: MunicipesContainer,
    },
    {
      key: "Administradores",
      label: "Administradores",
      icon: "shield-checkmark",
      component: AdministradoresContainer,
    },
    {
      key: "CadastrosBasicos",
      label: "Cadastros Básicos",
      icon: "settings",
      component: CadastrosBasicosScreen,
      hasSubmenu: true,
      submenu: [
        // ÁREA DA SAÚDE
        {
          key: "AreaSaude",
          label: "ÁREA DA SAÚDE",
          isCategory: true,
        },
        {
          key: "DoencaCronica",
          label: "  • Doença Crônica",
          component: DoencaCronicaScreen,
          parentCategory: "AreaSaude",
        },
        {
          key: "TipoDoenca",
          label: "  • Tipo de Doença",
          component: TipoDoencaScreen,
          parentCategory: "AreaSaude",
        },
        {
          key: "Equipe",
          label: "  • Equipes de Saúde",
          component: EquipeScreen,
          parentCategory: "AreaSaude",
        },
        {
          key: "Unidade",
          label: "  • Unidades de Saúde",
          component: UnidadeScreen,
          parentCategory: "AreaSaude",
        },
        {
          key: "Area",
          label: "  • Áreas de Cobertura",
          component: AreaScreen,
          parentCategory: "AreaSaude",
        },
        {
          key: "Microarea",
          label: "  • Microáreas",
          component: MicroareaScreen,
          parentCategory: "AreaSaude",
        },

        // LOGÍSTICA
        {
          key: "Logistica",
          label: "LOGÍSTICA",
          isCategory: true,
        },
        {
          key: "TipoVeiculo",
          label: "  • Tipo de Veículo",
          component: TipoVeiculoScreen,
          parentCategory: "Logistica",
        },

        // ADMINISTRATIVO
        {
          key: "Administrativo",
          label: "ADMINISTRATIVO",
          isCategory: true,
        },
        {
          key: "Cargo",
          label: "  • Cargo",
          component: CargoScreen,
          parentCategory: "Administrativo",
        },
      ],
    },
  ];

  // Mostrar todos os menus
  const menuItems = allMenuItems;



  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenus((prev) => {
      const isCurrentlyExpanded = prev.includes(menuKey);
      return isCurrentlyExpanded
        ? prev.filter((key) => key !== menuKey)
        : [...prev, menuKey];
    });
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryKey)
        ? prev.filter((key) => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const handleMenuClick = (item: any, submenuItem?: any) => {
    if (submenuItem && (submenuItem as any).isCategory) {
      toggleCategory(submenuItem.key);
    } else if (submenuItem && !(submenuItem as any).isCategory) {
      const navigationScreen = screenToNavigation[submenuItem.key];
      if (navigationScreen) {
        navigate(navigationScreen);
      }
    } else if (item.hasSubmenu && !submenuItem) {
      toggleSubmenu(item.key);
    } else if (!item.hasSubmenu) {
      const navigationScreen = screenToNavigation[item.key];
      if (navigationScreen) {
        navigate(navigationScreen);
      }
    }
  };

  const handleLogout = async () => {

    
    try {
      // Para web, usar window.confirm em vez de Alert.alert
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Tem certeza que deseja sair do sistema?');
        if (!confirmed) {

          return;
        }
      } else {
        // Para mobile, usar Alert.alert
        return new Promise((resolve) => {
          Alert.alert(
            'Sair do Sistema',
            'Tem certeza que deseja sair do sistema?',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => {

                  resolve(false);
                }
              },
              {
                text: 'Sair',
                style: 'destructive',
                onPress: () => resolve(true),
              },
            ]
          );
        }).then(async (confirmed) => {
          if (!confirmed) return;
        });
      }


      
      // Limpar dados da sessão local PRIMEIRO
      localStorage.removeItem('conectasaude_is_admin');
      setIsAdmin(false);
      setCurrentUser(null);
      
      // Fazer logout no serviço
      await authService.signOut();

      
      // Limpar URL de qualquer token e navegar para login
      if (Platform.OS === 'web') {

        // Limpar a URL de qualquer parâmetro
        const cleanUrl = window.location.origin + '/login';
        window.history.replaceState({}, document.title, cleanUrl);
        // Não recarregar a página, deixar o React gerenciar o estado
      }
      
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      if (Platform.OS === 'web') {
        window.alert('Ocorreu um erro ao sair do sistema');
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao sair do sistema');
      }
    }
  };

  const getActiveComponent = () => {
    // Procura primeiro nos itens principais
    const mainItem = menuItems.find((item) => item.key === activeScreen);
    if (mainItem && !mainItem.hasSubmenu) {
      return mainItem.component;
    }

    // Procura nos submenus
    for (const item of menuItems) {
      if (item.submenu) {
        const submenuItem = item.submenu.find(
          (sub) => sub.key === activeScreen && !(sub as any).isCategory
        );
        if (submenuItem) {
          return submenuItem.component;
        }
      }
    }

    return DashboardScreen;
  };

  const ActiveComponent = getActiveComponent();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "row",
      backgroundColor: isDark ? "#1a1a1a" : "#FFFFFF",
    },
    sidebar: {
      width: sidebarOpen ? 280 : 0,
      backgroundColor: isDark ? "#2a2a2a" : "#FFFFFF",
      borderRightWidth: 1,
      borderRightColor: isDark ? "#3a3a3a" : "#E6EAE7",
      overflow: "hidden",
    },
    sidebarHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#3a3a3a" : "#E6EAE7",
      backgroundColor: isDark ? "#8A9E8E" : "#8A9E8E", // Verde institucional
    },
    logo: {
      flexDirection: "row",
      alignItems: "center",
    },
    brasaoContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    logoTextContainer: {
      flex: 1,
    },
    logoTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#FFFFFF",
      fontFamily: "Arial Black, Helvetica, sans-serif",
    },
    logoSubtitle: {
      fontSize: 12,
      fontWeight: "400",
      color: "rgba(255, 255, 255, 0.9)",
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    logoText: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#333333",
      marginLeft: 12,
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    menuContainer: {
      flex: 1,
      paddingVertical: 10,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      marginVertical: 2,
    },
    menuItemActive: {
      backgroundColor: isDark ? "#3a3a3a" : "#E6EAE7",
      borderRightWidth: 3,
      borderRightColor: "#8A9E8E", // Verde institucional Jambeiro
    },
    menuIcon: {
      marginRight: 12,
    },
    menuText: {
      fontSize: 16,
      fontWeight: "500",
      color: isDark ? "#FFFFFF" : "#333333",
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    menuTextActive: {
      color: "#8A9E8E", // Verde institucional Jambeiro
      fontWeight: "600",
    },
    submenuContainer: {
      backgroundColor: isDark ? "#1a1a1a" : "#F8F9FA",
      marginLeft: 20,
      borderLeftWidth: 2,
      borderLeftColor: "#8A9E8E",
      paddingLeft: 12,
    },
    submenuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginVertical: 2,
    },
    submenuItemActive: {
      backgroundColor: isDark ? "#8A9E8E" : "#8A9E8E",
    },
    submenuText: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#B6B9B7" : "#666666",
      fontFamily: "Arial, Helvetica, sans-serif",
      flex: 1,
    },
    submenuTextActive: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    categoryItem: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    categoryText: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#8A9E8E" : "#8A9E8E",
      fontFamily: "Arial, Helvetica, sans-serif",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      flex: 1,
    },
    categoryChevron: {
      marginLeft: 8,
    },
    menuChevron: {
      marginLeft: 8,
    },
    content: {
      flex: 1,
      flexDirection: "column",
    },
    header: {
      height: 60,
      backgroundColor: isDark ? "#2a2a2a" : "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#3a3a3a" : "#E6EAE7",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#333333",
      marginLeft: 16,
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#3a3a3a" : "#E6EAE7",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      minWidth: 200,
    },
    searchPlaceholder: {
      marginLeft: 8,
      fontSize: 14,
      color: isDark ? "#B6B9B7" : "#B6B9B7",
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    themeToggle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.05)",
    },
    menuToggle: {
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    },
    screenContainer: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#FFFFFF",
    },
    logoutContainer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#3a3a3a" : "#E6EAE7",
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 8,
      backgroundColor: isDark ? "rgba(138, 158, 142, 0.1)" : "rgba(138, 158, 142, 0.1)",
    },
    logoutText: {
      fontSize: 16,
      fontWeight: "500",
      color: "#8A9E8E",
      fontFamily: "Arial, Helvetica, sans-serif",
    },
  });

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <View style={styles.logo}>
            <View style={styles.brasaoContainer}>
              <BrasaoJambeiro size={28} />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>ConectaSaúde</Text>
              <Text style={styles.logoSubtitle}>Prefeitura de Jambeiro</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.menuContainer}>
          {menuItems.map((item) => (
            <View key={item.key}>
              {/* Item principal do menu */}
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  (activeScreen === item.key ||
                    (item.submenu &&
                      item.submenu.some((sub) => sub.key === activeScreen))) &&
                    styles.menuItemActive,
                ]}
                onPress={() => {
                  handleMenuClick(item);
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={
                    activeScreen === item.key ||
                    (item.submenu &&
                      item.submenu.some((sub) => sub.key === activeScreen))
                      ? "#8A9E8E"
                      : isDark
                      ? "#B6B9B7"
                      : "#B6B9B7"
                  }
                  style={styles.menuIcon}
                />
                <Text
                  style={[
                    styles.menuText,
                    (activeScreen === item.key ||
                      (item.submenu &&
                        item.submenu.some(
                          (sub) => sub.key === activeScreen
                        ))) &&
                      styles.menuTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                {item.hasSubmenu && (
                  <Ionicons
                    name={
                      expandedMenus.includes(item.key)
                        ? "chevron-down"
                        : "chevron-forward"
                    }
                    size={16}
                    color={isDark ? "#B6B9B7" : "#B6B9B7"}
                    style={styles.menuChevron}
                  />
                )}
              </TouchableOpacity>

              {/* Submenu */}
              {item.hasSubmenu &&
                item.submenu &&
                expandedMenus.includes(item.key) && (
                  <View style={styles.submenuContainer}>
                    {item.submenu.map((submenuItem: any) => {
                      // Log para debug
                      // Se é uma categoria, sempre mostra
                      if ((submenuItem as any).isCategory) {
                        return (
                          <TouchableOpacity
                            key={submenuItem.key}
                            style={styles.categoryItem}
                            onPress={() => handleMenuClick(item, submenuItem)}
                          >
                            <Text style={styles.categoryText}>
                              {submenuItem.label}
                            </Text>
                            <Ionicons
                              name={
                                expandedCategories.includes(submenuItem.key)
                                  ? "chevron-down"
                                  : "chevron-forward"
                              }
                              size={12}
                              color={isDark ? "#8A9E8E" : "#8A9E8E"}
                              style={styles.categoryChevron}
                            />
                          </TouchableOpacity>
                        );
                      }

                      // Se tem parentCategory (submenu categorizado), só mostra se a categoria estiver expandida
                      if (submenuItem.parentCategory) {
                        const shouldShowItem = expandedCategories.includes(
                          submenuItem.parentCategory
                        );
                        if (!shouldShowItem) {
                          return null;
                        }
                      }

                      // Para submenus simples (sem parentCategory), sempre mostra
                      return (
                        <TouchableOpacity
                          key={submenuItem.key}
                          style={[
                            styles.submenuItem,
                            activeScreen === submenuItem.key &&
                              styles.submenuItemActive,
                          ]}
                          onPress={() => handleMenuClick(item, submenuItem)}
                        >
                          <Text
                            style={[
                              styles.submenuText,
                              activeScreen === submenuItem.key &&
                                styles.submenuTextActive,
                            ]}
                          >
                            {submenuItem.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
            </View>
          ))}
        </ScrollView>
        
        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {

              handleLogout();
            }}
          >
            <Ionicons
              name="log-out"
              size={20}
              color="#8A9E8E"
              style={styles.menuIcon}
            />
            <Text style={styles.logoutText}>
              Sair do Sistema
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuToggle}
              onPress={() => setSidebarOpen(!sidebarOpen)}
            >
              <Ionicons
                name="menu"
                size={24}
                color={isDark ? "#FFFFFF" : "#333333"}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{activeScreen}</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={16}
                color={isDark ? "#B6B9B7" : "#B6B9B7"}
              />
              <Text style={styles.searchPlaceholder}>Buscar...</Text>
            </View>

            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={20}
                color={isDark ? "#fbbf24" : "#B6B9B7"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Screen Content */}
        <View style={styles.screenContainer}>
          <MainStackNavigator />
        </View>
      </View>
    </View>
  );
};

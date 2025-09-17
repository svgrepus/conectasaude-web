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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks";
import { BrasaoJambeiro } from "../components/BrasaoJambeiro";
import { createStackNavigator } from "@react-navigation/stack";
import { navigate, onRouteChange, getCurrentRoute } from "./navigationService";

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
} from "../screens/cadastros";
import { MunicipeDetailScreen } from "../screens/municipes/MunicipeDetailScreen";
import { MunicipeDetailScreenWrapper } from "../screens/municipes/MunicipeDetailScreenWrapper";
import { LoginScreen } from "../screens/LoginScreen";

const Stack = createStackNavigator();

const { width } = Dimensions.get("window");
const isWeb = width > 768; // Detecta se é web/desktop

// Function to get screen component based on screen name
const getScreenComponent = (screenName: string) => {
  const screenComponents: { [key: string]: React.ComponentType<any> } = {
    Dashboard: DashboardScreen,
    Medicamentos: MedicamentosScreen,
    Motoristas: MotoristasScreen,
    Veículos: VeiculosScreen,
    Munícipes: MunicipesContainer,
    DoencaCronica: DoencaCronicaScreen,
    TipoDoenca: TipoDoencaScreen,
    TipoVeiculo: TipoVeiculoScreen,
    Cargo: CargoScreen,
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
      <Stack.Screen name="Motoristas" component={MotoristasScreen} />
      <Stack.Screen name="Veiculos" component={VeiculosScreen} />
      <Stack.Screen name="Municipes" component={MunicipesContainer} />
      <Stack.Screen 
        name="MunicipeDetail" 
        component={MunicipeDetailScreenWrapper}
        options={({ route }) => ({ 
          title: `Munícipe ${(route.params as any)?.id || ''}` 
        })}
      />
      <Stack.Screen name="DoencasCronicas" component={DoencaCronicaScreen} />
      <Stack.Screen name="TipoDoenca" component={TipoDoencaScreen} />
      <Stack.Screen name="TipoVeiculo" component={TipoVeiculoScreen} />
      <Stack.Screen name="Cargo" component={CargoScreen} />
    </Stack.Navigator>
  );
}

// Map navigation screen names to your internal screen keys
const navigationScreenMap: { [key: string]: string } = {
  Dashboard: "Dashboard",
  Medicamentos: "Medicamentos", 
  Motoristas: "Motoristas",
  Veiculos: "Veículos",
  Municipes: "Munícipes",
  MunicipeDetail: "Munícipes",
  DoencasCronicas: "DoencaCronica",
  TipoDoenca: "TipoDoenca",
  TipoVeiculo: "TipoVeiculo",
  Cargo: "Cargo",
};

// Reverse map: internal screen keys to React Navigation screen names
const screenToNavigation: { [key: string]: string } = {
  Dashboard: "Dashboard",
  Medicamentos: "Medicamentos",
  Motoristas: "Motoristas", 
  Veículos: "Veiculos",
  Munícipes: "Municipes",
  DoencaCronica: "DoencasCronicas",
  TipoDoenca: "TipoDoenca", 
  TipoVeiculo: "TipoVeiculo",
  Cargo: "Cargo",
};

export const CustomLayout: React.FC<CustomLayoutProps> = ({
  isDarkMode = false,
  children,
}) => {
  const { isDark, toggleTheme } = useTheme();
  
  // Track current route
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  
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
  
  // Debug logging
  console.log("CustomLayout - currentRoute:", currentRoute);
  console.log("CustomLayout - currentScreenName:", currentScreenName);
  console.log("CustomLayout - activeScreen:", activeScreen);
  
  const [sidebarOpen, setSidebarOpen] = useState(isWeb);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]); // Menus principais
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]); // Categorias expandidas

  // Auto-expand menus based on current screen
  useEffect(() => {
    if (["DoencaCronica", "TipoDoenca"].includes(activeScreen)) {
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

  const menuItems = [
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

  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuKey)
        ? prev.filter((key) => key !== menuKey)
        : [...prev, menuKey]
    );
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryKey)
        ? prev.filter((key) => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const handleMenuClick = (item: any, submenuItem?: any) => {
    if (submenuItem && submenuItem.isCategory) {
      // Clique em categoria - alterna a categoria
      toggleCategory(submenuItem.key);
    } else if (submenuItem && !submenuItem.isCategory) {
      // Clique em item de submenu - navega para a tela usando React Navigation
      const navigationScreen = screenToNavigation[submenuItem.key];
      if (navigationScreen) {
        navigate(navigationScreen);
      }
    } else if (item.hasSubmenu && !submenuItem) {
      // Clique no menu principal com submenu - alterna o menu
      toggleSubmenu(item.key);
    } else if (!item.hasSubmenu) {
      // Clique em menu sem submenu - navega para a tela usando React Navigation
      const navigationScreen = screenToNavigation[item.key];
      if (navigationScreen) {
        navigate(navigationScreen);
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
          (sub) => sub.key === activeScreen && !sub.isCategory
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
                onPress={() => handleMenuClick(item)}
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
                      // Se é uma categoria, sempre mostra
                      if (submenuItem.isCategory) {
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

                      // Se é um item de submenu, só mostra se a categoria pai estiver expandida
                      const shouldShowItem = expandedCategories.includes(
                        submenuItem.parentCategory
                      );
                      if (!shouldShowItem) {
                        return null;
                      }

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

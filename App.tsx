import React, { useState, useEffect } from "react";
import "./src/polyfills";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";

import { useTheme } from "./src/hooks";

// Import screens
import { LoginScreen } from "./src/screens/LoginScreen";
import { CustomLayout } from "./src/navigation/CustomLayout";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { 
  MedicamentosScreen, 
  MotoristasScreen, 
  VeiculosScreen 
} from "./src/screens/PlaceholderScreens";
import { MunicipesContainer } from "./src/screens/municipes/MunicipesContainer";
import {
  DoencaCronicaScreen,
  TipoDoencaScreen,
  TipoVeiculoScreen,
  CargoScreen,
} from "./src/screens/cadastros";

import { authService } from "./src/services/auth-simple";
import { theme as customTheme } from "./src/constants/theme";
import { navigationRef, notifyRouteChange } from "./src/navigation/navigationService";

const Stack = createStackNavigator();

// Create the Main Stack Navigator
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
        component={MunicipesContainer}
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

// Configure deep linking
const linking = {
  prefixes: ["http://localhost:19006", "http://localhost:19007", "https://your-domain.com"],
  config: {
    screens: {
      Dashboard: "/",
      Medicamentos: "/medicamentos",
      Motoristas: "/motoristas",
      Veiculos: "/veiculos", 
      Municipes: "/municipes",
      MunicipeDetail: "/municipes/:id",
      DoencasCronicas: "/basicos/saude/doencas-cronicas",
      TipoDoenca: "/basicos/saude/tipo-doenca",
      TipoVeiculo: "/basicos/logistica/tipo-veiculo",
      Cargo: "/basicos/admin/cargo",
      Login: "/login",
    },
  },
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customTheme.light.background,
  },
});

export default function App() {
  const { theme, isDark } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [useNewDashboard, setUseNewDashboard] = useState(true); // Toggle for new dashboard

  useEffect(() => {
    if (useNewDashboard) {
      checkAuthStatus();
      setupAuthListener();
    } else {
      setLoading(false);
    }
  }, [useNewDashboard]);

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const setupAuthListener = () => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
    });

    return unsubscribe;
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const paperTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: theme.colors.primary,
      accent: theme.colors.secondary,
      background: theme.colors.background,
      surface: theme.colors.surface,
      text: theme.colors.text,
      disabled: theme.colors.textSecondary,
      placeholder: theme.colors.textSecondary,
      backdrop: "rgba(0, 0, 0, 0.5)",
      onSurface: theme.colors.text,
      notification: theme.colors.error,
    },
    dark: isDark,
  };

  // New Dashboard Flow
  if (useNewDashboard) {
    if (loading) {
      return (
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={customTheme.light.primary} />
          </View>
        </SafeAreaProvider>
      );
    }

    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={paperTheme}>
            <NavigationContainer 
              ref={navigationRef}
              linking={linking}
              onReady={() => {
                // Initialize route tracking on app start
                const currentRoute = navigationRef.getCurrentRoute();
                notifyRouteChange(currentRoute);
              }}
              onStateChange={(state) => {
                // Track route changes for sidebar navigation
                if (navigationRef.isReady()) {
                  const currentRoute = navigationRef.getCurrentRoute();
                  notifyRouteChange(currentRoute);
                }
              }}
              documentTitle={{
                formatter: (options, route) =>
                  `${
                    options?.title ?? route?.name ?? "ConectaSaúde"
                  } - Jambeiro`,
              }}
            >
              {isAuthenticated ? (
                <CustomLayout />
              ) : (
                <LoginScreen onLoginSuccess={handleLoginSuccess} />
              )}
              <StatusBar style={isDark ? "light" : "dark"} />
            </NavigationContainer>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer 
            ref={navigationRef} 
            linking={linking}
            onStateChange={(state) => {
              // Track route changes for sidebar navigation
              if (navigationRef.isReady()) {
                const currentRoute = navigationRef.getCurrentRoute();
                notifyRouteChange(currentRoute);
              }
            }}
          >
            <CustomLayout />
            <StatusBar style={isDark ? "light" : "dark"} />
          </NavigationContainer>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

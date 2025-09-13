import React, { useState, useEffect } from 'react';
import './src/polyfills';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useTheme } from './src/hooks';
import AppNavigator from './src/navigation/AppNavigator';

// New imports for our Dashboard
import { LoginScreen } from './src/screens/LoginScreen';
import { CustomLayout } from './src/navigation/CustomLayout';
import { authService } from './src/services/auth-simple';
import { theme as customTheme } from './src/constants/theme';

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
      console.error('Erro ao verificar autenticação:', error);
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
      backdrop: 'rgba(0, 0, 0, 0.5)',
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
            <ActivityIndicator size="large" color={customTheme.light.jambeiroBlue} />
          </View>
        </SafeAreaProvider>
      );
    }

    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={paperTheme}>
            <NavigationContainer>
              {isAuthenticated ? (
                <CustomLayout isDarkMode={isDark} />
              ) : (
                <LoginScreen onLoginSuccess={handleLoginSuccess} />
              )}
              <StatusBar style={isDark ? 'light' : 'dark'} />
            </NavigationContainer>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  // Original Flow
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </NavigationContainer>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: customTheme.light.background,
  },
});

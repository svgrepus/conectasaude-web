import React from 'react';
import './src/polyfills';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from './src/hooks';
import AppNavigator from './src/navigation/AppNavigator';

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

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth, useTheme } from '../hooks';
import type { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';

import LoadingScreen from '../components/common/LoadingScreen';

// Import screens (these will be created next)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import HomeScreen from '../screens/HomeScreen';
import ConsultasScreen from '../screens/consultas/ConsultasScreen';
import ExamesScreen from '../screens/exames/ExamesScreen';
import MedicamentosScreen from '../screens/medicamentos/MedicamentosScreen';
import PerfilScreen from '../screens/profile/PerfilScreen';

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
function AuthNavigator() {
  const { theme } = useTheme();

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Entrar' }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Cadastrar' }}
      />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ title: 'Recuperar Senha' }}
      />
    </AuthStack.Navigator>
  );
}

// Main App Navigator with Bottom Tabs
function MainNavigator() {
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Consultas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Exames') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Medicamentos') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Início' }}
      />
      
      {/* Consultas - available for all users */}
      <Tab.Screen 
        name="Consultas" 
        component={ConsultasScreen}
        options={{ title: 'Consultas' }}
      />
      
      {/* Exames - available for all users */}
      <Tab.Screen 
        name="Exames" 
        component={ExamesScreen}
        options={{ title: 'Exames' }}
      />
      
      {/* Medicamentos - available for funcionarios and admins */}
      {(user?.role === 'funcionario' || user?.role === 'admin') && (
        <Tab.Screen 
          name="Medicamentos" 
          component={MedicamentosScreen}
          options={{ title: 'Medicamentos' }}
        />
      )}
      
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainTabs" component={MainNavigator} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

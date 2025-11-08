import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

import { useTheme } from "../hooks";
import { authService } from "../services/auth-simple";

// Auth Screens
import { LoginScreenWrapper } from "../screens/auth/LoginScreenWrapper";

// Main Screens
import { DashboardScreen } from "../screens/DashboardScreen";
import {
  MedicamentosScreen,
  MotoristasScreen,
  VeiculosScreen,
} from "../screens/PlaceholderScreens";
import { MunicipesContainer } from "../screens/municipes/MunicipesContainer";
import { MunicipeDetailScreen } from "../screens/municipes/MunicipeDetailScreen";

// Cadastros Básicos Screens
import {
  DoencaCronicaScreen,
  TipoDoencaScreen,
  TipoVeiculoScreen,
  CargoScreen,
  EquipeScreen,
  UnidadeScreen,
  AreaScreen,
  MicroareaScreen,
} from "../screens/cadastros";
import AdministradoresContainer from "../screens/administradores/AdministradoresContainer_simple";

// Type definitions
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  Medicamentos: undefined;
  Motoristas: undefined;
  Veiculos: undefined;
  Municipes: undefined;
  MunicipeDetail: { id: string };
  DoencasCronicas: undefined;
  TipoDoenca: undefined;
  TipoVeiculo: undefined;
  Cargo: undefined;
  Equipes: undefined;
  Unidades: undefined;
  Areas: undefined;
  Microareas: undefined;
  Administradores: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const Drawer = createDrawerNavigator<MainStackParamList>();

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreenWrapper} />
    </AuthStack.Navigator>
  );
}

// Main Stack Navigator (for modals and nested navigation)
function MainStackNavigator() {
  const { theme } = useTheme();

  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <MainStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <MainStack.Screen
        name="Medicamentos"
        component={MedicamentosScreen}
        options={{ title: "Medicamentos" }}
      />
      <MainStack.Screen
        name="Motoristas"
        component={MotoristasScreen}
        options={{ title: "Motoristas" }}
      />
      <MainStack.Screen
        name="Veiculos"
        component={VeiculosScreen}
        options={{ title: "Veículos" }}
      />
      <MainStack.Screen
        name="Municipes"
        component={MunicipesContainer}
        options={{ title: "Munícipes" }}
      />
      <MainStack.Screen
        name="MunicipeDetail"
        component={MunicipeDetailScreen}
        options={({ route }) => ({
          title: `Munícipe ${route.params.id}`,
        })}
      />

      {/* Cadastros Básicos */}
      <MainStack.Screen
        name="DoencasCronicas"
        component={DoencaCronicaScreen}
        options={{ title: "Doenças Crônicas" }}
      />
      <MainStack.Screen
        name="TipoDoenca"
        component={TipoDoencaScreen}
        options={{ title: "Tipos de Doença" }}
      />
      <MainStack.Screen
        name="TipoVeiculo"
        component={TipoVeiculoScreen}
        options={{ title: "Tipos de Veículo" }}
      />
      <MainStack.Screen
        name="Cargo"
        component={CargoScreen}
        options={{ title: "Cargos" }}
      />
      
      {/* Área da Saúde */}
      <MainStack.Screen
        name="Equipes"
        component={EquipeScreen}
        options={{ title: "Equipes de Saúde" }}
      />
      <MainStack.Screen
        name="Unidades"
        component={UnidadeScreen}
        options={{ title: "Unidades de Saúde" }}
      />
      <MainStack.Screen
        name="Areas"
        component={AreaScreen}
        options={{ title: "Áreas de Cobertura" }}
      />
      <MainStack.Screen
        name="Microareas"
        component={MicroareaScreen}
        options={{ title: "Microáreas" }}
      />
    </MainStack.Navigator>
  );
}

// Main Drawer/Tab Navigator
function MainNavigator() {
  const { theme } = useTheme();
  const isWeb = Platform.OS === "web";

  if (isWeb) {
    // Use Drawer for web
    return (
      <Drawer.Navigator
        screenOptions={{
          drawerStyle: {
            backgroundColor: theme.colors.surface,
            width: 280,
          },
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.text,
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: "#fff",
        }}
      >
        <Drawer.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: "Dashboard",
            drawerIcon: ({ color }) => (
              <Ionicons name="grid-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Medicamentos"
          component={MedicamentosScreen}
          options={{
            title: "Medicamentos",
            drawerIcon: ({ color }) => (
              <Ionicons name="medical-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Motoristas"
          component={MotoristasScreen}
          options={{
            title: "Motoristas",
            drawerIcon: ({ color }) => (
              <Ionicons name="people-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Veiculos"
          component={VeiculosScreen}
          options={{
            title: "Veículos",
            drawerIcon: ({ color }) => (
              <Ionicons name="car-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Municipes"
          component={MunicipesContainer}
          options={{
            title: "Munícipes",
            drawerIcon: ({ color }) => (
              <Ionicons name="person-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="DoencasCronicas"
          component={DoencaCronicaScreen}
          options={{
            title: "Doenças Crônicas",
            drawerIcon: ({ color }) => (
              <Ionicons name="medical-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="TipoDoenca"
          component={TipoDoencaScreen}
          options={{
            title: "Tipos de Doença",
            drawerIcon: ({ color }) => (
              <Ionicons name="list-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="TipoVeiculo"
          component={TipoVeiculoScreen}
          options={{
            title: "Tipos de Veículo",
            drawerIcon: ({ color }) => (
              <Ionicons name="car-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Cargo"
          component={CargoScreen}
          options={{
            title: "Cargos",
            drawerIcon: ({ color }) => (
              <Ionicons name="briefcase-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Equipes"
          component={EquipeScreen}
          options={{
            title: "Equipes de Saúde",
            drawerIcon: ({ color }) => (
              <Ionicons name="people-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Unidades"
          component={UnidadeScreen}
          options={{
            title: "Unidades de Saúde",
            drawerIcon: ({ color }) => (
              <Ionicons name="business-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Areas"
          component={AreaScreen}
          options={{
            title: "Áreas de Cobertura",
            drawerIcon: ({ color }) => (
              <Ionicons name="map-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Microareas"
          component={MicroareaScreen}
          options={{
            title: "Microáreas",
            drawerIcon: ({ color }) => (
              <Ionicons name="location-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Administradores"
          component={AdministradoresContainer}
          options={{
            title: "Administradores",
            drawerIcon: ({ color }) => (
              <Ionicons name="shield-checkmark-outline" size={22} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    );
  }

  // Use Stack for mobile (you can also use Tab if preferred)
  return <MainStackNavigator />;
}

// Root Navigator
export default function RootNavigator() {
  // You can add authentication logic here
  const isAuthenticated = true; // Replace with actual auth logic

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}

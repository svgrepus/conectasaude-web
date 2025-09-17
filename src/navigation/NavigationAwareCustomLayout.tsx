import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation, NavigationState } from "@react-navigation/native";
import { CustomLayout } from "./CustomLayout";

// Screen components
import { DashboardScreen } from "../screens/DashboardScreen";
import {
  MedicamentosScreen,
  MotoristasScreen,
  VeiculosScreen,
} from "../screens/PlaceholderScreens";
import { MunicipesContainer } from "../screens/municipes/MunicipesContainer";
import {
  DoencaCronicaScreen,
  TipoDoencaScreen,
  TipoVeiculoScreen,
  CargoScreen,
} from "../screens/cadastros";

const Stack = createStackNavigator();

// Define your screens for React Navigation
const screens = [
  { name: "Dashboard", component: DashboardScreen, path: "/" },
  {
    name: "Medicamentos",
    component: MedicamentosScreen,
    path: "/medicamentos",
  },
  { name: "Motoristas", component: MotoristasScreen, path: "/motoristas" },
  { name: "Veiculos", component: VeiculosScreen, path: "/veiculos" },
  { name: "Municipes", component: MunicipesContainer, path: "/municipes" },
  {
    name: "MunicipeDetail",
    component: MunicipesContainer,
    path: "/municipes/:id",
  },
  {
    name: "DoencasCronicas",
    component: DoencaCronicaScreen,
    path: "/basicos/saude/doencas-cronicas",
  },
  {
    name: "TipoDoenca",
    component: TipoDoencaScreen,
    path: "/basicos/saude/tipo-doenca",
  },
  {
    name: "TipoVeiculo",
    component: TipoVeiculoScreen,
    path: "/basicos/logistica/tipo-veiculo",
  },
  { name: "Cargo", component: CargoScreen, path: "/basicos/admin/cargo" },
];

interface NavigationAwareCustomLayoutProps {
  isDarkMode?: boolean;
}

export const NavigationAwareCustomLayout: React.FC<
  NavigationAwareCustomLayoutProps
> = ({ isDarkMode = false }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: "card",
        animationEnabled: false, // Keep the layout static-looking
      }}
      initialRouteName="Dashboard"
    >
      {screens.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </Stack.Navigator>
  );
};

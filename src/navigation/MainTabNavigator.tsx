import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import LogoutScreen from '../screens/LogoutScreen';
import { 
  MedicamentosScreen, 
  MotoristasScreen, 
  VeiculosScreen, 
  MunicipesScreen 
} from '../screens/PlaceholderScreens';

const Tab = createBottomTabNavigator();

interface MainTabNavigatorProps {
  isDarkMode?: boolean;
}

export const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ isDarkMode = false }) => {
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Medicamentos':
              iconName = focused ? 'medical' : 'medical-outline';
              break;
            case 'Motoristas':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Veículos':
              iconName = focused ? 'car' : 'car-outline';
              break;
            case 'Munícipes':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Sair':
              iconName = focused ? 'log-out' : 'log-out-outline';
              break;
            default:
              iconName = 'grid-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: currentTheme.mutedForeground,
        tabBarStyle: {
          backgroundColor: currentTheme.surface,
          borderTopColor: currentTheme.border,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Medicamentos"
        component={MedicamentosScreen}
        options={{
          tabBarLabel: 'Medicamentos',
        }}
      />
      <Tab.Screen
        name="Motoristas"
        component={MotoristasScreen}
        options={{
          tabBarLabel: 'Motoristas',
        }}
      />
      <Tab.Screen
        name="Veículos"
        component={VeiculosScreen}
        options={{
          tabBarLabel: 'Veículos',
        }}
      />
      <Tab.Screen
        name="Munícipes"
        component={MunicipesScreen}
        options={{
          tabBarLabel: 'Munícipes',
        }}
      />
      <Tab.Screen
        name="Sair"
        component={LogoutScreen}
        options={{
          tabBarLabel: 'Sair',
          tabBarActiveTintColor: '#dc2626',
        }}
      />
    </Tab.Navigator>
  );
};

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { 
  MedicamentosScreen, 
  MotoristasScreen, 
  VeiculosScreen, 
  MunicipesScreen 
} from '../screens/PlaceholderScreens';
import AdministradoresContainer from '../screens/administradores/AdministradoresContainer_simple';

const Drawer = createDrawerNavigator();

interface DrawerNavigatorProps {
  isDarkMode?: boolean;
}

export const DrawerNavigator: React.FC<DrawerNavigatorProps> = ({ isDarkMode = false }) => {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerPosition: 'left',
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          width: 280,
        },
        headerStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          elevation: 1,
          shadowOpacity: 0.1,
        },
        headerTintColor: isDark ? '#ffffff' : '#111827',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        drawerActiveTintColor: '#8A9E8E', // Verde institucional da Prefeitura de Jambeiro
        drawerInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        headerRight: () => (
          <View style={styles.headerRight}>
            <View style={[styles.searchContainer, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
              <Ionicons name="search" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.searchPlaceholder, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                Buscar...
              </Text>
            </View>
            
            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Ionicons 
                name={isDark ? 'sunny' : 'moon'} 
                size={20} 
                color={isDark ? '#fbbf24' : '#6b7280'} 
              />
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="grid" size={20} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Medicamentos"
        component={MedicamentosScreen}
        options={{
          title: 'Medicamentos',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="medical" size={20} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Motoristas"
        component={MotoristasScreen}
        options={{
          title: 'Motoristas',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="people" size={20} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Veículos"
        component={VeiculosScreen}
        options={{
          title: 'Veículos',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="car" size={20} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Munícipes"
        component={MunicipesScreen}
        options={{
          title: 'Munícipes',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="person" size={20} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Administradores"
        component={AdministradoresContainer}
        options={{
          title: 'Administradores',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="shield-checkmark" size={20} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 200,
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 14,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});

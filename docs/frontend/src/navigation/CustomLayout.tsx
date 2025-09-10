import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { 
  MedicamentosScreen, 
  MotoristasScreen, 
  VeiculosScreen 
} from '../screens/PlaceholderScreens';
import { MunicipesContainer } from '../screens/municipes/MunicipesContainer';

const { width } = Dimensions.get('window');
const isWeb = width > 768; // Detecta se é web/desktop

interface CustomLayoutProps {
  isDarkMode?: boolean;
}

export const CustomLayout: React.FC<CustomLayoutProps> = ({ isDarkMode = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(isWeb);

  const menuItems = [
    { key: 'Dashboard', label: 'Dashboard', icon: 'grid', component: DashboardScreen },
    { key: 'Medicamentos', label: 'Medicamentos', icon: 'medical', component: MedicamentosScreen },
    { key: 'Motoristas', label: 'Motoristas', icon: 'people', component: MotoristasScreen },
    { key: 'Veículos', label: 'Veículos', icon: 'car', component: VeiculosScreen },
    { key: 'Munícipes', label: 'Munícipes', icon: 'person', component: MunicipesContainer },
  ];

  const ActiveComponent = menuItems.find(item => item.key === activeScreen)?.component || DashboardScreen;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: isDark ? '#111827' : '#f9fafb',
    },
    sidebar: {
      width: sidebarOpen ? 280 : 0,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderRightWidth: 1,
      borderRightColor: isDark ? '#374151' : '#e5e7eb',
      overflow: 'hidden',
    },
    sidebarHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#e5e7eb',
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#111827',
      marginLeft: 12,
    },
    menuContainer: {
      flex: 1,
      paddingVertical: 10,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      marginVertical: 2,
    },
    menuItemActive: {
      backgroundColor: isDark ? '#374151' : '#f3f4f6',
      borderRightWidth: 3,
      borderRightColor: '#ea2a33',
    },
    menuIcon: {
      marginRight: 12,
    },
    menuText: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#ffffff' : '#111827',
    },
    menuTextActive: {
      color: '#ea2a33',
      fontWeight: '600',
    },
    content: {
      flex: 1,
      flexDirection: 'column',
    },
    header: {
      height: 60,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#e5e7eb',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#111827',
      marginLeft: 16,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#374151' : '#f3f4f6',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      minWidth: 200,
    },
    searchPlaceholder: {
      marginLeft: 8,
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    themeToggle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.05)',
    },
    menuToggle: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    screenContainer: {
      flex: 1,
      backgroundColor: isDark ? '#111827' : '#f9fafb',
    },
  });

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <View style={styles.logo}>
            <Ionicons name="heart" size={32} color="#ea2a33" />
            <Text style={styles.logoText}>Conecta Saúde</Text>
          </View>
        </View>

        <ScrollView style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                activeScreen === item.key && styles.menuItemActive,
              ]}
              onPress={() => setActiveScreen(item.key)}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={activeScreen === item.key ? '#ea2a33' : (isDark ? '#9ca3af' : '#6b7280')}
                style={styles.menuIcon}
              />
              <Text
                style={[
                  styles.menuText,
                  activeScreen === item.key && styles.menuTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
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
                color={isDark ? '#ffffff' : '#111827'}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{activeScreen}</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text style={styles.searchPlaceholder}>Buscar...</Text>
            </View>

            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={20}
                color={isDark ? '#fbbf24' : '#6b7280'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Screen Content */}
        <View style={styles.screenContainer}>
          <ActiveComponent />
        </View>
      </View>
    </View>
  );
};

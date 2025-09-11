import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks';
import { BrasaoJambeiro } from '../components/BrasaoJambeiro';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { 
  MedicamentosScreen, 
  MotoristasScreen, 
  VeiculosScreen,
  CadastrosBasicosScreen
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
    { key: 'CadastrosBasicos', label: 'Cadastros Básicos', icon: 'settings', component: CadastrosBasicosScreen },
  ];

  const ActiveComponent = menuItems.find(item => item.key === activeScreen)?.component || DashboardScreen;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
    },
    sidebar: {
      width: sidebarOpen ? 280 : 0,
      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
      borderRightWidth: 1,
      borderRightColor: isDark ? '#3a3a3a' : '#E6EAE7',
      overflow: 'hidden',
    },
    sidebarHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#3a3a3a' : '#E6EAE7',
      backgroundColor: isDark ? '#8A9E8E' : '#8A9E8E', // Verde institucional
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    brasaoContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    logoTextContainer: {
      flex: 1,
    },
    logoTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
      fontFamily: 'Arial Black, Helvetica, sans-serif',
    },
    logoSubtitle: {
      fontSize: 12,
      fontWeight: '400',
      color: 'rgba(255, 255, 255, 0.9)',
      fontFamily: 'Arial, Helvetica, sans-serif',
    },
    logoText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#333333',
      marginLeft: 12,
      fontFamily: 'Arial, Helvetica, sans-serif',
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
      backgroundColor: isDark ? '#3a3a3a' : '#E6EAE7',
      borderRightWidth: 3,
      borderRightColor: '#8A9E8E', // Verde institucional Jambeiro
    },
    menuIcon: {
      marginRight: 12,
    },
    menuText: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#333333',
      fontFamily: 'Arial, Helvetica, sans-serif',
    },
    menuTextActive: {
      color: '#8A9E8E', // Verde institucional Jambeiro
      fontWeight: '600',
    },
    content: {
      flex: 1,
      flexDirection: 'column',
    },
    header: {
      height: 60,
      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#3a3a3a' : '#E6EAE7',
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
      color: isDark ? '#FFFFFF' : '#333333',
      marginLeft: 16,
      fontFamily: 'Arial, Helvetica, sans-serif',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#3a3a3a' : '#E6EAE7',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      minWidth: 200,
    },
    searchPlaceholder: {
      marginLeft: 8,
      fontSize: 14,
      color: isDark ? '#B6B9B7' : '#B6B9B7',
      fontFamily: 'Arial, Helvetica, sans-serif',
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
      backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
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
                color={activeScreen === item.key ? '#8A9E8E' : (isDark ? '#B6B9B7' : '#B6B9B7')}
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
                color={isDark ? '#FFFFFF' : '#333333'}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{activeScreen}</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={16} color={isDark ? '#B6B9B7' : '#B6B9B7'} />
              <Text style={styles.searchPlaceholder}>Buscar...</Text>
            </View>

            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={20}
                color={isDark ? '#fbbf24' : '#B6B9B7'}
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

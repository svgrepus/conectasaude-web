import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useTheme } from '../hooks';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { theme, isDark } = useTheme();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'funcionario': return 'Funcionário';
      case 'municipe': return 'Munícipe';
      default: return 'Usuário';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ea2a33';
      case 'funcionario': return '#059669';
      case 'municipe': return '#2563eb';
      default: return theme.colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1f2937' : '#fdf2f2',
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
      marginTop: 20,
    },
    logo: {
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#111827',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
    },
    welcomeCard: {
      backgroundColor: isDark ? '#374151' : '#ffffff',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    welcomeText: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#111827',
      marginBottom: 8,
      textAlign: 'center',
    },
    userEmail: {
      fontSize: 16,
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginBottom: 12,
    },
    roleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#4b5563' : '#f3f4f6',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'center',
    },
    roleText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
    },
    actionsCard: {
      backgroundColor: isDark ? '#374151' : '#ffffff',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    actionsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#111827',
      marginBottom: 16,
      textAlign: 'center',
    },
    actionButton: {
      marginBottom: 12,
      borderRadius: 8,
    },
    logoutButton: {
      backgroundColor: '#ef4444',
      borderRadius: 8,
      marginTop: 8,
    },
    logoutButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="heart" size={48} color="#ea2a33" />
          </View>
          <Text style={styles.title}>Conecta Saúde</Text>
          <Text style={styles.subtitle}>Sistema Municipal de Saúde</Text>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.roleContainer}>
            <Ionicons 
              name={user?.role === 'admin' ? 'shield-checkmark' : user?.role === 'funcionario' ? 'medical' : 'person'} 
              size={16} 
              color={getRoleColor(user?.role || '')} 
            />
            <Text style={[styles.roleText, { color: getRoleColor(user?.role || '') }]}>
              {getRoleDisplayName(user?.role || '')}
            </Text>
          </View>
        </View>

        {/* Actions Card */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Acesso Rápido</Text>
          
          {user?.role === 'admin' && (
            <>
              <Button 
                mode="contained" 
                buttonColor="#ea2a33"
                style={styles.actionButton}
                icon="shield-account"
              >
                Painel Administrativo
              </Button>
              <Button 
                mode="outlined" 
                style={styles.actionButton}
                icon="account-group"
              >
                Gerenciar Funcionários
              </Button>
            </>
          )}

          {(user?.role === 'funcionario' || user?.role === 'admin') && (
            <>
              <Button 
                mode="outlined" 
                style={styles.actionButton}
                icon="calendar-clock"
              >
                Consultas
              </Button>
              <Button 
                mode="outlined" 
                style={styles.actionButton}
                icon="file-document"
              >
                Exames
              </Button>
              <Button 
                mode="outlined" 
                style={styles.actionButton}
                icon="pill"
              >
                Medicamentos
              </Button>
            </>
          )}

          {user?.role === 'municipe' && (
            <>
              <Button 
                mode="outlined" 
                style={styles.actionButton}
                icon="calendar"
              >
                Minhas Consultas
              </Button>
              <Button 
                mode="outlined" 
                style={styles.actionButton}
                icon="clipboard-text"
              >
                Meus Exames
              </Button>
              <Button 
                mode="outlined" 
                style={styles.actionButton}
                icon="account"
              >
                Meu Perfil
              </Button>
            </>
          )}

          <Button 
            mode="contained" 
            onPress={signOut}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonText}
            icon="logout"
          >
            Sair do Sistema
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

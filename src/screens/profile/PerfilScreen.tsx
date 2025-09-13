import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, Avatar, List, Divider } from 'react-native-paper';
import { useAuth, useTheme } from '../../hooks';

export default function PerfilScreen() {
  const [loading, setLoading] = useState(false);
  
  const { user, signOut } = useAuth();
  const { theme } = useTheme();

  const handleSignOut = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao fazer logout');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'funcionario': return 'Funcionário';
      case 'municipe': return 'Munícipe';
      default: return role;
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: theme.spacing.md,
    },
    profileCard: {
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
    },
    avatar: {
      marginBottom: theme.spacing.md,
    },
    name: {
      fontSize: theme.typography.h2,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    email: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    role: {
      fontSize: theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    menuCard: {
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    sectionTitle: {
      fontSize: theme.typography.h3,
      fontWeight: 'bold',
      color: theme.colors.text,
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    logoutButton: {
      margin: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Info Card */}
        <Card style={styles.profileCard}>
          <Avatar.Text 
            size={80} 
            label={getInitials(user?.email || '')}
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {user?.email?.split('@')[0] || 'Usuário'}
          </Text>
          <Text style={styles.email}>
            {user?.email}
          </Text>
          <Text style={styles.role}>
            {getRoleDisplayName(user?.role || '')}
          </Text>
        </Card>

        {/* Menu Options */}
        <Card style={styles.menuCard}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <List.Item
            title="Editar Perfil"
            description="Alterar dados pessoais"
            left={props => <List.Icon {...props} icon="account-edit" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to edit profile
              console.log('Navigate to edit profile');
            }}
          />
          <Divider />
          <List.Item
            title="Alterar Senha"
            description="Modificar senha de acesso"
            left={props => <List.Icon {...props} icon="lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to change password
              console.log('Navigate to change password');
            }}
          />
          <Divider />
          <List.Item
            title="Notificações"
            description="Configurar notificações"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to notifications settings
              console.log('Navigate to notifications');
            }}
          />
        </Card>

        <Card style={styles.menuCard}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <List.Item
            title="Termos de Uso"
            description="Leia os termos de uso"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to terms
              console.log('Navigate to terms');
            }}
          />
          <Divider />
          <List.Item
            title="Política de Privacidade"
            description="Nossa política de privacidade"
            left={props => <List.Icon {...props} icon="shield-check" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to privacy policy
              console.log('Navigate to privacy policy');
            }}
          />
          <Divider />
          <List.Item
            title="Suporte"
            description="Entre em contato conosco"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to support
              console.log('Navigate to support');
            }}
          />
          <Divider />
          <List.Item
            title="Versão"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleSignOut}
          loading={loading}
          disabled={loading}
          style={styles.logoutButton}
          buttonColor={theme.colors.error}
          textColor={theme.colors.error}
        >
          Sair da Conta
        </Button>
      </ScrollView>
    </View>
  );
}

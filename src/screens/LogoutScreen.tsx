import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks';
import { useAuth } from '../hooks/useAuth';

export const LogoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { signOut, user, loading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair do Sistema',
      'Tem certeza que deseja sair do sistema?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await signOut();
              if (error) {
                Alert.alert('Erro', error);
              }
              // A navegação será tratada automaticamente pelo RootNavigator
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao sair do sistema');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Configurações da Conta
            </Text>
            
            {user && (
              <View style={styles.userInfo}>
                <Text style={[styles.userLabel, { color: theme.colors.textSecondary }]}>
                  Usuário logado:
                </Text>
                <Text style={[styles.userEmail, { color: theme.colors.text }]}>
                  {user.email}
                </Text>
                {user.name && (
                  <Text style={[styles.userName, { color: theme.colors.text }]}>
                    {user.name}
                  </Text>
                )}
                <Text style={[styles.userRole, { color: theme.colors.textSecondary }]}>
                  Perfil: {user.role || 'Usuário'}
                </Text>
              </View>
            )}
          </Card.Content>
          
          <Card.Actions>
            <Button
              mode="contained"
              onPress={handleLogout}
              loading={loading}
              disabled={loading}
              buttonColor="#dc2626"
              textColor="#fff"
              icon="logout"
              style={styles.logoutButton}
            >
              {loading ? 'Saindo...' : 'Sair do Sistema'}
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  userLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  userRole: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  logoutButton: {
    flex: 1,
    margin: 8,
  },
});

export default LogoutScreen;
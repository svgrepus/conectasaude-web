import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, TextInput, Card } from 'react-native-paper';
import { useAuth, useTheme } from '../../hooks';
import { validateEmail } from '../../utils';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();
  const { theme } = useTheme();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira seu email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        'Sucesso',
        'Email de recuperação enviado! Verifique sua caixa de entrada.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      padding: theme.spacing.md,
    },
    card: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: theme.typography.h2,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
    },
    description: {
      fontSize: theme.typography.body,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      color: theme.colors.textSecondary,
    },
    input: {
      marginBottom: theme.spacing.lg,
    },
    button: {
      marginBottom: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    linkContainer: {
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Recuperar Senha</Text>
        
        <Text style={styles.description}>
          Digite seu email para receber as instruções de recuperação de senha.
        </Text>
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
          mode="outlined"
        />

        <Button
          mode="contained"
          onPress={handleResetPassword}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Enviar Email
        </Button>

        <View style={styles.linkContainer}>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
          >
            Voltar ao Login
          </Button>
        </View>
      </Card>
    </View>
  );
}

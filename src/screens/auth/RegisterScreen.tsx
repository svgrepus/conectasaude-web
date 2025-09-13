import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput, Card } from 'react-native-paper';
import { useAuth, useTheme } from '../../hooks';
import { validateEmail, validateCPF, formatCPF, formatPhone } from '../../utils';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signUp } = useAuth();
  const { theme } = useTheme();

  const handleRegister = async () => {
    const { nome, cpf, email, telefone, password, confirmPassword } = formData;

    if (!nome || !cpf || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    if (!validateCPF(cpf)) {
      Alert.alert('Erro', 'Por favor, insira um CPF válido');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email,
        password,
        nome,
        cpf: cpf.replace(/[^\d]/g, ''), // Remove formatting
        telefone: telefone || undefined,
      });
      
      Alert.alert(
        'Sucesso', 
        'Conta criada com sucesso! Verifique seu email para confirmar a conta.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
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
      marginBottom: theme.spacing.xl,
      color: theme.colors.text,
    },
    input: {
      marginBottom: theme.spacing.md,
    },
    button: {
      marginTop: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    linkContainer: {
      marginTop: theme.spacing.lg,
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Text style={styles.title}>Criar Conta</Text>
          
          <TextInput
            label="Nome Completo *"
            value={formData.nome}
            onChangeText={(value) => updateField('nome', value)}
            autoCapitalize="words"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="CPF *"
            value={formData.cpf}
            onChangeText={(value) => updateField('cpf', value)}
            keyboardType="numeric"
            maxLength={14}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Email *"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Telefone"
            value={formData.telefone}
            onChangeText={(value) => updateField('telefone', value)}
            keyboardType="phone-pad"
            maxLength={15}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Senha *"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Confirmar Senha *"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            secureTextEntry={!showPassword}
            style={styles.input}
            mode="outlined"
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Criar Conta
          </Button>

          <View style={styles.linkContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
            >
              Já tenho uma conta
            </Button>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

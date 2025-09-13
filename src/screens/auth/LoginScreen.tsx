import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useTheme } from '../../hooks';
import { validateEmail } from '../../utils';
import { BrasaoJambeiro } from '../../components/BrasaoJambeiro';
import { doencaCronicaService } from '../../services/doencaCronicaService';
import { authService } from '../../services/auth-simple';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signIn } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogin = async () => {
    // Limpar mensagens anteriores
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Por favor, insira um email válido');
      return;
    }

    console.log('Iniciando login para:', email);
    setLoading(true);
    
    try {
      const result = await signIn(email, password);
      console.log('Resultado do login:', result);
      
      if (result.error) {
        console.log('Erro no login:', result.error);
        setErrorMessage(result.error);
        return; // Para garantir que não continue
      } 
      
      if (result.data) {
        console.log('Login realizado com sucesso!', result.data);
        setSuccessMessage('Login realizado com sucesso!');
        // Navigation will be handled automatically by auth state change
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao fazer login';
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função de teste da API
  const testAPI = async () => {
    try {
      console.log('🧪 Testando API...');
      setLoading(true);
      
      // Verificar se existe token
      const token = authService.getAccessToken();
      console.log('Token atual:', token ? 'Existe' : 'Não existe');
      
      if (!token) {
        Alert.alert('Teste API', 'Primeiro faça login para obter um token de acesso');
        return;
      }
      
      // Testar a API de doenças crônicas
      const response = await doencaCronicaService.getDoencasCronicas(1, 5);
      console.log('✅ Teste da API bem-sucedido:', response);
      
      Alert.alert(
        'Teste API Sucesso', 
        `API funcionando!\nTotal: ${response.count} registros\nCarregados: ${response.data.length} itens`
      );
      
    } catch (error) {
      console.error('❌ Erro no teste da API:', error);
      Alert.alert(
        'Teste API Erro', 
        `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1f2937' : '#fdf2f2',
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      minHeight: height,
    },
    themeToggle: {
      position: 'absolute',
      top: 50,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? '#374151' : '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 10,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: isDark ? '#374151' : '#ffffff',
      borderRadius: 16,
      padding: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logo: {
      width: 48,
      height: 48,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#111827',
      textAlign: 'center',
      marginBottom: 8,
      fontFamily: 'Spline Sans',
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginBottom: 32,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      backgroundColor: isDark ? '#4b5563' : '#fce8e8',
      paddingLeft: 40,
      height: 48,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#6b7280' : '#d1d5db',
      fontSize: 14,
      color: isDark ? '#ffffff' : '#111827',
    },
    inputIcon: {
      position: 'absolute',
      left: 12,
      top: 12,
      zIndex: 1,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 24,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: '#8A9E8E', // Verde institucional da Prefeitura de Jambeiro
      fontWeight: '500',
    },
    messageContainer: {
      marginBottom: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    errorMessage: {
      backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
      borderColor: '#ef4444',
      borderWidth: 1,
    },
    successMessage: {
      backgroundColor: isDark ? '#14532d' : '#dcfce7',
      borderColor: '#22c55e',
      borderWidth: 1,
    },
    messageText: {
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '500',
    },
    errorText: {
      color: isDark ? '#fca5a5' : '#dc2626',
    },
    successText: {
      color: isDark ? '#86efac' : '#16a34a',
    },
    loginButton: {
      backgroundColor: '#8A9E8E', // Verde institucional da Prefeitura de Jambeiro
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      marginBottom: 16,
    },
    loginButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    registerText: {
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    registerLink: {
      fontSize: 14,
      color: '#8A9E8E', // Verde institucional da Prefeitura de Jambeiro
      fontWeight: '500',
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.container}>
      {/* Theme Toggle Button */}
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        <Ionicons 
          name={isDark ? 'sunny' : 'moon'} 
          size={24} 
          color={isDark ? '#fbbf24' : '#6b7280'} 
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {/* Logo and Title */}
          <View style={styles.logoContainer}>
            <BrasaoJambeiro size={48} />
            <Text style={styles.title}>ConectaSaúde</Text>
            <Text style={styles.subtitle}>Prefeitura de Jambeiro - Bem-vindo de volta!</Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color="#9ca3af" 
                style={styles.inputIcon}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                mode="flat"
                underlineStyle={{ height: 0 }}
                contentStyle={{ paddingLeft: 28 }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color="#9ca3af" 
                style={styles.inputIcon}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                style={styles.input}
                mode="flat"
                underlineStyle={{ height: 0 }}
                contentStyle={{ paddingLeft: 28 }}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
          </TouchableOpacity>

          {/* Error Message */}
          {errorMessage ? (
            <View style={[styles.messageContainer, styles.errorMessage]}>
              <Text style={[styles.messageText, styles.errorText]}>
                ❌ {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Success Message */}
          {successMessage ? (
            <View style={[styles.messageContainer, styles.successMessage]}>
              <Text style={[styles.messageText, styles.successText]}>
                ✅ {successMessage}
              </Text>
            </View>
          ) : null}

          {/* Login Button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            labelStyle={styles.loginButtonText}
            buttonColor="#8A9E8E"
          >
            ENTRAR
          </Button>

          {/* Test API Button - Temporário */}
          <Button
            mode="outlined"
            onPress={testAPI}
            loading={loading}
            disabled={loading}
            style={[styles.loginButton, { marginTop: 10, borderColor: '#8A9E8E' }]}
            labelStyle={[styles.loginButtonText, { color: '#8A9E8E' }]}
          >
            TESTAR API
          </Button>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

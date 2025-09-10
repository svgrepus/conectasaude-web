import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks';
import { validateEmail } from '../utils';
import { authService } from '../services/auth-simple';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      const user = await authService.signIn(email, password);
      console.log('Login realizado com sucesso!', user);
      setSuccessMessage('Login realizado com sucesso!');
      onLoginSuccess();
    } catch (error: any) {
      console.error('Erro no login:', error);
      setErrorMessage(error.message || 'Erro desconhecido');
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
      color: '#ea2a33',
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
      backgroundColor: '#ea2a33',
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
      color: '#ea2a33',
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
            <Ionicons name="heart" size={48} color="#ea2a33" />
            <Text style={styles.title}>Conecta Saúde</Text>
            <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
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
          <TouchableOpacity style={styles.forgotPassword}>
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
            buttonColor="#ea2a33"
          >
            Entrar
          </Button>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta?</Text>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks";
import { authService } from "../services/auth-simple";
import { BrasaoJambeiro } from "../components/BrasaoJambeiro";

const { width, height } = Dimensions.get("window");

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { theme, isDark, toggleTheme } = useTheme();

  // Fix document title for web
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Nova Senha - ConectaSaúde - Jambeiro";
      
      // Extrair token da URL
      let token = null;
      let type = null;
      
      // Tentar query parameters
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('access_token');
      type = urlParams.get('type');
      
      // Se não encontrou, tentar hash fragment
      if (!token && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        token = hashParams.get('access_token');
        type = hashParams.get('type');
      }
      
      console.log('🔍 ResetPasswordPage: Token encontrado?', { token: token ? 'Sim' : 'Não', type });
      
      if (token && type === 'recovery') {
        setAccessToken(token);
        // Limpar a URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.log('❌ ResetPasswordPage: Token não encontrado, redirecionando para login');
        // Redirecionar para login se não há token válido
        window.location.href = '/';
      }
    }
  }, []);

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return "A senha é obrigatória";
    }
    if (password.length < 8) {
      return "A senha deve ter pelo menos 8 caracteres";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "A senha deve conter pelo menos uma letra minúscula";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "A senha deve conter pelo menos uma letra maiúscula";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "A senha deve conter pelo menos um número";
    }
    return null;
  };

  const handleUpdatePassword = async () => {
    // Limpar mensagens anteriores
    setErrorMessage("");
    setSuccessMessage("");

    // Verificar se temos token
    if (!accessToken) {
      setErrorMessage("Token de acesso inválido. Solicite um novo link de redefinição.");
      return;
    }

    // Validações
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem");
      return;
    }

    console.log("Atualizando senha do usuário");
    setLoading(true);

    try {
      await authService.updatePassword(password, accessToken);
      setSuccessMessage("Senha atualizada com sucesso!");
      setShowSuccess(true);
      
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      setErrorMessage(error.message || "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    window.location.href = '/';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#FFFFFF",
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      minHeight: height,
    },
    themeToggle: {
      position: "absolute",
      top: 50,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? "#3a3a3a" : "#E6EAE7",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 10,
    },
    card: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: isDark ? "#2a2a2a" : "#E6EAE7",
      borderRadius: 12,
      padding: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#333333",
      textAlign: "center",
      marginBottom: 8,
      fontFamily: "Arial Black, Helvetica, sans-serif",
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? "#B6B9B7" : "#B6B9B7",
      textAlign: "center",
      marginBottom: 32,
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    instructionText: {
      fontSize: 16,
      color: isDark ? "#B6B9B7" : "#666666",
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 24,
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputWrapper: {
      position: "relative",
    },
    input: {
      backgroundColor: isDark ? "#3a3a3a" : "#FFFFFF",
      paddingLeft: 40,
      height: 48,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: isDark ? "#B6B9B7" : "#E6EAE7",
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#333333",
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    inputIcon: {
      position: "absolute",
      left: 12,
      top: 12,
      zIndex: 1,
    },
    passwordRequirements: {
      backgroundColor: isDark ? "#3a3a3a" : "#f8f9fa",
      padding: 12,
      borderRadius: 6,
      marginBottom: 16,
    },
    requirementsTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#333333",
      marginBottom: 8,
    },
    requirementItem: {
      fontSize: 12,
      color: isDark ? "#B6B9B7" : "#666666",
      marginBottom: 4,
    },
    messageContainer: {
      marginBottom: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    errorMessage: {
      backgroundColor: isDark ? "#7f1d1d" : "#fee2e2",
      borderColor: "#ef4444",
      borderWidth: 1,
    },
    successMessage: {
      backgroundColor: isDark ? "#14532d" : "#dcfce7",
      borderColor: "#22c55e",
      borderWidth: 1,
    },
    messageText: {
      fontSize: 14,
      textAlign: "center",
      fontWeight: "500",
    },
    errorText: {
      color: isDark ? "#fca5a5" : "#dc2626",
    },
    successText: {
      color: isDark ? "#86efac" : "#16a34a",
    },
    updateButton: {
      backgroundColor: "#8A9E8E",
      height: 48,
      borderRadius: 6,
      justifyContent: "center",
      marginBottom: 16,
    },
    updateButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "Arial, Helvetica, sans-serif",
      textTransform: "uppercase",
    },
    successContainer: {
      alignItems: "center",
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#22c55e",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#333333",
      textAlign: "center",
      marginBottom: 12,
    },
    successMessageText: {
      fontSize: 16,
      color: isDark ? "#B6B9B7" : "#666666",
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 24,
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    loginButton: {
      backgroundColor: "#8A9E8E",
      height: 48,
      borderRadius: 6,
      justifyContent: "center",
      width: "100%",
      marginBottom: 16,
    },
    loginButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "Arial, Helvetica, sans-serif",
      textTransform: "uppercase",
    },
  });

  if (showSuccess) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={24}
            color={isDark ? "#fbbf24" : "#B6B9B7"}
          />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <BrasaoJambeiro size={48} />
              <Text style={styles.title}>ConectaSaúde</Text>
              <Text style={styles.subtitle}>Prefeitura de Jambeiro</Text>
            </View>

            <View style={styles.successContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark" size={40} color="#ffffff" />
              </View>

              <Text style={styles.successTitle}>Senha Atualizada!</Text>
              <Text style={styles.successMessageText}>
                Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
              </Text>

              <Button
                mode="contained"
                onPress={handleGoToLogin}
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}
                buttonColor="#8A9E8E"
              >
                FAZER LOGIN
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        <Ionicons
          name={isDark ? "sunny" : "moon"}
          size={24}
          color={isDark ? "#fbbf24" : "#B6B9B7"}
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <BrasaoJambeiro size={48} />
            <Text style={styles.title}>Nova Senha</Text>
            <Text style={styles.subtitle}>ConectaSaúde - Jambeiro</Text>
          </View>

          <Text style={styles.instructionText}>
            Crie uma nova senha segura para sua conta.
          </Text>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Requisitos da senha:</Text>
            <Text style={styles.requirementItem}>• Pelo menos 8 caracteres</Text>
            <Text style={styles.requirementItem}>• Uma letra maiúscula</Text>
            <Text style={styles.requirementItem}>• Uma letra minúscula</Text>
            <Text style={styles.requirementItem}>• Um número</Text>
          </View>

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
                placeholder="Nova senha"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                style={styles.input}
                mode="flat"
                underlineStyle={{ height: 0 }}
                contentStyle={{ paddingLeft: 28 }}
                returnKeyType="next"
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9ca3af"
                style={styles.inputIcon}
              />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar nova senha"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                mode="flat"
                underlineStyle={{ height: 0 }}
                contentStyle={{ paddingLeft: 28 }}
                onSubmitEditing={handleUpdatePassword}
                returnKeyType="send"
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
            </View>
          </View>

          {errorMessage ? (
            <View style={[styles.messageContainer, styles.errorMessage]}>
              <Text style={[styles.messageText, styles.errorText]}>
                ❌ {errorMessage}
              </Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={[styles.messageContainer, styles.successMessage]}>
              <Text style={[styles.messageText, styles.successText]}>
                ✅ {successMessage}
              </Text>
            </View>
          ) : null}

          <Button
            mode="contained"
            onPress={handleUpdatePassword}
            loading={loading}
            disabled={loading || !accessToken}
            style={styles.updateButton}
            labelStyle={styles.updateButtonText}
            buttonColor="#8A9E8E"
          >
            ATUALIZAR SENHA
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};
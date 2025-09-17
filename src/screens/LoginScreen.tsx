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
import { validateEmail } from "../utils";
import { authService } from "../services/auth-simple";
import { BrasaoJambeiro } from "../components/BrasaoJambeiro";

const { width, height } = Dimensions.get("window");

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { theme, isDark, toggleTheme } = useTheme();

  // Fix document title for web
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Login - ConectaSaúde - Jambeiro";
    }
  }, []);

  const handleLogin = async () => {
    // Limpar mensagens anteriores
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Por favor, preencha todos os campos");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Por favor, insira um email válido");
      return;
    }

    console.log("Iniciando login para:", email);
    setLoading(true);

    try {
      const user = await authService.signIn(email, password);
      console.log("Login realizado com sucesso!", user);
      setSuccessMessage("Login realizado com sucesso!");
      onLoginSuccess();
    } catch (error: any) {
      console.error("Erro no login:", error);
      setErrorMessage(error.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
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
    logo: {
      width: 48,
      height: 48,
      marginBottom: 16,
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
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 24,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: "#8A9E8E",
      fontWeight: "500",
      fontFamily: "Arial, Helvetica, sans-serif",
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
    loginButton: {
      backgroundColor: "#8A9E8E",
      height: 48,
      borderRadius: 6,
      justifyContent: "center",
      marginBottom: 16,
    },
    loginButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "Arial, Helvetica, sans-serif",
      textTransform: "uppercase",
    },
    registerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    registerText: {
      fontSize: 14,
      color: isDark ? "#B6B9B7" : "#B6B9B7",
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    registerLink: {
      fontSize: 14,
      color: "#8A9E8E",
      fontWeight: "500",
      marginLeft: 4,
      fontFamily: "Arial, Helvetica, sans-serif",
    },
  });

  return (
    <View style={styles.container}>
      {/* Theme Toggle Button */}
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        <Ionicons
          name={isDark ? "sunny" : "moon"}
          size={24}
          color={isDark ? "#fbbf24" : "#B6B9B7"}
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {/* Logo and Title */}
          <View style={styles.logoContainer}>
            <BrasaoJambeiro size={48} />
            <Text style={styles.title}>ConectaSaúde</Text>
            <Text style={styles.subtitle}>Prefeitura de Jambeiro</Text>
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
                    icon={showPassword ? "eye-off" : "eye"}
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
            buttonColor="#8A9E8E"
          >
            ENTRAR
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

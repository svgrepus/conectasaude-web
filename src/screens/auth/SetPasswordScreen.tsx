import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { magicLinkService } from "../../services/magicLinkService";
import {
  validateEmail,
} from "../../utils";

interface SetPasswordScreenProps {
  onPasswordSet?: () => void;
  userEmail?: string;
  userName?: string;
}

const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({
  onPasswordSet,
  userEmail,
  userName,
}) => {
  const currentTheme = theme.light;
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para validação individual dos requisitos
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    passwordsMatch: false,
  });

  const validatePasswordRequirements = (password: string, confirmPassword: string) => {
    setPasswordValidation({
      hasMinLength: password.length >= 8,
      hasUpperCase: /(?=.*[A-Z])/.test(password),
      hasLowerCase: /(?=.*[a-z])/.test(password),
      hasNumber: /(?=.*\d)/.test(password),
      passwordsMatch: password.length > 0 && password === confirmPassword,
    });
  };

  const updateFormData = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Validar requisitos em tempo real
    validatePasswordRequirements(
      field === 'password' ? value : newFormData.password,
      field === 'confirmPassword' ? value : newFormData.confirmPassword
    );
    
    // Limpar mensagens ao modificar campos
    if (message) setMessage(null);
  };

  // Verificar se todos os requisitos foram atendidos
  const allRequirementsMet = passwordValidation.hasMinLength && 
                            passwordValidation.hasUpperCase && 
                            passwordValidation.hasLowerCase && 
                            passwordValidation.hasNumber && 
                            passwordValidation.passwordsMatch;

  const validateForm = (): string | null => {
    if (!formData.password.trim()) {
      return "Senha é obrigatória";
    }

    if (formData.password.length < 8) {
      return "Senha deve ter pelo menos 8 caracteres";
    }

    if (!/(?=.*[a-z])/.test(formData.password)) {
      return "Senha deve conter pelo menos uma letra minúscula";
    }

    if (!/(?=.*[A-Z])/.test(formData.password)) {
      return "Senha deve conter pelo menos uma letra maiúscula";
    }

    if (!/(?=.*\d)/.test(formData.password)) {
      return "Senha deve conter pelo menos um número";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Senhas não coincidem";
    }

    return null;
  };

  const handleSetPassword = async () => {
    try {
      setLoading(true);
      setMessage(null);

      // Validar formulário
      const validationError = validateForm();
      if (validationError) {
        setMessage({ type: 'error', text: validationError });
        return;
      }

      console.log("🔐 SetPasswordScreen: Definindo senha...");

      // Definir senha através do Magic Link Service
      const result = await magicLinkService.updatePasswordFirstAccess(formData.password);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        
        // Aguardar um pouco e chamar callback
        setTimeout(() => {
          if (onPasswordSet) {
            onPasswordSet();
          }
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }

    } catch (error) {
      console.error("❌ Erro ao definir senha:", error);
      setMessage({ type: 'error', text: "Erro inesperado ao definir senha" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: currentTheme.primary }]}>
              <Ionicons name="medical" size={40} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: currentTheme.text }]}>
              Bem-vindo ao ConectaSaúde!
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.mutedForeground }]}>
              Para começar, defina sua senha de acesso
            </Text>
          </View>

          {/* User Info */}
          {(userName || userEmail) && (
            <View style={[styles.userInfo, { backgroundColor: currentTheme.muted }]}>
              <Ionicons name="person-circle" size={24} color={currentTheme.primary} />
              <View style={styles.userDetails}>
                {userName && (
                  <Text style={[styles.userName, { color: currentTheme.text }]}>
                    {userName}
                  </Text>
                )}
                {userEmail && (
                  <Text style={[styles.userEmail, { color: currentTheme.mutedForeground }]}>
                    {userEmail}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Mensagem */}
          {message && (
            <View style={[
              styles.messageContainer,
              { backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da' }
            ]}>
              <Text style={[
                styles.messageText,
                { color: message.type === 'success' ? '#155724' : '#721c24' }
              ]}>
                {message.text}
              </Text>
            </View>
          )}

          {/* Formulário */}
          <View style={[styles.form, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.formTitle, { color: currentTheme.text }]}>
              Definir Senha
            </Text>

            {/* Nova Senha */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Nova Senha *
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { 
                    backgroundColor: currentTheme.background, 
                    borderColor: currentTheme.border, 
                    color: currentTheme.text 
                  }]}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={formData.password}
                  onChangeText={(value) => updateFormData("password", value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={currentTheme.mutedForeground} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Senha */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Confirmar Senha *
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { 
                    backgroundColor: currentTheme.background, 
                    borderColor: currentTheme.border, 
                    color: currentTheme.text 
                  }]}
                  placeholder="Digite a senha novamente"
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData("confirmPassword", value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={currentTheme.mutedForeground} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Requisitos da senha */}
            <View style={styles.passwordRequirements}>
              <View style={styles.requirementsHeader}>
                <Text style={[styles.requirementsTitle, { color: currentTheme.mutedForeground }]}>
                  Requisitos da senha:
                </Text>
                <View style={styles.progressContainer}>
                  <Text style={[styles.progressText, { color: currentTheme.mutedForeground }]}>
                    {Object.values(passwordValidation).filter(Boolean).length}/5
                  </Text>
                </View>
              </View>
              
              {/* Barra de progresso */}
              <View style={[styles.progressBar, { backgroundColor: currentTheme.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: "#22c55e",
                      width: `${(Object.values(passwordValidation).filter(Boolean).length / 5) * 100}%`
                    }
                  ]} 
                />
              </View>
              
              {/* Requisito: 8 caracteres */}
              <View style={styles.requirementRow}>
                <Ionicons 
                  name={passwordValidation.hasMinLength ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={passwordValidation.hasMinLength ? "#22c55e" : currentTheme.mutedForeground} 
                />
                <Text style={[
                  styles.requirementText, 
                  { 
                    color: passwordValidation.hasMinLength ? "#22c55e" : currentTheme.mutedForeground,
                    textDecorationLine: passwordValidation.hasMinLength ? "line-through" : "none"
                  }
                ]}>
                  Pelo menos 8 caracteres
                </Text>
              </View>

              {/* Requisito: Letra maiúscula */}
              <View style={styles.requirementRow}>
                <Ionicons 
                  name={passwordValidation.hasUpperCase ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={passwordValidation.hasUpperCase ? "#22c55e" : currentTheme.mutedForeground} 
                />
                <Text style={[
                  styles.requirementText, 
                  { 
                    color: passwordValidation.hasUpperCase ? "#22c55e" : currentTheme.mutedForeground,
                    textDecorationLine: passwordValidation.hasUpperCase ? "line-through" : "none"
                  }
                ]}>
                  Uma letra maiúscula (A-Z)
                </Text>
              </View>

              {/* Requisito: Letra minúscula */}
              <View style={styles.requirementRow}>
                <Ionicons 
                  name={passwordValidation.hasLowerCase ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={passwordValidation.hasLowerCase ? "#22c55e" : currentTheme.mutedForeground} 
                />
                <Text style={[
                  styles.requirementText, 
                  { 
                    color: passwordValidation.hasLowerCase ? "#22c55e" : currentTheme.mutedForeground,
                    textDecorationLine: passwordValidation.hasLowerCase ? "line-through" : "none"
                  }
                ]}>
                  Uma letra minúscula (a-z)
                </Text>
              </View>

              {/* Requisito: Número */}
              <View style={styles.requirementRow}>
                <Ionicons 
                  name={passwordValidation.hasNumber ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={passwordValidation.hasNumber ? "#22c55e" : currentTheme.mutedForeground} 
                />
                <Text style={[
                  styles.requirementText, 
                  { 
                    color: passwordValidation.hasNumber ? "#22c55e" : currentTheme.mutedForeground,
                    textDecorationLine: passwordValidation.hasNumber ? "line-through" : "none"
                  }
                ]}>
                  Um número (0-9)
                </Text>
              </View>

              {/* Requisito: Senhas coincidem */}
              {formData.confirmPassword.length > 0 && (
                <View style={styles.requirementRow}>
                  <Ionicons 
                    name={passwordValidation.passwordsMatch ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={passwordValidation.passwordsMatch ? "#22c55e" : "#ef4444"} 
                  />
                  <Text style={[
                    styles.requirementText, 
                    { 
                      color: passwordValidation.passwordsMatch ? "#22c55e" : "#ef4444",
                      textDecorationLine: passwordValidation.passwordsMatch ? "line-through" : "none"
                    }
                  ]}>
                    Senhas coincidem
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Botão */}
          <TouchableOpacity
            style={[
              styles.setPasswordButton,
              { backgroundColor: allRequirementsMet ? currentTheme.primary : currentTheme.mutedForeground },
              (loading || !allRequirementsMet) && styles.setPasswordButtonDisabled
            ]}
            onPress={handleSetPassword}
            disabled={loading || !allRequirementsMet}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.setPasswordButtonText}>
                Definir Senha
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  messageText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  form: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    paddingRight: 50,
  },
  passwordToggle: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  passwordRequirements: {
    marginTop: 16,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    marginBottom: 4,
    paddingLeft: 8,
  },
  setPasswordButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  setPasswordButtonDisabled: {
    opacity: 0.6,
  },
  setPasswordButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    paddingLeft: 8,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  requirementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressContainer: {
    alignItems: "flex-end",
  },
  progressText: {
    fontSize: 11,
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.3s ease",
  },
});

export default SetPasswordScreen;
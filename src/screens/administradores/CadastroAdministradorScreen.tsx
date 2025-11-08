import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { 
  administradoresService, 
  type AdminUser, 
  type AdminUserForm
} from "../../services/administradoresService";
import { magicLinkService } from "../../services/magicLinkService";
import { SimpleComboPicker } from "../../components/SimpleComboPicker";
import {
  validateEmail,
  formatPhone,
} from "../../utils";

interface CadastroAdministradorForm {
  email: string;
  fullName: string;
  dataNascimento: string;
  telefone: string;
  role: "admin" | "funcionario" | "municipe";
}

interface CadastroAdministradorScreenProps {
  onBack: () => void;
  administradorToEdit?: AdminUser | null;
  isEdit?: boolean;
  onSaveSuccess?: () => void;
}

const CadastroAdministradorScreen: React.FC<CadastroAdministradorScreenProps> = ({
  onBack,
  administradorToEdit,
  isEdit = false,
  onSaveSuccess,
}) => {
  const currentTheme = theme.light;
  
  // Estados do formulário
  const [formData, setFormData] = useState<CadastroAdministradorForm>({
    email: "",
    fullName: "",
    dataNascimento: "",
    telefone: "",
    role: "funcionario",
  });

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Opções para selects
  const roleOptions = [
    { label: "Administrador", value: "admin" },
    { label: "Funcionário", value: "funcionario" },
    { label: "Munícipe", value: "municipe" },
  ];

  // Efeito para carregar dados no modo edição
  useEffect(() => {
    if (isEdit && administradorToEdit) {
      preencherFormularioEdicao(administradorToEdit);
    }
  }, [isEdit, administradorToEdit]);

  const preencherFormularioEdicao = (administrador: AdminUser) => {
    // Buscar telefone no user_metadata ou na raiz, e formatar para exibição
    const telefoneRaw = administrador.user_metadata?.telefone || administrador.user_metadata?.phone || administrador.phone || "";
    const telefoneFormatado = telefoneRaw ? formatPhone(telefoneRaw) : "";
    
    console.log("🔄 Carregando dados do administrador:", administrador);
    console.log("📊 user_metadata:", administrador.user_metadata);
    
    setFormData({
      email: administrador.email || "",
      fullName: administrador.user_metadata?.full_name || 
                administrador.user_metadata?.nome || 
                administrador.user_metadata?.name || "",
      dataNascimento: administrador.user_metadata?.data_nascimento || "",
      telefone: telefoneFormatado,
      role: (administrador.app_metadata?.role as "admin" | "funcionario" | "municipe") || "funcionario",
    });
  };

  const updateFormData = (field: keyof CadastroAdministradorForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar mensagens ao modificar campos
    if (message) setMessage(null);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    updateFormData("telefone", formatted);
  };

  const handleDateChange = (value: string) => {
    // Remover tudo que não for número
    let cleaned = value.replace(/\D/g, '');
    
    // Aplicar máscara DD/MM/AAAA
    if (cleaned.length >= 5) {
      cleaned = cleaned.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    } else if (cleaned.length >= 3) {
      cleaned = cleaned.replace(/(\d{2})(\d{2})/, '$1/$2');
    }
    
    updateFormData("dataNascimento", cleaned);
  };

  const validateForm = (): string | null => {
    // Validações obrigatórias
    if (!formData.email.trim()) {
      return "E-mail é obrigatório";
    }

    if (!validateEmail(formData.email)) {
      return "E-mail deve ter formato válido (exemplo@dominio.com)";
    }

    if (!formData.fullName.trim()) {
      return "Nome completo é obrigatório";
    }



    if (!formData.role) {
      return "Função é obrigatória";
    }

    if (!formData.dataNascimento.trim()) {
      return "Data de nascimento é obrigatória";
    }

    if (!formData.telefone.trim()) {
      return "Telefone é obrigatório";
    }

    return null;
  };

  const handleSalvar = async () => {
    try {
      // Validar formulário
      const validationError = validateForm();
      if (validationError) {
        setMessage({ type: 'error', text: validationError });
        return;
      }

      setLoading(true);
      setMessage(null);

      // Limpar formatação do telefone antes de enviar
      const telefoneClean = formData.telefone ? formData.telefone.replace(/[^\d]/g, '') : '';
      
      const adminData: AdminUserForm = {
        email: formData.email,
        display_name: formData.fullName,
        full_name: formData.fullName,
        role: formData.role,
        phone: telefoneClean || undefined,
        data_nascimento: formData.dataNascimento,
      };

      // Não enviamos senha pois usamos Magic Link

      let resultado;

      if (isEdit && administradorToEdit) {
        // Atualizar administrador existente
        resultado = await administradoresService.atualizarAdministrador(
          administradorToEdit.id,
          adminData
        );
        
        setMessage({ 
          type: 'success', 
          text: 'Administrador atualizado com sucesso!' 
        });
      } else {
        // Criar novo administrador via Magic Link
        resultado = await magicLinkService.sendMagicLinkForNewAdmin(
          formData.email,
          formData.fullName,
          formData.dataNascimento,
          telefoneClean
        );
        
        if (resultado.success) {
          setMessage({ 
            type: 'success', 
            text: 'Magic Link enviado! O usuário receberá um e-mail para definir sua senha.' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: resultado.message || 'Erro ao enviar Magic Link.' 
          });
          return;
        }
      }

      console.log("✅ Operação realizada com sucesso:", resultado);

      // Chamar callback de sucesso se fornecido
      if (onSaveSuccess) {
        await onSaveSuccess();
      }

      // Retornar à lista após 2 segundos
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (error: any) {
      console.error("❌ Erro ao salvar administrador:", error);
      
      let errorMessage = "Erro inesperado ao salvar. Tente novamente.";
      
      if (error.message?.includes("already registered")) {
        errorMessage = "Este e-mail já está registrado no sistema.";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "E-mail inválido.";
      } else if (error.message?.includes("Password")) {
        errorMessage = "Erro relacionado à senha. Verifique os requisitos.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const hasFormData = () => {
    if (isEdit && administradorToEdit) {
      // No modo edição, verificar se algum campo foi alterado dos valores originais
      const telefoneOriginal = administradorToEdit.user_metadata?.phone || administradorToEdit.phone || "";
      const telefoneOriginalFormatado = telefoneOriginal ? formatPhone(telefoneOriginal) : "";
      
      return formData.email !== (administradorToEdit.email || "") ||
             formData.fullName !== (administradorToEdit.user_metadata?.full_name || administradorToEdit.user_metadata?.nome || administradorToEdit.user_metadata?.name || "") ||
             formData.dataNascimento !== (administradorToEdit.user_metadata?.data_nascimento || "") ||
             formData.telefone !== telefoneOriginalFormatado ||
             formData.role !== ((administradorToEdit.app_metadata?.role as "admin" | "funcionario" | "municipe") || "funcionario");
    } else {
      // No modo criação, verificar se algum campo foi preenchido
      return formData.email.trim() !== "" ||
             formData.fullName.trim() !== "" ||
             formData.dataNascimento.trim() !== "" ||
             formData.telefone.trim() !== "";
    }
  };

  const handleVoltar = () => {
    console.log("🔙 handleVoltar: Voltando diretamente");
    // Voltar diretamente sem confirmação
    onBack();
  };

  const handleCancelar = () => {
    console.log("❌ handleCancelar: Voltando diretamente");
    console.log("📋 onBack function:", onBack);
    try {
      onBack();
      console.log("✅ onBack chamado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao chamar onBack:", error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.surface, borderBottomColor: currentTheme.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
            <Ionicons name="arrow-back" size={24} color={currentTheme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
            {isEdit ? "Editar Administrador" : "Novo Administrador"}
          </Text>
          
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          
          {/* Mensagem de feedback */}
          {message && (
            <View style={[
              styles.messageContainer,
              { backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da' }
            ]}>
              <Ionicons 
                name={message.type === 'success' ? "checkmark-circle" : "alert-circle"} 
                size={20} 
                color={message.type === 'success' ? '#155724' : '#721c24'} 
              />
              <Text style={[
                styles.messageText,
                { color: message.type === 'success' ? '#155724' : '#721c24' }
              ]}>
                {message.text}
              </Text>
            </View>
          )}

          {/* Seção: Dados Básicos */}
          <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Dados Básicos
            </Text>

            {/* Nome Completo */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Nome Completo *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]}
                placeholder="Digite o nome completo"
                placeholderTextColor={currentTheme.mutedForeground}
                value={formData.fullName}
                onChangeText={(value) => updateFormData("fullName", value)}
                autoCapitalize="words"
              />
            </View>

            {/* E-mail */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                E-mail *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]}
                placeholder="exemplo@dominio.com"
                placeholderTextColor={currentTheme.mutedForeground}
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Data de Nascimento */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Data de Nascimento *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={currentTheme.mutedForeground}
                value={formData.dataNascimento}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {/* Telefone */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Telefone *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]}
                placeholder="(11) 99999-9999"
                placeholderTextColor={currentTheme.mutedForeground}
                value={formData.telefone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>



            {/* Função */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Função *
              </Text>
              <SimpleComboPicker
                items={roleOptions}
                selectedValue={formData.role}
                onValueChange={(value: string) => updateFormData("role", value as "admin" | "funcionario" | "municipe")}
                placeholder="Selecione a função"
                label="Função"
                required={true}
              />
            </View>
          </View>


        </View>
      </ScrollView>

      {/* Footer com botões */}
      <View style={[styles.footer, { backgroundColor: currentTheme.surface, borderTopColor: currentTheme.border }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: currentTheme.border }]}
          onPress={handleCancelar}
          disabled={loading}
        >
          <Text style={[styles.cancelButtonText, { color: currentTheme.text }]}>
            Cancelar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.saveButtonDisabled
          ]}
          onPress={handleSalvar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEdit ? "Atualizar" : "Criar Administrador"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  messageText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  section: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 45,
    fontSize: 16,
  },
  passwordToggle: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  passwordRequirements: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  requirementItem: {
    fontSize: 11,
    marginBottom: 2,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#8A9E8E",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CadastroAdministradorScreen;
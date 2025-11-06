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
  motoristasService, 
  type CriarMotoristaData, 
  type MotoristaCompleto,
  ESTADO_CIVIL_OPTIONS
} from "../../services/motoristasService";
import { SimpleComboPicker } from "../../components/SimpleComboPicker";
import { PhotoUpload } from "../../components/PhotoUpload";
import {
  formatCPF,
  formatPhone,
  formatDate,
  validateCPF,
  validateBirthDate,
  formatCEP,
} from "../../utils";

interface CadastroMotoristaForm {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  email: string;
  telefone: string;
  fotoUrl: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes: string;
}

interface CadastroMotoristaScreenProps {
  onBack: () => void;
  motoristaToEdit?: MotoristaCompleto | null;
  isEdit?: boolean;
  onSaveSuccess?: () => void;
}

const CadastroMotoristaScreen: React.FC<CadastroMotoristaScreenProps> = ({
  onBack,
  motoristaToEdit,
  isEdit = false,
  onSaveSuccess,
}) => {
  const currentTheme = theme.light;
  
  // Estados do formulário
  const [formData, setFormData] = useState<CadastroMotoristaForm>({
    nomeCompleto: "",
    cpf: "",
    dataNascimento: "",
    sexo: "",
    estadoCivil: "",
    email: "",
    telefone: "",
    fotoUrl: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    observacoes: "",
  });

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [idade, setIdade] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"pessoais" | "escala">("pessoais");

  // Efeito para carregar dados no modo edição
  useEffect(() => {
    if (isEdit && motoristaToEdit) {
      preencherFormularioEdicao(motoristaToEdit);
    }
  }, [isEdit, motoristaToEdit]);

  const preencherFormularioEdicao = (motoristaCompleto: MotoristaCompleto) => {
    const motorista = motoristaCompleto.motorista;
    const endereco = motoristaCompleto.endereco;
    
    const dataNascimentoFormatada = formatDate(motorista.data_nascimento || "");
    
    setFormData({
      nomeCompleto: motorista.nome || "",
      cpf: formatCPF(motorista.cpf || ""),
      dataNascimento: dataNascimentoFormatada,
      sexo: motorista.sexo || "",
      estadoCivil: motorista.estado_civil || "",
      email: motorista.email || "",
      telefone: formatPhone(motorista.telefone || ""),
      fotoUrl: motorista.foto_url || "",
      
      // Dados do endereço
      cep: formatCEP(endereco?.cep || ""),
      logradouro: endereco?.logradouro || "",
      numero: endereco?.numero || "",
      complemento: endereco?.complemento || "",
      bairro: endereco?.bairro || "",
      cidade: endereco?.cidade || "",
      estado: endereco?.uf || "",
      observacoes: motorista.observacoes || "",
    });

    // Calcular idade se há data de nascimento
    if (dataNascimentoFormatada) {
      const calculatedAge = calculateAge(dataNascimentoFormatada);
      setIdade(calculatedAge);
    }
  };

  const handleInputChange = (field: keyof CadastroMotoristaForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar mensagens ao editar
    if (message) {
      setMessage(null);
    }
  };

  // Função para calcular idade baseada na data de nascimento
  const calculateAge = (birthDate: string): number => {
    try {
      let date: Date;
      
      // Verifica se é formato DD/MM/YYYY ou ISO
      if (birthDate.includes('/')) {
        const [day, month, year] = birthDate.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(birthDate);
      }
      
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      
      return age >= 0 ? age : 0;
    } catch (error) {
      console.warn('Erro ao calcular idade:', error);
      return 0;
    }
  };

  // Função específica para atualizar data de nascimento e calcular idade
  const updateBirthDate = (dateString: string) => {
    const formattedDate = formatDate(dateString);
    handleInputChange('dataNascimento', formattedDate);
    
    // Calcular idade automaticamente
    if (formattedDate.length === 10) { // DD/MM/YYYY completo
      const calculatedAge = calculateAge(formattedDate);
      setIdade(calculatedAge);
    }
  };

  // Função para buscar CEP
  const buscarCEP = async () => {
    const cepSomenteNumeros = formData.cep.replace(/\D/g, "");
    
    if (cepSomenteNumeros.length === 8) {
      setLoadingCEP(true);
      try {
        console.log("🔍 Buscando CEP:", cepSomenteNumeros);
        const response = await fetch(
          `https://viacep.com.br/ws/${cepSomenteNumeros}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          handleInputChange('logradouro', data.logradouro || '');
          handleInputChange('bairro', data.bairro || '');
          handleInputChange('cidade', data.localidade || '');
          handleInputChange('estado', data.uf || '');
          console.log("✅ CEP encontrado e endereço preenchido");
        } else {
          console.warn("⚠️ CEP não encontrado:", cepSomenteNumeros);
          Alert.alert("CEP não encontrado", "Verifique o CEP digitado.");
        }
      } catch (error) {
        console.error("❌ Erro ao buscar CEP:", error);
        Alert.alert("Erro", "Não foi possível buscar o CEP. Tente novamente.");
      } finally {
        setLoadingCEP(false);
      }
    } else {
      Alert.alert("CEP inválido", "Digite um CEP com 8 dígitos.");
    }
  };

  // Função para converter data para formato do banco
  const convertDateToDatabase = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // Se já está no formato ISO, retorna como está
      if (dateString.includes('-') && dateString.length >= 10) {
        return dateString.split('T')[0]; // Remove parte do tempo se houver
      }
      
      // Se está no formato DD/MM/YYYY, converte para YYYY-MM-DD
      const [day, month, year] = dateString.split('/');
      if (day && month && year) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      return dateString;
    } catch (error) {
      console.warn('Erro ao converter data:', error);
      return dateString;
    }
  };

  const validateForm = (): string | null => {
    if (!formData.nomeCompleto.trim()) return "Nome completo é obrigatório";
    if (!formData.cpf.trim()) return "CPF é obrigatório";
    if (!validateCPF(formData.cpf)) return "CPF inválido";
    if (!formData.dataNascimento.trim()) return "Data de nascimento é obrigatória";
    if (!validateBirthDate(formData.dataNascimento)) return "Data de nascimento inválida";
    if (!formData.sexo.trim()) return "Sexo é obrigatório";
    if (!formData.cep.trim()) return "CEP é obrigatório";
    if (!formData.logradouro.trim()) return "Logradouro é obrigatório";
    
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const motoristaData: CriarMotoristaData = {
        // Dados pessoais
        nome: formData.nomeCompleto,
        cpf: formData.cpf.replace(/\D/g, ''),
        rg: '', // Campo obrigatório mas não temos no formulário - colocar como vazio
        data_nascimento: convertDateToDatabase(formData.dataNascimento),
        sexo: formData.sexo as 'M' | 'F',
        estado_civil: formData.estadoCivil,
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''),
        foto_url: formData.fotoUrl,
        observacoes: formData.observacoes,
        cargo_id: 12, // Valor fixo conforme solicitado
        
        // Dados do endereço
        cep: formData.cep.replace(/\D/g, ''),
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.estado,
        
        // Escalas de trabalho - pelo menos uma é obrigatória
        escalas: [
          {
            dia_semana: 1, // Segunda-feira
            periodos: ['MANHA'], // Período manhã como padrão
            observacoes: 'Escala padrão'
          }
        ]
      };

      if (isEdit && motoristaToEdit?.motorista?.id) {
        await motoristasService.atualizarMotoristaCompleto(motoristaToEdit.motorista.id, motoristaData);
        setMessage({ type: 'success', text: 'Motorista atualizado com sucesso!' });
      } else {
        await motoristasService.criarMotoristaCompleto(motoristaData);
        setMessage({ type: 'success', text: 'Motorista cadastrado com sucesso!' });
      }

      setTimeout(() => {
        onSaveSuccess?.();
        onBack();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao salvar motorista:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erro ao salvar motorista. Tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDadosPessoais = () => (
    <View style={styles.tabContent}>
      {/* Foto */}
      <View style={styles.photoSection}>
        <PhotoUpload
          currentPhoto={formData.fotoUrl}
          onPhotoSelected={(uri: string) => handleInputChange('fotoUrl', uri)}
          label="Foto do Motorista"
        />
      </View>

      {/* Nome Completo */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.foreground }]}>
          Nome Completo *
        </Text>
        <TextInput
          style={[styles.input, { 
            borderColor: currentTheme.border, 
            color: currentTheme.foreground 
          }]}
          value={formData.nomeCompleto}
          onChangeText={(text) => handleInputChange('nomeCompleto', text)}
          placeholder="Nome completo do motorista"
          placeholderTextColor={currentTheme.mutedForeground}
        />
      </View>

      {/* CPF */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.foreground }]}>
          CPF *
        </Text>
        <TextInput
          style={[styles.input, { 
            borderColor: currentTheme.border, 
            color: currentTheme.foreground 
          }]}
          value={formData.cpf}
          onChangeText={(text) => handleInputChange('cpf', formatCPF(text))}
          placeholder="000.000.000-00"
          placeholderTextColor={currentTheme.mutedForeground}
          keyboardType="numeric"
          maxLength={14}
        />
      </View>

      {/* Data de Nascimento e Idade */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={[styles.label, { color: currentTheme.foreground }]}>
            Data de Nascimento *
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: currentTheme.border, 
              color: currentTheme.foreground 
            }]}
            value={formData.dataNascimento}
            onChangeText={updateBirthDate}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={currentTheme.mutedForeground}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={[styles.label, { color: currentTheme.foreground }]}>
            Idade
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: currentTheme.border, 
              color: currentTheme.mutedForeground,
              backgroundColor: currentTheme.muted
            }]}
            value={idade > 0 ? idade.toString() : ''}
            placeholder="Calculada automaticamente"
            placeholderTextColor={currentTheme.mutedForeground}
            editable={false}
          />
        </View>
      </View>

      {/* Sexo */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.foreground }]}>
          Sexo *
        </Text>
        <SimpleComboPicker
          selectedValue={formData.sexo}
          onValueChange={(value) => handleInputChange('sexo', value)}
          items={[
            { label: "Masculino", value: "M" },
            { label: "Feminino", value: "F" }
          ]}
          placeholder="Selecione o sexo"
        />
      </View>

      {/* Estado Civil */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.foreground }]}>
          Estado Civil
        </Text>
        <SimpleComboPicker
          selectedValue={formData.estadoCivil}
          onValueChange={(value) => handleInputChange('estadoCivil', value)}
          items={ESTADO_CIVIL_OPTIONS.map(option => ({
            label: option.label,
            value: option.value
          }))}
          placeholder="Selecione o estado civil"
        />
      </View>

      {/* Email e Telefone */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={[styles.label, { color: currentTheme.foreground }]}>
            Email
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: currentTheme.border, 
              color: currentTheme.foreground 
            }]}
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            placeholder="email@exemplo.com"
            placeholderTextColor={currentTheme.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={[styles.label, { color: currentTheme.foreground }]}>
            Telefone
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: currentTheme.border, 
              color: currentTheme.foreground 
            }]}
            value={formData.telefone}
            onChangeText={(text) => handleInputChange('telefone', formatPhone(text))}
            placeholder="(00) 00000-0000"
            placeholderTextColor={currentTheme.mutedForeground}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </View>
      </View>

      {/* Seção Endereço */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentTheme.foreground }]}>
          Endereço
        </Text>
      </View>

      {/* CEP */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.foreground }]}>
          CEP *
        </Text>
        <View style={styles.cepRow}>
          <TextInput
            style={[styles.cepInput, { 
              borderColor: currentTheme.border, 
              color: currentTheme.foreground,
              backgroundColor: currentTheme.background
            }]}
            value={formData.cep}
            onChangeText={(text) => handleInputChange('cep', formatCEP(text))}
            placeholder="00000-000"
            placeholderTextColor={currentTheme.mutedForeground}
            keyboardType="numeric"
            maxLength={9}
          />
          <TouchableOpacity
            style={[
              styles.buscarButton,
              loadingCEP && styles.buscarButtonDisabled,
            ]}
            onPress={buscarCEP}
            disabled={loadingCEP}
          >
            {loadingCEP ? (
              <ActivityIndicator size="small" color="#374151" />
            ) : (
              <Text style={styles.buscarButtonText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Logradouro e Número */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
          <Text style={[styles.label, { color: currentTheme.foreground }]}>
            Logradouro *
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: currentTheme.border, 
              color: currentTheme.foreground 
            }]}
            value={formData.logradouro}
            onChangeText={(text) => handleInputChange('logradouro', text)}
            placeholder="Rua, Avenida, etc."
            placeholderTextColor={currentTheme.mutedForeground}
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={[styles.label, { color: currentTheme.foreground }]}>
            Número
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: currentTheme.border, 
              color: currentTheme.foreground 
            }]}
            value={formData.numero}
            onChangeText={(text) => handleInputChange('numero', text)}
            placeholder="123"
            placeholderTextColor={currentTheme.mutedForeground}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Complemento */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.foreground }]}>
          Complemento
        </Text>
        <TextInput
          style={[styles.input, { 
            borderColor: currentTheme.border, 
            color: currentTheme.foreground 
          }]}
          value={formData.complemento}
          onChangeText={(text) => handleInputChange('complemento', text)}
          placeholder="Apartamento, bloco, etc."
          placeholderTextColor={currentTheme.mutedForeground}
        />
      </View>

      {/* Bairro, Cidade e Estado */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={[styles.label, { color: currentTheme.foreground }]}>
            Bairro
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: currentTheme.border, 
              color: currentTheme.foreground 
            }]}
            value={formData.bairro}
            onChangeText={(text) => handleInputChange('bairro', text)}
            placeholder="Bairro"
            placeholderTextColor={currentTheme.mutedForeground}
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 4, marginRight: 4 }]}>
          <Text style={[styles.label, { color: currentTheme.foreground }]}>
            Cidade
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: currentTheme.border, 
              color: currentTheme.foreground 
            }]}
            value={formData.cidade}
            onChangeText={(text) => handleInputChange('cidade', text)}
            placeholder="Cidade"
            placeholderTextColor={currentTheme.mutedForeground}
          />
        </View>

        <View style={[styles.inputGroup, { flex: 0.5, marginLeft: 8 }]}>
          <Text style={[styles.label, { color: currentTheme.foreground }]}>
            UF
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: currentTheme.border, 
              color: currentTheme.foreground 
            }]}
            value={formData.estado}
            onChangeText={(text) => handleInputChange('estado', text.toUpperCase())}
            placeholder="SP"
            placeholderTextColor={currentTheme.mutedForeground}
            maxLength={2}
            autoCapitalize="characters"
          />
        </View>
      </View>

      {/* Observações */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: currentTheme.foreground }]}>
          Observações
        </Text>
        <TextInput
          style={[styles.input, { 
            borderColor: currentTheme.border, 
            color: currentTheme.foreground,
            height: 80
          }]}
          value={formData.observacoes}
          onChangeText={(text) => handleInputChange('observacoes', text)}
          placeholder="Observações gerais sobre o motorista"
          placeholderTextColor={currentTheme.mutedForeground}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderEscalaTrabalho = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: currentTheme.foreground }]}>
        Escala de Trabalho
      </Text>
      <Text style={[styles.label, { color: currentTheme.mutedForeground, marginTop: 16 }]}>
        Por padrão, o motorista terá escala de segunda-feira no período da manhã.
        {'\n'}Você pode editar as escalas posteriormente na tela de edição.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={currentTheme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.foreground }]}>
          {isEdit ? "Editar Motorista" : "Cadastrar Motorista"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "pessoais" && styles.activeTab,
            activeTab === "pessoais" && { borderBottomColor: "#8A9E8E" },
          ]}
          onPress={() => setActiveTab("pessoais")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "pessoais"
                    ? "#8A9E8E"
                    : currentTheme.mutedForeground,
              },
            ]}
          >
            Dados Pessoais
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "escala" && styles.activeTab,
            activeTab === "escala" && { borderBottomColor: "#8A9E8E" },
          ]}
          onPress={() => setActiveTab("escala")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "escala"
                    ? "#8A9E8E"
                    : currentTheme.mutedForeground,
              },
            ]}
          >
            Escala de Trabalho
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "pessoais" && renderDadosPessoais()}
        {activeTab === "escala" && renderEscalaTrabalho()}
      </ScrollView>

      {/* Mensagem de Feedback */}
      {message && (
        <View style={[
          styles.message,
          message.type === 'success' ? styles.successMessage : styles.errorMessage
        ]}>
          <Text style={[
            styles.messageText,
            { color: message.type === 'success' ? "#166534" : "#dc2626" }
          ]}>
            {message.text}
          </Text>
        </View>
      )}

      {/* Footer com botão de salvar */}
      <View style={[styles.footer, { borderTopColor: currentTheme.border }]}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: currentTheme.primary },
            loading && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading && <ActivityIndicator size="small" color="#fff" />}
          <Text style={styles.saveButtonText}>
            {loading ? "Salvando..." : isEdit ? "Atualizar" : "Cadastrar"}
          </Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#8A9E8E",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 44,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cepRow: {
    flexDirection: "row",
    gap: 8,
  },
  cepInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 44,
  },
  buscarButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buscarButtonDisabled: {
    backgroundColor: "#E5E7EB",
    opacity: 0.6,
  },
  buscarButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  message: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  successMessage: {
    backgroundColor: "#dcfce7",
  },
  errorMessage: {
    backgroundColor: "#fef2f2",
  },
  messageText: {
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CadastroMotoristaScreen;
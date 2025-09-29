import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, TextInput, ScrollView, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Unidade } from '../services/unidadeService';
import { theme } from '../constants/theme';

interface UnidadeFormProps {
  visible: boolean;
  unidade?: Unidade | null;
  onClose: () => void;
  onSave: (data: { 
    nome: string; 
    codigo?: string; 
    endereco?: string; 
    telefone?: string; 
    email?: string; 
    codigo_cnes?: string; 
    tipo_unidade: 'UBS' | 'ESF' | 'HOSPITAL' | 'CLINICA' | 'CENTRO_ESPECIALIDADES' | 'OUTROS'; 
    ativa?: boolean 
  }) => Promise<void>;
}

const tiposUnidade = [
  { label: 'UBS - Unidade Básica de Saúde', value: 'UBS' },
  { label: 'ESF - Estratégia Saúde da Família', value: 'ESF' },
  { label: 'Hospital', value: 'HOSPITAL' },
  { label: 'Clínica', value: 'CLINICA' },
  { label: 'Centro de Especialidades', value: 'CENTRO_ESPECIALIDADES' },
  { label: 'Outros', value: 'OUTROS' },
];

export const UnidadeForm: React.FC<UnidadeFormProps> = ({
  visible,
  unidade,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    endereco: '',
    telefone: '',
    email: '',
    codigo_cnes: '',
    tipo_unidade: 'UBS' as 'UBS' | 'ESF' | 'HOSPITAL' | 'CLINICA' | 'CENTRO_ESPECIALIDADES' | 'OUTROS',
    ativa: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTipoUnidadeModal, setShowTipoUnidadeModal] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Preencher formulário quando unidade for selecionada
  useEffect(() => {
    if (unidade) {
      setFormData({
        nome: unidade.nome || '',
        codigo: '',
        endereco: unidade.endereco || '',
        telefone: unidade.telefone || '',
        email: unidade.email || '',
        codigo_cnes: unidade.codigo_cnes || '',
        tipo_unidade: unidade.tipo_unidade || 'UBS',
        ativa: unidade.ativa !== undefined ? unidade.ativa : true,
      });
    } else {
      // Limpar formulário para nova unidade
      setFormData({
        nome: '',
        codigo: '',
        endereco: '',
        telefone: '',
        email: '',
        codigo_cnes: '',
        tipo_unidade: 'UBS',
        ativa: true,
      });
    }
    setErrors({});
  }, [unidade, visible]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.tipo_unidade) {
      newErrors.tipo_unidade = 'Tipo de unidade é obrigatório';
    }

    // Validação de email (se preenchido)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Email deve ter um formato válido';
      }
    }

    // Validação de telefone (se preenchido)
    if (formData.telefone && formData.telefone.trim()) {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(formData.telefone.trim())) {
        newErrors.telefone = 'Telefone deve estar no formato (11) 99999-9999';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Atenção', 'Por favor, corrija os erros no formulário.');
      return;
    }

    try {
      setLoading(true);
      
      const dataToSave = {
        nome: formData.nome.trim(),
        codigo: formData.codigo.trim() || undefined,
        endereco: formData.endereco.trim() || undefined,
        telefone: formData.telefone.trim() || undefined,
        email: formData.email.trim() || undefined,
        codigo_cnes: formData.codigo_cnes.trim() || undefined,
        tipo_unidade: formData.tipo_unidade,
        ativa: formData.ativa,
      };

      await onSave(dataToSave);
      
      // Formulário será fechado pelo componente pai
    } catch (error) {
      console.error('Erro ao salvar unidade:', error);
      Alert.alert('Erro', 'Não foi possível salvar a unidade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  const formatPhone = (text: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = text.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {unidade ? 'Editar Unidade' : 'Nova Unidade'}
          </Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
            disabled={loading}
          >
            <Ionicons name="close" size={24} color={currentTheme.text} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Nome */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              Nome <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.nome ? '#ef4444' : currentTheme.border,
                  color: currentTheme.text
                }
              ]}
              value={formData.nome}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nome: text }))}
              placeholder="Digite o nome da unidade"
              placeholderTextColor={currentTheme.mutedForeground}
              editable={!loading}
            />
            {errors.nome && (
              <Text style={styles.errorText}>{errors.nome}</Text>
            )}
          </View>

          {/* Código */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Código</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.codigo ? '#ef4444' : currentTheme.border,
                  color: currentTheme.text
                }
              ]}
              value={formData.codigo}
              onChangeText={(text) => setFormData(prev => ({ ...prev, codigo: text }))}
              placeholder="Digite o código da unidade"
              placeholderTextColor={currentTheme.mutedForeground}
              editable={!loading}
            />
            {errors.codigo && (
              <Text style={styles.errorText}>{errors.codigo}</Text>
            )}
          </View>

          {/* Tipo de Unidade */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              Tipo de Unidade <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.tipo_unidade ? '#ef4444' : currentTheme.border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }
              ]}
              onPress={() => !loading && setShowTipoUnidadeModal(true)}
              disabled={loading}
            >
              <Text style={[
                { color: formData.tipo_unidade ? currentTheme.text : currentTheme.mutedForeground }
              ]}>
                {tiposUnidade.find(t => t.value === formData.tipo_unidade)?.label || 'Selecione o tipo de unidade'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={currentTheme.mutedForeground} />
            </TouchableOpacity>
            {errors.tipo_unidade && (
              <Text style={styles.errorText}>{errors.tipo_unidade}</Text>
            )}
          </View>

          {/* Endereço */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Endereço</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.endereco ? '#ef4444' : currentTheme.border,
                  color: currentTheme.text
                }
              ]}
              value={formData.endereco}
              onChangeText={(text) => setFormData(prev => ({ ...prev, endereco: text }))}
              placeholder="Digite o endereço da unidade"
              placeholderTextColor={currentTheme.mutedForeground}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Telefone */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Telefone</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.telefone ? '#ef4444' : currentTheme.border,
                  color: currentTheme.text
                }
              ]}
              value={formData.telefone}
              onChangeText={handlePhoneChange}
              placeholder="(11) 99999-9999"
              placeholderTextColor={currentTheme.mutedForeground}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!loading}
            />
            {errors.telefone && (
              <Text style={styles.errorText}>{errors.telefone}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.email ? '#ef4444' : currentTheme.border,
                  color: currentTheme.text
                }
              ]}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="email@exemplo.com"
              placeholderTextColor={currentTheme.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Código CNES */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Código CNES</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.codigo_cnes ? '#ef4444' : currentTheme.border,
                  color: currentTheme.text
                }
              ]}
              value={formData.codigo_cnes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, codigo_cnes: text }))}
              placeholder="Digite o código CNES"
              placeholderTextColor={currentTheme.mutedForeground}
              editable={!loading}
            />
          </View>

          {/* Status Ativa */}
          <View style={styles.field}>
            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: currentTheme.text }]}>Unidade Ativa</Text>
              <Switch
                value={formData.ativa}
                onValueChange={(value) => setFormData(prev => ({ ...prev, ativa: value }))}
                disabled={loading}
                trackColor={{ false: currentTheme.muted, true: '#8A9E8E' }}
                thumbColor={formData.ativa ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: currentTheme.border }]}>
          <TouchableOpacity 
            style={[styles.cancelButton, { backgroundColor: currentTheme.muted }]}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={[styles.cancelButtonText, { color: currentTheme.text }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.saveButton,
              { opacity: loading ? 0.6 : 1 }
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Seleção de Tipo de Unidade */}
      <Modal
        visible={showTipoUnidadeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTipoUnidadeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTipoUnidadeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Selecionar Tipo de Unidade
            </Text>
            {tiposUnidade.map((tipo) => (
              <TouchableOpacity
                key={tipo.value}
                style={styles.modalOption}
                onPress={() => {
                  setFormData(prev => ({ ...prev, tipo_unidade: tipo.value as 'UBS' | 'ESF' | 'HOSPITAL' | 'CLINICA' | 'CENTRO_ESPECIALIDADES' | 'OUTROS' }));
                  setShowTipoUnidadeModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: currentTheme.text }]}>
                  {tipo.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#8A9E8E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: 300,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
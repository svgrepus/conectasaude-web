import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Dropdown } from './Dropdown';
import { 
  Veiculo, 
  VeiculoFormData, 
  TIPOS_COMBUSTIVEL, 
  SITUACOES_VEICULO,
  TIPOS_VEICULO,
  veiculosService 
} from '../services/veiculosService';

interface VeiculoFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (veiculo: VeiculoFormData) => Promise<void>;
  veiculo?: Veiculo | null;
  externalError?: string;
}

export const VeiculoForm: React.FC<VeiculoFormProps> = ({
  visible,
  onClose,
  onSave,
  veiculo,
  externalError
}) => {
  const [formData, setFormData] = useState<VeiculoFormData>({
    marca: '',
    modelo: '',
    ano_fabricacao: new Date().getFullYear(),
    placa: '',
    capacidade_passageiros: 1,
    tipo_combustivel: 'GASOLINA',
    autonomia_combustivel: undefined,
    situacao: 'ATIVO',
    tipo_veiculo: undefined,
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [autonomiaText, setAutonomiaText] = useState<string>('');

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (veiculo) {
      setFormData({
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano_fabricacao: veiculo.ano_fabricacao,
        placa: veiculo.placa,
        capacidade_passageiros: veiculo.capacidade_passageiros,
        tipo_combustivel: veiculo.tipo_combustivel,
        autonomia_combustivel: veiculo.autonomia_combustivel,
        situacao: veiculo.situacao,
        tipo_veiculo: veiculo.tipo_veiculo || undefined,
        observacoes: veiculo.observacoes || ''
      });
      setAutonomiaText(veiculo.autonomia_combustivel?.toString() || '');
    } else {
      // Reset form for new vehicle
      setFormData({
        marca: '',
        modelo: '',
        ano_fabricacao: currentYear,
        placa: '',
        capacidade_passageiros: 1,
        tipo_combustivel: 'GASOLINA',
        autonomia_combustivel: undefined,
        situacao: 'ATIVO',
        tipo_veiculo: undefined,
        observacoes: ''
      });
      setAutonomiaText('');
    }
    setErrors({});
  }, [veiculo, visible, currentYear]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Marca
    if (!formData.marca.trim()) {
      newErrors.marca = 'Marca é obrigatória';
    }

    // Modelo
    if (!formData.modelo.trim()) {
      newErrors.modelo = 'Modelo é obrigatório';
    }

    // Placa
    if (!formData.placa.trim()) {
      newErrors.placa = 'Placa é obrigatória';
    } else if (!veiculosService.validarPlaca(formData.placa)) {
      newErrors.placa = 'Formato de placa inválido. Use ABC-1234 ou ABC1A23';
    }

    // Ano de fabricação
    if (!veiculosService.validarAno(formData.ano_fabricacao)) {
      newErrors.ano_fabricacao = `Ano deve estar entre 1980 e ${currentYear}`;
    }

    // Capacidade de passageiros
    if (!formData.capacidade_passageiros || formData.capacidade_passageiros < 1) {
      newErrors.capacidade_passageiros = 'Capacidade de passageiros é obrigatória e deve ser maior que zero';
    }

    // Tipo de combustível
    if (!formData.tipo_combustivel) {
      newErrors.tipo_combustivel = 'Tipo de combustível é obrigatório';
    }

    // Situação
    if (!formData.situacao) {
      newErrors.situacao = 'Situação é obrigatória';
    }

    // Autonomia (opcional, mas se preenchida deve ser válida)
    if (formData.autonomia_combustivel !== undefined && formData.autonomia_combustivel <= 0) {
      newErrors.autonomia_combustivel = 'Autonomia deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os campos destacados.');
      return;
    }

    setLoading(true);
    try {
      // Formatar placa antes de salvar
      const dadosFormatados = {
        ...formData,
        marca: formData.marca.trim().toUpperCase(),
        modelo: formData.modelo.trim(),
        placa: veiculosService.formatarPlaca(formData.placa),
        observacoes: formData.observacoes?.trim() || undefined
      };

      await onSave(dadosFormatados);
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      // Não mostrar Alert aqui, o erro será exibido via externalError
    } finally {
      setLoading(false);
    }
  };

  const handlePlacaChange = (text: string) => {
    // Remove apenas caracteres especiais, mantém letras (maiúsculas e minúsculas) e números
    const cleanText = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setFormData(prev => ({ ...prev, placa: cleanText }));
    
    // Remove erro da placa se estiver sendo corrigido
    if (errors.placa) {
      setErrors(prev => ({ ...prev, placa: '' }));
    }
  };

  const handleNumericChange = (field: keyof VeiculoFormData, text: string) => {
    const numericValue = parseInt(text) || 0;
    setFormData(prev => ({ ...prev, [field]: numericValue }));
    
    // Remove erro do campo se estiver sendo corrigido
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAutonomiaChange = (text: string) => {
    // Permite apenas números, ponto e vírgula
    const cleanText = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    
    // Atualiza o texto exibido
    setAutonomiaText(cleanText);
    
    // Atualiza o valor numérico no formData
    if (cleanText === '') {
      setFormData(prev => ({ ...prev, autonomia_combustivel: undefined }));
    } else {
      const decimalValue = parseFloat(cleanText);
      if (!isNaN(decimalValue)) {
        setFormData(prev => ({ ...prev, autonomia_combustivel: decimalValue }));
      }
    }
    
    // Remove erro do campo se estiver sendo corrigido
    if (errors.autonomia_combustivel) {
      setErrors(prev => ({ ...prev, autonomia_combustivel: '' }));
    }
  };

  const handleDecimalChange = (field: keyof VeiculoFormData, text: string) => {
    // Permite apenas números, ponto e vírgula
    const cleanText = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    
    // Se o texto está vazio, define como undefined
    if (cleanText === '') {
      setFormData(prev => ({ ...prev, [field]: undefined }));
    } else {
      // Permite valores parciais como "12." enquanto o usuário digita
      const decimalValue = parseFloat(cleanText);
      if (!isNaN(decimalValue)) {
        setFormData(prev => ({ ...prev, [field]: decimalValue }));
      } else if (cleanText.endsWith('.') && cleanText.slice(0, -1) !== '') {
        // Se termina com ponto e tem números antes, mantém o número base
        const baseValue = parseFloat(cleanText.slice(0, -1));
        if (!isNaN(baseValue)) {
          setFormData(prev => ({ ...prev, [field]: baseValue }));
        }
      }
    }
    
    // Remove erro do campo se estiver sendo corrigido
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {veiculo ? 'Editar Veículo' : 'Novo Veículo'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.light.text} />
            </TouchableOpacity>
          </View>

          {/* Erro Externo */}
          {externalError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#dc2626" />
              <Text style={styles.externalErrorText}>{externalError}</Text>
            </View>
          )}

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Marca */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Marca *</Text>
              <TextInput
                style={[styles.input, errors.marca ? styles.inputError : null]}
                value={formData.marca}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, marca: text }));
                  if (errors.marca) setErrors(prev => ({ ...prev, marca: '' }));
                }}
                placeholder="Ex: Fiat, Volkswagen"
                placeholderTextColor={theme.light.mutedForeground}
                autoCapitalize="characters"
              />
              {errors.marca && <Text style={styles.errorText}>{errors.marca}</Text>}
            </View>

            {/* Modelo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Modelo *</Text>
              <TextInput
                style={[styles.input, errors.modelo ? styles.inputError : null]}
                value={formData.modelo}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, modelo: text }));
                  if (errors.modelo) setErrors(prev => ({ ...prev, modelo: '' }));
                }}
                placeholder="Ex: Uno, Kombi"
                placeholderTextColor={theme.light.mutedForeground}
              />
              {errors.modelo && <Text style={styles.errorText}>{errors.modelo}</Text>}
            </View>

            {/* Ano de Fabricação */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ano de Fabricação *</Text>
              <TextInput
                style={[styles.input, errors.ano_fabricacao ? styles.inputError : null]}
                value={formData.ano_fabricacao.toString()}
                onChangeText={(text) => handleNumericChange('ano_fabricacao', text)}
                placeholder={`Ex: ${currentYear}`}
                placeholderTextColor={theme.light.mutedForeground}
                keyboardType="numeric"
                maxLength={4}
              />
              {errors.ano_fabricacao && <Text style={styles.errorText}>{errors.ano_fabricacao}</Text>}
            </View>

            {/* Placa */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Placa *</Text>
              <TextInput
                style={[styles.input, errors.placa ? styles.inputError : null]}
                value={formData.placa}
                onChangeText={handlePlacaChange}
                placeholder="ABC-1234 ou ABC1A23"
                placeholderTextColor={theme.light.mutedForeground}
                autoCapitalize="characters"
                maxLength={8}
              />
              {errors.placa && <Text style={styles.errorText}>{errors.placa}</Text>}
              <Text style={styles.helperText}>
                Formatos aceitos: ABC-1234 (padrão) ou ABC1A23 (Mercosul)
              </Text>
            </View>

            {/* Capacidade de Passageiros */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Capacidade de Passageiros *</Text>
              <TextInput
                style={[styles.input, errors.capacidade_passageiros ? styles.inputError : null]}
                value={formData.capacidade_passageiros?.toString() || ''}
                onChangeText={(text) => handleNumericChange('capacidade_passageiros', text)}
                placeholder="Ex: 5"
                placeholderTextColor={theme.light.mutedForeground}
                keyboardType="numeric"
              />
              {errors.capacidade_passageiros && <Text style={styles.errorText}>{errors.capacidade_passageiros}</Text>}
            </View>

            {/* Tipo de Combustível */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de Combustível *</Text>
              <Dropdown
                items={TIPOS_COMBUSTIVEL.map(item => ({ label: item.label, value: item.value }))}
                selectedValue={formData.tipo_combustivel}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, tipo_combustivel: value as any }))}
                placeholder="Selecione o combustível"
              />
            </View>

            {/* Autonomia de Combustível */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Autonomia de Combustível (km/l)</Text>
              <TextInput
                style={[styles.input, errors.autonomia_combustivel ? styles.inputError : null]}
                value={autonomiaText}
                onChangeText={handleAutonomiaChange}
                placeholder="Ex: 12.5"
                placeholderTextColor={theme.light.mutedForeground}
                keyboardType="decimal-pad"
              />
              {errors.autonomia_combustivel && <Text style={styles.errorText}>{errors.autonomia_combustivel}</Text>}
              <Text style={styles.helperText}>
                Quilometragem aproximada com tanque cheio (opcional)
              </Text>
            </View>

            {/* Situação */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Situação *</Text>
              <Dropdown
                items={SITUACOES_VEICULO.map(item => ({ label: item.label, value: item.value }))}
                selectedValue={formData.situacao}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, situacao: value as any }))}
                placeholder="Selecione a situação"
              />
            </View>

            {/* Tipo de Veículo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de Veículo</Text>
              <Dropdown
                items={TIPOS_VEICULO.map(item => ({ label: item.label, value: item.value }))}
                selectedValue={formData.tipo_veiculo || ''}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, tipo_veiculo: value || undefined }))}
                placeholder="Selecione o tipo de veículo"
              />
              <Text style={styles.helperText}>
                Classifique o veículo conforme sua categoria de uso
              </Text>
            </View>

            {/* Observações */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Observações</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.observacoes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, observacoes: text }))}
                placeholder="Observações adicionais sobre o veículo"
                placeholderTextColor={theme.light.mutedForeground}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: theme.light.background,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.light.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.light.text,
    backgroundColor: theme.light.background,
  },
  inputError: {
    borderColor: theme.light.destructive,
  },
  textArea: {
    height: 80,
  },
  errorText: {
    fontSize: 12,
    color: theme.light.destructive,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: theme.light.mutedForeground,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.light.border,
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.light.border,
  },
  cancelButtonText: {
    color: theme.light.mutedForeground,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: theme.light.primary,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    gap: 8,
  },
  externalErrorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
});
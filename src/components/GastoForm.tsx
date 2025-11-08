import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { DatePicker } from './DatePicker';
import { Dropdown } from './Dropdown';
import { 
  VeiculoGasto, 
  GastoFormData, 
  FORMAS_PAGAMENTO,
  veiculosService 
} from '../services/veiculosService';

interface GastoFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (gasto: GastoFormData) => Promise<void>;
  gasto?: VeiculoGasto | null;
  veiculoId: string;
}

export const GastoForm: React.FC<GastoFormProps> = ({
  visible,
  onClose,
  onSave,
  gasto,
  veiculoId
}) => {
  const [formData, setFormData] = useState<GastoFormData>({
    veiculo_id: veiculoId,
    data_gasto: '',
    descricao: '',
    fornecedor: '',
    quantidade: 1,
    valor_unitario: 0,
    forma_pagamento: 'DINHEIRO',
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gasto) {
      setFormData({
        veiculo_id: veiculoId,
        data_gasto: gasto.data_gasto,
        descricao: gasto.descricao,
        fornecedor: gasto.fornecedor,
        quantidade: gasto.quantidade,
        valor_unitario: gasto.valor_unitario,
        forma_pagamento: gasto.forma_pagamento,
        observacoes: gasto.observacoes || ''
      });
    } else {
      // Reset form for new expense
      setFormData({
        veiculo_id: veiculoId,
        data_gasto: new Date().toISOString().split('T')[0], // Data atual
        descricao: '',
        fornecedor: '',
        quantidade: 1,
        valor_unitario: 0,
        forma_pagamento: 'DINHEIRO',
        observacoes: ''
      });
    }
    setErrors({});
  }, [gasto, visible, veiculoId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Data do gasto
    if (!formData.data_gasto) {
      newErrors.data_gasto = 'Data do gasto é obrigatória';
    } else if (!veiculosService.validarDataGasto(formData.data_gasto)) {
      newErrors.data_gasto = 'Data do gasto não pode ser futura';
    }

    // Descrição
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    // Fornecedor
    if (!formData.fornecedor.trim()) {
      newErrors.fornecedor = 'Fornecedor é obrigatório';
    }

    // Quantidade
    if (!veiculosService.validarQuantidade(formData.quantidade)) {
      newErrors.quantidade = 'Quantidade deve ser maior ou igual a 1';
    }

    // Valor unitário
    if (!veiculosService.validarValor(formData.valor_unitario)) {
      newErrors.valor_unitario = 'Valor unitário deve ser maior ou igual a R$ 0,01';
    }

    // Forma de pagamento
    if (!formData.forma_pagamento) {
      newErrors.forma_pagamento = 'Forma de pagamento é obrigatória';
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
      // Formatar dados antes de salvar
      const dadosFormatados = {
        ...formData,
        descricao: formData.descricao.trim(),
        fornecedor: formData.fornecedor.trim(),
        observacoes: formData.observacoes?.trim() || undefined
      };

      await onSave(dadosFormatados);
    } catch (error) {
      console.error('Erro ao salvar gasto:', error);
      Alert.alert('Erro', 'Erro ao salvar gasto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleNumericChange = (field: keyof GastoFormData, text: string) => {
    const numericValue = parseFloat(text) || 0;
    setFormData(prev => ({ ...prev, [field]: numericValue }));
    
    // Remove erro do campo se estiver sendo corrigido
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIntegerChange = (field: keyof GastoFormData, text: string) => {
    const intValue = parseInt(text) || 0;
    setFormData(prev => ({ ...prev, [field]: intValue }));
    
    // Remove erro do campo se estiver sendo corrigido
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Calcular valor total
  const valorTotal = formData.quantidade * formData.valor_unitario;

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {gasto ? 'Editar Gasto' : 'Novo Gasto'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Data do Gasto */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Data do Gasto *</Text>
              <DatePicker
                value={formData.data_gasto}
                onDateChange={(date) => {
                  setFormData(prev => ({ ...prev, data_gasto: date }));
                  if (errors.data_gasto) setErrors(prev => ({ ...prev, data_gasto: '' }));
                }}
                placeholder="DD/MM/AAAA"
                error={errors.data_gasto}
              />
            </View>

            {/* Descrição */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={[styles.input, errors.descricao ? styles.inputError : null]}
                value={formData.descricao}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, descricao: text }));
                  if (errors.descricao) setErrors(prev => ({ ...prev, descricao: '' }));
                }}
                placeholder="Ex: Combustível, Óleo, Pneus"
                placeholderTextColor={theme.light.mutedForeground}
              />
              {errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}
            </View>

            {/* Fornecedor */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fornecedor *</Text>
              <TextInput
                style={[styles.input, errors.fornecedor ? styles.inputError : null]}
                value={formData.fornecedor}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, fornecedor: text }));
                  if (errors.fornecedor) setErrors(prev => ({ ...prev, fornecedor: '' }));
                }}
                placeholder="Nome do fornecedor ou posto"
                placeholderTextColor={theme.light.mutedForeground}
              />
              {errors.fornecedor && <Text style={styles.errorText}>{errors.fornecedor}</Text>}
            </View>

            {/* Quantidade */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantidade *</Text>
              <TextInput
                style={[styles.input, errors.quantidade ? styles.inputError : null]}
                value={formData.quantidade.toString()}
                onChangeText={(text) => handleIntegerChange('quantidade', text)}
                placeholder="Ex: 1"
                placeholderTextColor={theme.light.mutedForeground}
                keyboardType="numeric"
              />
              {errors.quantidade && <Text style={styles.errorText}>{errors.quantidade}</Text>}
            </View>

            {/* Valor Unitário */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Valor Unitário (R$) *</Text>
              <TextInput
                style={[styles.input, errors.valor_unitario ? styles.inputError : null]}
                value={formData.valor_unitario.toString()}
                onChangeText={(text) => handleNumericChange('valor_unitario', text)}
                placeholder="0,00"
                placeholderTextColor={theme.light.mutedForeground}
                keyboardType="decimal-pad"
              />
              {errors.valor_unitario && <Text style={styles.errorText}>{errors.valor_unitario}</Text>}
            </View>

            {/* Valor Total (calculado) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Valor Total</Text>
              <View style={[styles.input, styles.inputReadonly]}>
                <Text style={styles.valorTotalText}>
                  {veiculosService.formatarMoeda(valorTotal)}
                </Text>
              </View>
              <Text style={styles.helperText}>
                Calculado automaticamente: {formData.quantidade} × {veiculosService.formatarMoeda(formData.valor_unitario)}
              </Text>
            </View>

            {/* Forma de Pagamento */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Forma de Pagamento *</Text>
              <Dropdown
                items={FORMAS_PAGAMENTO.map(item => ({ label: item.label, value: item.value }))}
                selectedValue={formData.forma_pagamento}
                onValueChange={(value: string) => {
                  setFormData(prev => ({ ...prev, forma_pagamento: value as any }));
                  if (errors.forma_pagamento) setErrors(prev => ({ ...prev, forma_pagamento: '' }));
                }}
                placeholder="Selecione a forma de pagamento"
              />
              {errors.forma_pagamento && <Text style={styles.errorText}>{errors.forma_pagamento}</Text>}
            </View>

            {/* Observações */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Observações</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.observacoes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, observacoes: text }))}
                placeholder="Observações adicionais sobre o gasto"
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
  inputReadonly: {
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
  },
  valorTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.light.text,
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
});
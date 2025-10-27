import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { Medicamento } from '../services/medicamentosService';
import { Dropdown } from './Dropdown';
import SimpleCombo from './SimpleCombo';
import { farmacoUnidadesMedidaService, FarmacoUnidadeMedida } from '../services/farmacoUnidadesMedidaService';
import { stockControlUnitsService, StockControlUnit } from '../services/stockControlUnitsService';
import { formatBirthDate, validateBirthDate } from '../utils';

interface FieldErrors {
  [key: string]: string;
}

// Funções de formatação de moeda e número
const formatCurrency = (valor: string): string => {
  // Remove todos os caracteres não numéricos
  const numeros = valor.replace(/[^\d]/g, '');
  // Limita para valores razoáveis de moeda (máx 999999.99)
  const limitado = numeros.substring(0, 8);
  if (limitado.length === 0) return '';
  // Converte para centavos
  const centavos = parseInt(limitado);
  // Formata como moeda
  return (centavos / 100).toFixed(2);
};

const formatNumber = (valor: string): string => {
  // Remove todos os caracteres não numéricos
  const numeros = valor.replace(/[^\d]/g, '');
  // Limita para números razoáveis (máx 999999)
  return numeros.substring(0, 6);
};

const formatExpiryDate = (input: string): string => {
  // Usa a mesma formatação de data de nascimento
  return formatBirthDate(input);
};

const validateExpiryDate = (dateString: string): boolean => {
  if (!dateString) return false;
  // Verifica formato dd/MM/yyyy
  const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(datePattern);
  if (!match) return false;
  const [, day, month, year] = match;
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  // Verifica intervalos válidos
  if (monthNum < 1 || monthNum > 12) return false;
  if (dayNum < 1 || dayNum > 31) return false;
  if (yearNum < new Date().getFullYear() || yearNum > 2050) return false;
  // Cria data e verifica se é válida
  const date = new Date(yearNum, monthNum - 1, dayNum);
  if (date.getDate() !== dayNum || 
      date.getMonth() !== monthNum - 1 || 
      date.getFullYear() !== yearNum) {
    return false;
  }
  // Verifica se a data está no futuro (validade não pode ser no passado)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Início de hoje
  return date >= today;
};

interface MedicamentoFormProps {
  onSubmit: (medicamento: Omit<Medicamento, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Medicamento | null;
}

export const MedicamentoForm: React.FC<MedicamentoFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState({
    nome_dcb: '',
    nome_dci: '',
    forca_valor: '',
    forca_unidade_id: '',
    unidade_controle_id: '',
    codigo_interno: '',
    status: 'ATIVO' as 'ATIVO' | 'INATIVO',
    obsoleto: false,
    validade: '',
    custo: '',
    valor_repasse: '',
    local_armazenamento: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);
  const [unidadesMedida, setUnidadesMedida] = useState<FarmacoUnidadeMedida[]>([]);
  const [unidadesControle, setUnidadesControle] = useState<StockControlUnit[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Funções de validação
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    // Validações obrigatórias
    if (!formData.nome_dcb.trim()) {
      errors.nome_dcb = 'Nome DCB é obrigatório';
    }

    // Nome DCI não é obrigatório
    
    if (!formData.validade.trim()) {
      errors.validade = 'Data de validade é obrigatória';
    } else if (!validateExpiryDate(formData.validade)) {
      errors.validade = 'Data de validade inválida ou vencida';
    }

    if (!formData.forca_valor.trim()) {
      errors.forca_valor = 'Força (valor) é obrigatório';
    } else if (!/^[0-9.,]+$/.test(formData.forca_valor)) {
      errors.forca_valor = 'Força (valor) deve conter apenas números';
    } else if (isNaN(parseFloat(formData.forca_valor)) || parseFloat(formData.forca_valor) <= 0) {
      errors.forca_valor = 'Força (valor) deve ser um número válido maior que zero';
    }

    if (!formData.forca_unidade_id) {
      errors.forca_unidade_id = 'Unidade de medida da força é obrigatória';
    }

    if (!formData.unidade_controle_id) {
      errors.unidade_controle_id = 'Unidade de controle é obrigatória';
    }

    if (!formData.codigo_interno.trim()) {
      errors.codigo_interno = 'Código interno é obrigatório';
    }

    if (!formData.custo.trim()) {
      errors.custo = 'Custo é obrigatório';
    } else if (!/^[0-9.,]+$/.test(formData.custo)) {
      errors.custo = 'Custo deve conter apenas números';
    } else if (isNaN(parseFloat(formData.custo)) || parseFloat(formData.custo) <= 0) {
      errors.custo = 'Custo deve ser um número válido maior que zero';
    }

    if (!formData.valor_repasse.trim()) {
      errors.valor_repasse = 'Valor de repasse é obrigatório';
    } else if (!/^[0-9.,]+$/.test(formData.valor_repasse)) {
      errors.valor_repasse = 'Valor de repasse deve conter apenas números';
    } else if (isNaN(parseFloat(formData.valor_repasse)) || parseFloat(formData.valor_repasse) <= 0) {
      errors.valor_repasse = 'Valor de repasse deve ser um número válido maior que zero';
    }

    if (!formData.local_armazenamento.trim()) {
      errors.local_armazenamento = 'Local de armazenamento é obrigatório';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Limpa erro de campo
  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Estilo do campo com erro
  const getFieldStyle = (fieldName: string, baseStyle: any) => {
    return fieldErrors[fieldName] 
      ? [baseStyle, { borderColor: '#ff4444', borderWidth: 1 }]
      : baseStyle;
  };

  // Componente de erro de campo
  const FieldError: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <Text style={{ color: '#ff4444', fontSize: 12, marginTop: 2 }}>{error}</Text>
    );
  };

  // Carregar unidades de medida e unidades de controle
  useEffect(() => {
    const loadUnidades = async () => {
      try {
        setLoadingUnidades(true);
        
        // Carregar unidades de medida (para força)
        const unidades = await farmacoUnidadesMedidaService.getAll();
        console.log('🔍 MedicamentoForm: Unidades de medida carregadas:', unidades);
        setUnidadesMedida(unidades);
        
        // Carregar unidades de controle
        const unidadesControle = await stockControlUnitsService.getAll();
        console.log('🔍 MedicamentoForm: Unidades de controle carregadas:', unidadesControle);
        setUnidadesControle(unidadesControle);
        
      } catch (error) {
        console.error('❌ Erro ao carregar unidades:', error);
        Alert.alert('Erro', 'Erro ao carregar unidades. Tente novamente.');
      } finally {
        setLoadingUnidades(false);
      }
    };

    loadUnidades();
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (initialData) {
      console.log('🔍 MedicamentoForm: Dados iniciais recebidos:', initialData);
      
      setFormData({
        nome_dcb: initialData.nome_dcb || '',
        nome_dci: initialData.nome_dci || '',
        forca_valor: initialData.forca_valor?.toString() || '',
        forca_unidade_id: initialData.forca_unidade_id || '',
        unidade_controle_id: initialData.unidade_controle_id || '',
        codigo_interno: initialData.codigo_interno || '',
        status: initialData.status || 'ATIVO',
        obsoleto: initialData.obsoleto || false,
        validade: convertDateFromISO(initialData.validade || ''),
        custo: initialData.custo?.toString() || '',
        valor_repasse: initialData.valor_repasse?.toString() || '',
        local_armazenamento: initialData.local_armazenamento || '',
        observacoes: initialData.observacoes || '',
      });
    } else {
      setFormData({
        nome_dcb: '',
        nome_dci: '',
        forca_valor: '',
        forca_unidade_id: '',
        unidade_controle_id: '',
        codigo_interno: '',
        status: 'ATIVO',
        obsoleto: false,
        validade: '',
        custo: '',
        valor_repasse: '',
        local_armazenamento: '',
        observacoes: '',
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    // Limpa erros anteriores
    setFieldErrors({});
    
    // Valida formulário
    if (!validateForm()) {
      Alert.alert('Erro de Validação', 'Por favor, corrija os campos destacados em vermelho.');
      return;
    }

    try {
      setLoading(true);
      
      const medicamentoData = {
        nome_dcb: formData.nome_dcb.trim() || undefined,
        nome_dci: formData.nome_dci.trim() || undefined,
        forca_valor: formData.forca_valor ? parseFloat(formData.forca_valor) : undefined,
        forca_unidade_id: formData.forca_unidade_id || undefined,
        unidade_controle_id: formData.unidade_controle_id,
        codigo_interno: formData.codigo_interno.trim() || undefined,
        status: formData.status,
        obsoleto: formData.obsoleto,
        validade: convertDateToISO(formData.validade),
        custo: formData.custo ? parseFloat(formData.custo) : undefined,
        valor_repasse: formData.valor_repasse ? parseFloat(formData.valor_repasse) : undefined,
        local_armazenamento: formData.local_armazenamento.trim() || undefined,
        observacoes: formData.observacoes.trim() || undefined,
      };
      
      await onSubmit(medicamentoData);
    } catch (error: any) {
      console.error('Erro ao salvar medicamento:', error);
      
      // Tratamento específico para diferentes tipos de erro
      let errorMessage = 'Erro ao salvar medicamento. Tente novamente.';
      
      if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
        if (error?.message?.includes('codigo_interno')) {
          errorMessage = 'Código interno já existe. Por favor, use um código diferente.';
        } else {
          errorMessage = 'Já existe um medicamento com esses dados. Verifique os campos únicos.';
        }
      } else if (error?.code === '22008' || error?.message?.includes('date/time field value out of range')) {
        errorMessage = 'Data de validade inválida. Verifique o formato da data.';
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      Alert.alert('Erro ao Salvar', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Converte data do formato brasileiro (dd/MM/yyyy) para ISO (yyyy-MM-dd)
  const convertDateToISO = (dateString: string): string => {
    if (!dateString) return '';
    
    // Verifica se está no formato dd/MM/yyyy
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(datePattern);
    
    if (!match) return dateString; // Retorna como está se não for o formato esperado
    
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Converte data do formato ISO (yyyy-MM-dd) para brasileiro (dd/MM/yyyy)
  const convertDateFromISO = (dateString: string): string => {
    if (!dateString) return '';
    
    // Verifica se está no formato yyyy-MM-dd
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(datePattern);
    
    if (!match) return dateString; // Retorna como está se não for o formato esperado
    
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  };

  // Gera sugestão de código interno no formato MED00 + número
  const generateCodigoSuggestion = (): string => {
    // Usa timestamp para garantir unicidade
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos do timestamp
    return `MED00${timestamp}`;
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {/* Nome DCB */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nome DCB *</Text>
          <TextInput
            style={getFieldStyle('nome_dcb', styles.input)}
            value={formData.nome_dcb}
            onChangeText={(value: string) => {
              updateField('nome_dcb', value);
              clearFieldError('nome_dcb');
            }}
            placeholder="Digite o nome DCB"
            placeholderTextColor="#999999"
            maxLength={255}
          />
          <FieldError error={fieldErrors.nome_dcb} />
        </View>

        {/* Nome DCI */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nome DCI</Text>
          <TextInput
            style={getFieldStyle('nome_dci', styles.input)}
            value={formData.nome_dci}
            onChangeText={(value: string) => {
              updateField('nome_dci', value);
              clearFieldError('nome_dci');
            }}
            placeholder="Digite o nome DCI"
            placeholderTextColor="#999999"
            maxLength={255}
          />
          <FieldError error={fieldErrors.nome_dci} />
        </View>

        {/* Força */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Força (valor) *</Text>
            <TextInput
              style={getFieldStyle('forca_valor', styles.input)}
              value={formData.forca_valor}
              onChangeText={(value: string) => {
                // Só permite números, vírgula e ponto
                const sanitized = value.replace(/[^0-9.,]/g, '');
                updateField('forca_valor', sanitized);
                clearFieldError('forca_valor');
              }}
              placeholder="Ex: 500"
              placeholderTextColor="#999999"
              keyboardType="numeric"
              maxLength={10}
            />
            <FieldError error={fieldErrors.forca_valor} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Unidade *</Text>
            <SimpleCombo
              label=""
              placeholder="Selecione a unidade"
              value={formData.forca_unidade_id}
              options={unidadesMedida.map(unidade => ({
                id: unidade.id,
                label: unidade.sigla || unidade.nome
              }))}
              onSelect={(value) => {
                updateField('forca_unidade_id', value.toString());
                clearFieldError('forca_unidade_id');
              }}
              disabled={loadingUnidades}
            />
            <FieldError error={fieldErrors.forca_unidade_id} />
          </View>
        </View>

        {/* Unidade de Controle */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Unidade de Controle *</Text>
          <SimpleCombo
            label=""
            placeholder="Selecione a unidade de controle"
            value={formData.unidade_controle_id}
            options={unidadesControle.map(unidade => ({
              id: unidade.id,
              label: `${unidade.nome}${unidade.sigla ? ` (${unidade.sigla})` : ''}`
            }))}
            onSelect={(value) => {
              updateField('unidade_controle_id', value.toString());
              clearFieldError('unidade_controle_id');
            }}
            disabled={loadingUnidades}
          />
          <FieldError error={fieldErrors.unidade_controle_id} />
        </View>

        {/* Código Interno */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Código Interno *</Text>
          <View style={styles.inputWithButton}>
            <TextInput
              style={[getFieldStyle('codigo_interno', styles.input), { flex: 1, marginRight: 10 }]}
              value={formData.codigo_interno}
              onChangeText={(value: string) => {
                updateField('codigo_interno', value);
                clearFieldError('codigo_interno');
              }}
              placeholder="Digite o código interno (ex: MED001234)"
              placeholderTextColor="#999999"
              maxLength={50}
            />
            <TouchableOpacity 
              style={styles.suggestionButton}
              onPress={() => {
                const suggestion = generateCodigoSuggestion();
                updateField('codigo_interno', suggestion);
                clearFieldError('codigo_interno');
              }}
            >
              <Text style={styles.suggestionButtonText}>Sugerir</Text>
            </TouchableOpacity>
          </View>
          <FieldError error={fieldErrors.codigo_interno} />
        </View>

        {/* Data de Validade */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Data de Validade *</Text>
          <TextInput
            style={getFieldStyle('validade', styles.input)}
            value={formData.validade}
            onChangeText={(value: string) => {
              const formatted = formatBirthDate(value);
              updateField('validade', formatted);
              clearFieldError('validade');
            }}
            placeholder="dd/MM/yyyy"
            placeholderTextColor="#999999"
            keyboardType="numeric"
            maxLength={10}
          />
          <FieldError error={fieldErrors.validade} />
        </View>

        {/* Valores */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Custo (R$) *</Text>
            <TextInput
              style={getFieldStyle('custo', styles.input)}
              value={formData.custo}
              onChangeText={(value: string) => {
                // Só permite números, vírgula e ponto
                const sanitized = value.replace(/[^0-9.,]/g, '');
                updateField('custo', sanitized);
                clearFieldError('custo');
              }}
              placeholder="0.00"
              placeholderTextColor="#999999"
              keyboardType="numeric"
              maxLength={10}
            />
            <FieldError error={fieldErrors.custo} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Valor Repasse (R$) *</Text>
            <TextInput
              style={getFieldStyle('valor_repasse', styles.input)}
              value={formData.valor_repasse}
              onChangeText={(value: string) => {
                // Só permite números, vírgula e ponto
                const sanitized = value.replace(/[^0-9.,]/g, '');
                updateField('valor_repasse', sanitized);
                clearFieldError('valor_repasse');
              }}
              placeholder="0.00"
              placeholderTextColor="#999999"
              keyboardType="numeric"
              maxLength={10}
            />
            <FieldError error={fieldErrors.valor_repasse} />
          </View>
        </View>

        {/* Local de Armazenamento */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Local de Armazenamento *</Text>
          <TextInput
            style={getFieldStyle('local_armazenamento', styles.input)}
            value={formData.local_armazenamento}
            onChangeText={(value: string) => {
              updateField('local_armazenamento', value);
              clearFieldError('local_armazenamento');
            }}
            placeholder="Digite o local de armazenamento"
            placeholderTextColor="#999999"
            maxLength={255}
          />
          <FieldError error={fieldErrors.local_armazenamento} />
        </View>

        {/* Status e Obsoleto */}
        <View style={styles.switchContainer}>
          <View style={styles.switchItem}>
            <Text style={styles.label}>Status Ativo</Text>
            <Switch
              value={formData.status === 'ATIVO'}
              onValueChange={(value) => updateField('status', value ? 'ATIVO' : 'INATIVO')}
              thumbColor={formData.status === 'ATIVO' ? '#8A9E8E' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#8A9E8E' }}
            />
          </View>
          <View style={styles.switchItem}>
            <Text style={styles.label}>Obsoleto</Text>
            <Switch
              value={formData.obsoleto}
              onValueChange={(value) => updateField('obsoleto', value)}
              thumbColor={formData.obsoleto ? '#8A9E8E' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#8A9E8E' }}
            />
          </View>
        </View>

        {/* Observações */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.observacoes}
            onChangeText={(value) => updateField('observacoes', value)}
            placeholder="Digite observações adicionais"
            placeholderTextColor="#999999"
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  halfField: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
  },
  switchItem: {
    alignItems: 'center',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#8A9E8E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionButton: {
    backgroundColor: '#8A9E8E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});
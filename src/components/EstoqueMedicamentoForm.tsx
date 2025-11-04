import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import SimpleCombo from './SimpleCombo';
import { formatBirthDate } from '../utils';
import { MedicamentoEstoque } from '../services/medicamentosEstoqueService';
import { medicamentosService } from '../services/medicamentosService';

interface FieldErrors {
  [key: string]: string;
}

// Funções de formatação
const formatCurrency = (valor: string): string => {
  const numeros = valor.replace(/[^\d]/g, '');
  const limitado = numeros.substring(0, 8);
  if (limitado.length === 0) return '';
  const centavos = parseInt(limitado);
  return (centavos / 100).toFixed(2);
};

const formatNumber = (valor: string): string => {
  const numeros = valor.replace(/[^\d]/g, '');
  return numeros.substring(0, 10);
};

const formatDate = (input: string): string => {
  return formatBirthDate(input);
};

const validateDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(datePattern);
  if (!match) return false;
  const [, day, month, year] = match;
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  if (monthNum < 1 || monthNum > 12) return false;
  if (dayNum < 1 || dayNum > 31) return false;
  if (yearNum < 2000 || yearNum > 2050) return false;
  const date = new Date(yearNum, monthNum - 1, dayNum);
  return date.getDate() === dayNum && 
         date.getMonth() === monthNum - 1 && 
         date.getFullYear() === yearNum;
};

// Componente para mostrar erros de campo
const FieldError: React.FC<{ error?: string }> = ({ error }) => {
  if (!error) return null;
  return <Text style={styles.errorText}>{error}</Text>;
};

interface EstoqueMedicamentoFormProps {
  initialData?: MedicamentoEstoque | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const EstoqueMedicamentoForm: React.FC<EstoqueMedicamentoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    medicamento_id: '',
    lote: '',
    quantidade_atual: '',
    quantidade_minima: '',
    quantidade_maxima: '',
    localizacao: '',
    data_entrada: '',
    data_validade: '',
    fornecedor: '',
    valor_unitario: '',
    valor_total: '',
    responsavel_entrada: '',
    status_lote: 'ATIVO',
    observacoes: '',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Options para dropdowns
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  const [medicamentosFiltrados, setMedicamentosFiltrados] = useState<any[]>([]);
  const [selectedMedicamento, setSelectedMedicamento] = useState<any>(null);
  const [searchMedicamento, setSearchMedicamento] = useState('');
  const [showMedicamentoModal, setShowMedicamentoModal] = useState(false);

  // Atualizar campo do formulário
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Limpar erro de campo específico
  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Função para quando selecionar um medicamento
  const handleMedicamentoSelect = (medicamento: any) => {
    console.log('🔍 Medicamento selecionado:', medicamento);
    setSelectedMedicamento(medicamento);
    updateField('medicamento_id', medicamento.id);
    
    // Definir o texto de pesquisa
    const nomeDisplay = `${medicamento.nome_dcb || medicamento.nome_dci} - ${medicamento.codigo_interno || ''}`;
    setSearchMedicamento(nomeDisplay);
    
    clearFieldError('medicamento_id');
    setShowMedicamentoModal(false);
  };

  // Função para pesquisar medicamentos
  const handleSearchMedicamento = (searchText: string) => {
    setSearchMedicamento(searchText);
    
    if (!searchText.trim()) {
      setMedicamentosFiltrados(medicamentos);
      return;
    }
    
    const filtered = medicamentos.filter(med => {
      const nome = (med.nome_dcb || med.nome_dci || '').toLowerCase();
      const codigo = (med.codigo_interno || '').toLowerCase();
      const search = searchText.toLowerCase();
      
      return nome.includes(search) || codigo.includes(search);
    });
    
    setMedicamentosFiltrados(filtered);
    console.log('🔍 Medicamentos filtrados:', filtered.length, 'de', medicamentos.length);
  };

  // Obter estilo do campo com validação de erro
  const getFieldStyle = (field: string, baseStyle: any) => {
    return fieldErrors[field] ? [baseStyle, styles.inputError] : baseStyle;
  };

  // Carregar dados das opções
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        console.log('🔄 Carregando medicamentos...');
        
        // Carregar medicamentos
        const medicamentosData = await medicamentosService.getAll();
        console.log('📋 Medicamentos carregados:', medicamentosData.length);
        setMedicamentos(medicamentosData);
        setMedicamentosFiltrados(medicamentosData); // Inicialmente mostra todos
        
      } catch (error) {
        console.error('❌ Erro ao carregar opções:', error);
        Alert.alert('Erro', 'Erro ao carregar opções. Tente novamente.');
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (initialData) {
      console.log('🔍 EstoqueMedicamentoForm: Dados iniciais recebidos:', initialData);
      
      setIsEditing(true);
      
      // Converter data de entrada de formato ISO para formato brasileiro se necessário
      const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return '';
        // Se já está no formato brasileiro (DD/MM/YYYY), retorna como está
        if (dateStr.includes('/')) return dateStr;
        // Se está no formato ISO (YYYY-MM-DD), converte
        if (dateStr.includes('-') && dateStr.length === 10) {
          const [year, month, day] = dateStr.split('-');
          return `${day}/${month}/${year}`;
        }
        return dateStr;
      };
      
      setFormData({
        medicamento_id: initialData.medicamento_id || '',
        lote: initialData.lote || '',
        quantidade_atual: initialData.quantidade_atual?.toString() || '',
        quantidade_minima: initialData.quantidade_minima?.toString() || '',
        quantidade_maxima: initialData.quantidade_maxima?.toString() || '',
        localizacao: initialData.localizacao || '',
        data_entrada: formatDateForInput(initialData.data_entrada || ''),
        data_validade: formatDateForInput(initialData.data_validade || ''),
        fornecedor: initialData.fornecedor || '',
        valor_unitario: initialData.valor_unitario?.toString() || '',
        valor_total: initialData.valor_total?.toString() || '',
        responsavel_entrada: initialData.responsavel_entrada || '',
        status_lote: initialData.status_lote || 'ATIVO',
        observacoes: initialData.observacoes || initialData.observacoes_estoque || '',
      });
      
      // Para edição, definir o medicamento selecionado baseado nos dados da view
      const medicamentoSelecionado = {
        id: initialData.medicamento_id,
        nome_dcb: initialData.nome_dcb,
        nome_dci: initialData.nome_dci,
        codigo_interno: initialData.codigo_interno
      };
      
      setSelectedMedicamento(medicamentoSelecionado);
      setSearchMedicamento(`${initialData.nome_dcb || initialData.nome_dci} - ${initialData.codigo_interno || ''}`);
      
      console.log('✅ FormData preenchido para edição');
    } else {
      setIsEditing(false);
      // Dados padrão para novo estoque - usar formato brasileiro para data de entrada
      const today = new Date();
      const todayFormatted = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      
      setFormData({
        medicamento_id: '',
        lote: '',
        quantidade_atual: '',
        quantidade_minima: '',
        quantidade_maxima: '',
        localizacao: '',
        data_entrada: todayFormatted,
        data_validade: '',
        fornecedor: '',
        valor_unitario: '',
        valor_total: '',
        responsavel_entrada: 'Sistema',
        status_lote: 'ATIVO',
        observacoes: '',
      });
      
      setSelectedMedicamento(null);
      setSearchMedicamento('');
      
      console.log('✅ FormData inicializado para novo estoque');
    }
  }, [initialData]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!formData.medicamento_id) errors.medicamento_id = 'Medicamento é obrigatório';
    if (!formData.lote.trim()) errors.lote = 'Lote é obrigatório';
    if (!formData.quantidade_atual || parseFloat(formData.quantidade_atual) <= 0) {
      errors.quantidade_atual = 'Quantidade atual deve ser maior que zero';
    }
    if (!formData.quantidade_minima || parseFloat(formData.quantidade_minima) <= 0) {
      errors.quantidade_minima = 'Quantidade mínima deve ser maior que zero';
    }
    
    // Validar relação entre quantidades
    const qtdAtual = parseFloat(formData.quantidade_atual) || 0;
    const qtdMinima = parseFloat(formData.quantidade_minima) || 0;
    const qtdMaxima = parseFloat(formData.quantidade_maxima) || 0;
    
    if (formData.quantidade_maxima && qtdMaxima > 0) {
      if (qtdMaxima < qtdMinima) {
        errors.quantidade_maxima = 'Quantidade máxima deve ser maior ou igual à quantidade mínima';
      }
    }
    
    if (!formData.data_entrada) errors.data_entrada = 'Data de entrada é obrigatória';
    if (!formData.responsavel_entrada.trim()) errors.responsavel_entrada = 'Responsável é obrigatório';

    // Validar datas
    if (formData.data_entrada && !validateDate(formData.data_entrada)) {
      errors.data_entrada = 'Data de entrada inválida (dd/MM/yyyy)';
    }
    if (formData.data_validade && !validateDate(formData.data_validade)) {
      errors.data_validade = 'Data de validade inválida (dd/MM/yyyy)';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setFieldErrors({});
    
    if (!validateForm()) {
      Alert.alert('Erro de Validação', 'Por favor, corrija os campos destacados em vermelho.');
      return;
    }

    try {
      setLoading(true);
      
      // Função para converter data brasileira para ISO
      const convertDateToISO = (dateStr: string): string => {
        if (!dateStr) return '';
        // Se já está no formato ISO (YYYY-MM-DD), retorna como está
        if (dateStr.includes('-') && dateStr.length === 10) return dateStr;
        // Se está no formato brasileiro (DD/MM/YYYY), converte
        if (dateStr.includes('/') && dateStr.length === 10) {
          const [day, month, year] = dateStr.split('/');
          return `${year}-${month}-${day}`;
        }
        return dateStr;
      };
      
      // Preparar dados para envio (removido mapeamento unidade_id)
      const dataToSend = {
        ...formData,
        quantidade_atual: parseFloat(formData.quantidade_atual),
        quantidade_minima: parseFloat(formData.quantidade_minima),
        quantidade_maxima: formData.quantidade_maxima ? parseFloat(formData.quantidade_maxima) : null,
        valor_unitario: formData.valor_unitario ? parseFloat(formData.valor_unitario) : null,
        valor_total: formData.valor_total ? parseFloat(formData.valor_total) : null,
        data_entrada: convertDateToISO(formData.data_entrada),
        data_validade: formData.data_validade ? convertDateToISO(formData.data_validade) : null,
      };
      
      console.log('📤 Dados sendo enviados:', dataToSend);

      await onSubmit(dataToSend);
      
      // Se chegou até aqui, a operação foi bem-sucedida
      console.log('✅ Operação concluída com sucesso no formulário');
    } catch (error) {
      console.error('❌ Erro ao salvar estoque:', error);
      Alert.alert('Erro', 'Erro ao salvar estoque. Tente novamente.');
      throw error; // Re-throw para que a tela principal possa tratar
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {/* Medicamento */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Medicamento *</Text>
          <TouchableOpacity
            style={getFieldStyle('medicamento_id', styles.input)}
            onPress={() => !isEditing && setShowMedicamentoModal(true)}
            disabled={loadingOptions || isEditing}
          >
            <Text style={[
              styles.inputText,
              !searchMedicamento && styles.placeholderText,
              (loadingOptions || isEditing) && styles.disabledText
            ]}>
              {searchMedicamento || 'Pesquisar medicamento...'}
            </Text>
          </TouchableOpacity>
          <FieldError error={fieldErrors.medicamento_id} />
        </View>

        {/* Lote e Localização */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Lote *</Text>
            <TextInput
              style={getFieldStyle('lote', styles.input)}
              value={formData.lote}
              onChangeText={(value: string) => {
                updateField('lote', value);
                clearFieldError('lote');
              }}
              placeholder="Digite o lote"
              placeholderTextColor="#999999"
              maxLength={50}
            />
            <FieldError error={fieldErrors.lote} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Localização</Text>
            <TextInput
              style={styles.input}
              value={formData.localizacao}
              onChangeText={(value: string) => updateField('localizacao', value)}
              placeholder="Ex: Prateleira A1"
              placeholderTextColor="#999999"
              maxLength={100}
            />
          </View>
        </View>

        {/* Quantidades */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Quantidade Atual *</Text>
            <TextInput
              style={getFieldStyle('quantidade_atual', styles.input)}
              value={formData.quantidade_atual}
              onChangeText={(value: string) => {
                const formatted = formatNumber(value);
                updateField('quantidade_atual', formatted);
                clearFieldError('quantidade_atual');
              }}
              placeholder="0"
              placeholderTextColor="#999999"
              keyboardType="numeric"
            />
            <FieldError error={fieldErrors.quantidade_atual} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Quantidade Mínima *</Text>
            <TextInput
              style={getFieldStyle('quantidade_minima', styles.input)}
              value={formData.quantidade_minima}
              onChangeText={(value: string) => {
                const formatted = formatNumber(value);
                updateField('quantidade_minima', formatted);
                clearFieldError('quantidade_minima');
                
                // Validação cruzada com quantidade máxima
                const qtdMinima = parseFloat(formatted) || 0;
                const qtdMaxima = parseFloat(formData.quantidade_maxima) || 0;
                
                if (formData.quantidade_maxima && qtdMaxima > 0 && qtdMinima > 0 && qtdMaxima < qtdMinima) {
                  setFieldErrors(prev => ({
                    ...prev,
                    quantidade_maxima: 'Quantidade máxima deve ser maior ou igual à mínima'
                  }));
                } else {
                  // Limpar erro da quantidade máxima se a validação passou
                  setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    if (newErrors.quantidade_maxima?.includes('maior ou igual')) {
                      delete newErrors.quantidade_maxima;
                    }
                    return newErrors;
                  });
                }
              }}
              placeholder="0"
              placeholderTextColor="#999999"
              keyboardType="numeric"
            />
            <FieldError error={fieldErrors.quantidade_minima} />
          </View>
        </View>

        {/* Quantidade Máxima */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Quantidade Máxima</Text>
          <TextInput
            style={getFieldStyle('quantidade_maxima', styles.input)}
            value={formData.quantidade_maxima}
            onChangeText={(value: string) => {
              const formatted = formatNumber(value);
              updateField('quantidade_maxima', formatted);
              clearFieldError('quantidade_maxima');
              
              // Validação em tempo real
              const qtdMaxima = parseFloat(formatted) || 0;
              const qtdMinima = parseFloat(formData.quantidade_minima) || 0;
              
              if (formatted && qtdMaxima > 0 && qtdMinima > 0 && qtdMaxima < qtdMinima) {
                setFieldErrors(prev => ({
                  ...prev,
                  quantidade_maxima: 'Deve ser maior ou igual à quantidade mínima'
                }));
              }
            }}
            placeholder="0"
            placeholderTextColor="#999999"
            keyboardType="numeric"
          />
          <FieldError error={fieldErrors.quantidade_maxima} />
        </View>

        {/* Datas */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Data de Entrada *</Text>
            <TextInput
              style={getFieldStyle('data_entrada', styles.input)}
              value={formData.data_entrada}
              onChangeText={(value: string) => {
                const formatted = formatDate(value);
                updateField('data_entrada', formatted);
                clearFieldError('data_entrada');
              }}
              placeholder="dd/MM/yyyy"
              placeholderTextColor="#999999"
              maxLength={10}
            />
            <FieldError error={fieldErrors.data_entrada} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Data de Validade</Text>
            <TextInput
              style={getFieldStyle('data_validade', styles.input)}
              value={formData.data_validade}
              onChangeText={(value: string) => {
                const formatted = formatDate(value);
                updateField('data_validade', formatted);
                clearFieldError('data_validade');
              }}
              placeholder="dd/MM/yyyy"
              placeholderTextColor="#999999"
              maxLength={10}
            />
            <FieldError error={fieldErrors.data_validade} />
          </View>
        </View>

        {/* Fornecedor e Responsável */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Fornecedor</Text>
            <TextInput
              style={styles.input}
              value={formData.fornecedor}
              onChangeText={(value: string) => updateField('fornecedor', value)}
              placeholder="Nome do fornecedor"
              placeholderTextColor="#999999"
              maxLength={100}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Responsável *</Text>
            <TextInput
              style={getFieldStyle('responsavel_entrada', styles.input)}
              value={formData.responsavel_entrada}
              onChangeText={(value: string) => {
                updateField('responsavel_entrada', value);
                clearFieldError('responsavel_entrada');
              }}
              placeholder="Nome do responsável"
              placeholderTextColor="#999999"
              maxLength={100}
            />
            <FieldError error={fieldErrors.responsavel_entrada} />
          </View>
        </View>

        {/* Valores */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Valor Unitário (R$)</Text>
            <TextInput
              style={styles.input}
              value={formData.valor_unitario}
              onChangeText={(value: string) => {
                const formatted = formatCurrency(value);
                updateField('valor_unitario', formatted);
              }}
              placeholder="0,00"
              placeholderTextColor="#999999"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Valor Total (R$)</Text>
            <TextInput
              style={styles.input}
              value={formData.valor_total}
              onChangeText={(value: string) => {
                const formatted = formatCurrency(value);
                updateField('valor_total', formatted);
              }}
              placeholder="0,00"
              placeholderTextColor="#999999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Status */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Status do Lote</Text>
          <SimpleCombo
            label=""
            placeholder="Selecione o status"
            value={formData.status_lote}
            options={[
              { id: 'ATIVO', label: 'Ativo' },
              { id: 'VENCIDO', label: 'Vencido' },
              { id: 'QUARENTENA', label: 'Quarentena' },
              { id: 'DEVOLVIDO', label: 'Devolvido' },
              { id: 'BLOQUEADO', label: 'Bloqueado' },
            ]}
            onSelect={(value) => updateField('status_lote', value.toString())}
          />
        </View>

        {/* Observações */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.observacoes}
            onChangeText={(value: string) => updateField('observacoes', value)}
            placeholder="Digite observações adicionais"
            placeholderTextColor="#999999"
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>
      </View>

      {/* Modal de Pesquisa de Medicamentos */}
      <Modal
        visible={showMedicamentoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMedicamentoModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pesquisar Medicamento</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMedicamentoModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalSearchContainer}>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Digite o nome ou código do medicamento..."
              placeholderTextColor="#999999"
              value={searchMedicamento}
              onChangeText={handleSearchMedicamento}
              autoFocus
            />
          </View>
          
          <FlatList
            data={medicamentosFiltrados}
            keyExtractor={(item) => item.id}
            style={styles.modalList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalListItem}
                onPress={() => handleMedicamentoSelect(item)}
              >
                <Text style={styles.modalItemName}>
                  {item.nome_dcb || item.nome_dci}
                </Text>
                <Text style={styles.modalItemCode}>
                  Código: {item.codigo_interno || 'N/A'}
                </Text>
                {item.forca_valor && (
                  <Text style={styles.modalItemForce}>
                    Força: {item.forca_valor} {item.forca_unidade_abrev || ''}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.modalEmptyContainer}>
                <Text style={styles.modalEmptyText}>
                  {searchMedicamento.trim() 
                    ? 'Nenhum medicamento encontrado'
                    : 'Digite para pesquisar medicamentos'
                  }
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>

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
  inputReadonly: {
    backgroundColor: '#f5f5f5',
    color: '#666666',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  inputText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
  },
  disabledText: {
    color: '#666666',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  halfField: {
    flex: 1,
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
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  },
  // Estilos do Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#666666',
  },
  modalSearchContainer: {
    padding: 20,
  },
  modalSearchInput: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  modalList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  modalItemCode: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  modalItemForce: {
    fontSize: 14,
    color: '#888888',
  },
  modalEmptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});

export default EstoqueMedicamentoForm;
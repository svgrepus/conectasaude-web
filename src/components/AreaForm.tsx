import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, TextInput, ScrollView, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Area } from '../services/areaService';
import { unidadeService, Unidade } from '../services/unidadeService';
import { theme } from '../constants/theme';

interface AreaFormProps {
  visible: boolean;
  area?: Area | null;
  onClose: () => void;
  onSave: (data: { 
    nome: string; 
    descricao?: string; 
    populacao_estimada?: number; 
    unidade_id: string; 
    ativa?: boolean 
  }) => Promise<void>;
}

export const AreaForm: React.FC<AreaFormProps> = ({
  visible,
  area,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    populacao_estimada: '',
    unidade_id: '',
    ativa: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUnidadeModal, setShowUnidadeModal] = useState(false);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Carregar unidades ativas
  useEffect(() => {
    if (visible) {
      loadUnidades();
    }
  }, [visible]);

  const loadUnidades = async () => {
    try {
      setLoadingUnidades(true);
      const response = await unidadeService.getUnidadesAtivas();
      setUnidades(response || []);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      Alert.alert('Erro', 'Não foi possível carregar as unidades.');
    } finally {
      setLoadingUnidades(false);
    }
  };

  // Preencher formulário quando area for selecionada
  useEffect(() => {
    if (area) {
      setFormData({
        nome: area.nome || '',
        descricao: area.descricao || '',
        populacao_estimada: area.populacao_estimada?.toString() || '',
        unidade_id: area.unidade_id || '',
        ativa: area.ativa !== undefined ? area.ativa : true,
      });
    } else {
      // Limpar formulário para nova area
      setFormData({
        nome: '',
        descricao: '',
        populacao_estimada: '',
        unidade_id: '',
        ativa: true,
      });
    }
    setErrors({});
  }, [area, visible]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.unidade_id) {
      newErrors.unidade_id = 'Unidade de saúde é obrigatória';
    }

    // Validação de população estimada (se preenchida)
    if (formData.populacao_estimada && formData.populacao_estimada.trim()) {
      const populacao = parseInt(formData.populacao_estimada.trim());
      if (isNaN(populacao) || populacao < 0) {
        newErrors.populacao_estimada = 'População estimada deve ser um número válido';
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
        descricao: formData.descricao.trim() || undefined,
        populacao_estimada: formData.populacao_estimada.trim() 
          ? parseInt(formData.populacao_estimada.trim()) 
          : undefined,
        unidade_id: formData.unidade_id,
        ativa: formData.ativa,
      };

      await onSave(dataToSave);
      
      // Formulário será fechado pelo componente pai
    } catch (error) {
      console.error('Erro ao salvar área:', error);
      Alert.alert('Erro', 'Não foi possível salvar a área. Tente novamente.');
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

  const formatNumber = (text: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = text.replace(/\D/g, '');
    return numbers;
  };

  const handlePopulacaoChange = (text: string) => {
    const formatted = formatNumber(text);
    setFormData(prev => ({ ...prev, populacao_estimada: formatted }));
  };

  const getSelectedUnidadeLabel = () => {
    const unidade = unidades.find(u => u.id === formData.unidade_id);
    return unidade ? unidade.nome : 'Selecione a unidade de saúde';
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
            {area ? 'Editar Área' : 'Nova Área'}
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
              placeholder="Digite o nome da área"
              placeholderTextColor={currentTheme.mutedForeground}
              editable={!loading}
            />
            {errors.nome && (
              <Text style={styles.errorText}>{errors.nome}</Text>
            )}
          </View>

          {/* Descrição */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Descrição</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.descricao ? '#ef4444' : currentTheme.border,
                  color: currentTheme.text
                }
              ]}
              value={formData.descricao}
              onChangeText={(text) => setFormData(prev => ({ ...prev, descricao: text }))}
              placeholder="Digite a descrição da área"
              placeholderTextColor={currentTheme.mutedForeground}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Unidade de Saúde */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              Unidade de Saúde <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.unidade_id ? '#ef4444' : currentTheme.border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }
              ]}
              onPress={() => !loading && !loadingUnidades && setShowUnidadeModal(true)}
              disabled={loading || loadingUnidades}
            >
              <Text style={[
                { color: formData.unidade_id ? currentTheme.text : currentTheme.mutedForeground }
              ]}>
                {loadingUnidades ? 'Carregando...' : getSelectedUnidadeLabel()}
              </Text>
              <Ionicons name="chevron-down" size={20} color={currentTheme.mutedForeground} />
            </TouchableOpacity>
            {errors.unidade_id && (
              <Text style={styles.errorText}>{errors.unidade_id}</Text>
            )}
          </View>

          {/* População Estimada */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>População Estimada</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.populacao_estimada ? '#ef4444' : currentTheme.border,
                  color: currentTheme.text
                }
              ]}
              value={formData.populacao_estimada}
              onChangeText={handlePopulacaoChange}
              placeholder="Digite a população estimada"
              placeholderTextColor={currentTheme.mutedForeground}
              keyboardType="numeric"
              editable={!loading}
            />
            {errors.populacao_estimada && (
              <Text style={styles.errorText}>{errors.populacao_estimada}</Text>
            )}
          </View>

          {/* Status Ativa */}
          <View style={styles.field}>
            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: currentTheme.text }]}>Área Ativa</Text>
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

      {/* Modal de Seleção de Unidade */}
      <Modal
        visible={showUnidadeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnidadeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUnidadeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Selecionar Unidade de Saúde
            </Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {unidades.map((unidade) => (
                <TouchableOpacity
                  key={unidade.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, unidade_id: unidade.id }));
                    setShowUnidadeModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, { color: currentTheme.text }]}>
                    {unidade.nome}
                  </Text>
                </TouchableOpacity>
              ))}
              {unidades.length === 0 && (
                <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                  Nenhuma unidade ativa encontrada
                </Text>
              )}
            </ScrollView>
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
    maxWidth: 400,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 300,
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
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
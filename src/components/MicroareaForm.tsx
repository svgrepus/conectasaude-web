import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, TextInput, ScrollView, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Microarea } from '../services/microareaService';
import { areaService, Area } from '../services/areaService';
import { equipeService, Equipe } from '../services/equipeService';
import { theme } from '../constants/theme';

interface MicroareaFormProps {
  visible: boolean;
  microarea?: Microarea | null;
  onClose: () => void;
  onSave: (data: { 
    nome: string; 
    descricao?: string; 
    area_id: string; 
    equipe_id: string; 
    numero_familias_cadastradas?: number;
    numero_pessoas_cadastradas?: number;
    ativa?: boolean 
  }) => Promise<void>;
}

export const MicroareaForm: React.FC<MicroareaFormProps> = ({
  visible,
  microarea,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    area_id: '',
    equipe_id: '',
    numero_familias_cadastradas: '',
    numero_pessoas_cadastradas: '',
    ativa: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showEquipeModal, setShowEquipeModal] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingEquipes, setLoadingEquipes] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Carregar áreas e equipes ativas
  useEffect(() => {
    if (visible) {
      loadAreas();
      loadEquipes();
    }
  }, [visible]);

  const loadAreas = async () => {
    try {
      setLoadingAreas(true);
      const response = await areaService.getAreasAtivas();
      setAreas(response || []);
    } catch (error) {
      console.error('Erro ao carregar áreas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as áreas.');
    } finally {
      setLoadingAreas(false);
    }
  };

  const loadEquipes = async () => {
    try {
      setLoadingEquipes(true);
      const response = await equipeService.getEquipesAtivas();
      setEquipes(response || []);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      Alert.alert('Erro', 'Não foi possível carregar as equipes.');
    } finally {
      setLoadingEquipes(false);
    }
  };

  // Preencher formulário quando microarea for selecionada
  useEffect(() => {
    if (microarea) {
      setFormData({
        nome: microarea.nome || '',
        descricao: microarea.descricao || '',
        area_id: microarea.area_id || '',
        equipe_id: microarea.equipe_id || '',
        numero_familias_cadastradas: microarea.familias_cadastradas?.toString() || '',
        numero_pessoas_cadastradas: microarea.pessoas_cadastradas?.toString() || '',
        ativa: microarea.ativa !== undefined ? microarea.ativa : true,
      });
    } else {
      // Limpar formulário para nova microarea
      setFormData({
        nome: '',
        descricao: '',
        area_id: '',
        equipe_id: '',
        numero_familias_cadastradas: '',
        numero_pessoas_cadastradas: '',
        ativa: true,
      });
    }
    setErrors({});
  }, [microarea, visible]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.area_id) {
      newErrors.area_id = 'Área é obrigatória';
    }

    if (!formData.equipe_id) {
      newErrors.equipe_id = 'Equipe é obrigatória';
    }

    // Validação de número de famílias (se preenchido)
    if (formData.numero_familias_cadastradas && formData.numero_familias_cadastradas.trim()) {
      const familias = parseInt(formData.numero_familias_cadastradas.trim());
      if (isNaN(familias) || familias < 0) {
        newErrors.numero_familias_cadastradas = 'Número de famílias deve ser um número válido';
      }
    }

    // Validação de número de pessoas (se preenchido)
    if (formData.numero_pessoas_cadastradas && formData.numero_pessoas_cadastradas.trim()) {
      const pessoas = parseInt(formData.numero_pessoas_cadastradas.trim());
      if (isNaN(pessoas) || pessoas < 0) {
        newErrors.numero_pessoas_cadastradas = 'Número de pessoas deve ser um número válido';
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
        area_id: formData.area_id,
        equipe_id: formData.equipe_id,
        numero_familias_cadastradas: formData.numero_familias_cadastradas.trim() 
          ? parseInt(formData.numero_familias_cadastradas.trim()) 
          : undefined,
        numero_pessoas_cadastradas: formData.numero_pessoas_cadastradas.trim() 
          ? parseInt(formData.numero_pessoas_cadastradas.trim()) 
          : undefined,
        ativa: formData.ativa,
      };

      await onSave(dataToSave);
      
      // Formulário será fechado pelo componente pai
    } catch (error) {
      console.error('Erro ao salvar microárea:', error);
      Alert.alert('Erro', 'Não foi possível salvar a microárea. Tente novamente.');
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

  const handleFamiliasChange = (text: string) => {
    const formatted = formatNumber(text);
    setFormData(prev => ({ ...prev, numero_familias_cadastradas: formatted }));
  };

  const handlePessoasChange = (text: string) => {
    const formatted = formatNumber(text);
    setFormData(prev => ({ ...prev, numero_pessoas_cadastradas: formatted }));
  };

  const getSelectedAreaLabel = () => {
    const area = areas.find(a => a.id === formData.area_id);
    return area ? area.nome : 'Selecione a área';
  };

  const getSelectedEquipeLabel = () => {
    const equipe = equipes.find(e => e.id === formData.equipe_id);
    return equipe ? equipe.nome : 'Selecione a equipe';
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
            {microarea ? 'Editar Microárea' : 'Nova Microárea'}
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
              placeholder="Digite o nome da microárea"
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
              placeholder="Digite a descrição da microárea"
              placeholderTextColor={currentTheme.mutedForeground}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Área */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              Área <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.area_id ? '#ef4444' : currentTheme.border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }
              ]}
              onPress={() => !loading && !loadingAreas && setShowAreaModal(true)}
              disabled={loading || loadingAreas}
            >
              <Text style={[
                { color: formData.area_id ? currentTheme.text : currentTheme.mutedForeground }
              ]}>
                {loadingAreas ? 'Carregando...' : getSelectedAreaLabel()}
              </Text>
              <Ionicons name="chevron-down" size={20} color={currentTheme.mutedForeground} />
            </TouchableOpacity>
            {errors.area_id && (
              <Text style={styles.errorText}>{errors.area_id}</Text>
            )}
          </View>

          {/* Equipe */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              Equipe <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.equipe_id ? '#ef4444' : currentTheme.border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }
              ]}
              onPress={() => !loading && !loadingEquipes && setShowEquipeModal(true)}
              disabled={loading || loadingEquipes}
            >
              <Text style={[
                { color: formData.equipe_id ? currentTheme.text : currentTheme.mutedForeground }
              ]}>
                {loadingEquipes ? 'Carregando...' : getSelectedEquipeLabel()}
              </Text>
              <Ionicons name="chevron-down" size={20} color={currentTheme.mutedForeground} />
            </TouchableOpacity>
            {errors.equipe_id && (
              <Text style={styles.errorText}>{errors.equipe_id}</Text>
            )}
          </View>

          {/* Número de Famílias Cadastradas */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Número de Famílias Cadastradas</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.numero_familias_cadastradas ? '#ef4444' : currentTheme.border,
                  color: currentTheme.text
                }
              ]}
              value={formData.numero_familias_cadastradas}
              onChangeText={handleFamiliasChange}
              placeholder="Digite o número de famílias"
              placeholderTextColor={currentTheme.mutedForeground}
              keyboardType="numeric"
              editable={!loading}
            />
            {errors.numero_familias_cadastradas && (
              <Text style={styles.errorText}>{errors.numero_familias_cadastradas}</Text>
            )}
          </View>

          {/* Número de Pessoas Cadastradas */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Número de Pessoas Cadastradas</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: errors.numero_pessoas_cadastradas ? '#ef4444' : currentTheme.border,
                  color: currentTheme.text
                }
              ]}
              value={formData.numero_pessoas_cadastradas}
              onChangeText={handlePessoasChange}
              placeholder="Digite o número de pessoas"
              placeholderTextColor={currentTheme.mutedForeground}
              keyboardType="numeric"
              editable={!loading}
            />
            {errors.numero_pessoas_cadastradas && (
              <Text style={styles.errorText}>{errors.numero_pessoas_cadastradas}</Text>
            )}
          </View>

          {/* Status Ativa */}
          <View style={styles.field}>
            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: currentTheme.text }]}>Microárea Ativa</Text>
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

      {/* Modal de Seleção de Área */}
      <Modal
        visible={showAreaModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAreaModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAreaModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Selecionar Área
            </Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {areas.map((area) => (
                <TouchableOpacity
                  key={area.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, area_id: area.id }));
                    setShowAreaModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, { color: currentTheme.text }]}>
                    {area.nome}
                  </Text>
                </TouchableOpacity>
              ))}
              {areas.length === 0 && (
                <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                  Nenhuma área ativa encontrada
                </Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Seleção de Equipe */}
      <Modal
        visible={showEquipeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEquipeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEquipeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Selecionar Equipe
            </Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {equipes.map((equipe) => (
                <TouchableOpacity
                  key={equipe.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, equipe_id: equipe.id }));
                    setShowEquipeModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, { color: currentTheme.text }]}>
                    {equipe.nome}
                  </Text>
                </TouchableOpacity>
              ))}
              {equipes.length === 0 && (
                <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                  Nenhuma equipe ativa encontrada
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
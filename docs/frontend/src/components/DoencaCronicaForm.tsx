import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { DoencaCronica } from '../services/doencaCronicaService';

interface DoencaCronicaFormProps {
  visible: boolean;
  doenca?: DoencaCronica | null;
  onClose: () => void;
  onSave: (doenca: Pick<DoencaCronica, 'name' | 'description'>) => Promise<void>;
}

export const DoencaCronicaForm: React.FC<DoencaCronicaFormProps> = ({
  visible,
  doenca,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Carregar dados quando o modal abrir ou doença mudar
  useEffect(() => {
    if (visible) {
      if (doenca) {
        // Edição - carregar dados da doença
        setFormData({
          name: doenca.name || '',
          description: doenca.description || ''
        });
      } else {
        // Novo registro - limpar formulário
        setFormData({
          name: '',
          description: ''
        });
      }
      setErrors({});
    }
  }, [visible, doenca]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar formulário
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Erro de Validação', 'Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar doença crônica:', error);
      Alert.alert(
        'Erro',
        'Não foi possível salvar a doença crônica. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancelar e fechar
  const handleCancel = () => {
    Alert.alert(
      'Confirmar',
      'Deseja cancelar? As alterações não salvas serão perdidas.',
      [
        { text: 'Continuar Editando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: onClose }
      ]
    );
  };

  const isEditing = !!doenca;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Editar Doença Crônica' : 'Nova Doença Crônica'}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={loading}>
              <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulário */}
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.formContent}>
            {/* Nome */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Nome da Doença <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Ex: Diabetes Mellitus Tipo 2"
                mode="outlined"
                style={styles.textInput}
                error={!!errors.name}
                disabled={loading}
                maxLength={100}
              />
              {errors.name && (
                <Text style={styles.errorText}>❌ {errors.name}</Text>
              )}
            </View>

            {/* Descrição */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Descrição</Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Descrição detalhada da doença crônica..."
                mode="outlined"
                multiline
                numberOfLines={4}
                style={[styles.textInput, styles.textArea]}
                error={!!errors.description}
                disabled={loading}
                maxLength={500}
              />
              {errors.description && (
                <Text style={styles.errorText}>❌ {errors.description}</Text>
              )}
              <Text style={styles.charCount}>
                {formData.description.length}/500 caracteres
              </Text>
            </View>

            {/* Informações Adicionais */}
            {isEditing && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Informações do Registro</Text>
                {doenca?.created_at && (
                  <Text style={styles.infoText}>
                    📅 Criado em: {new Date(doenca.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                )}
                {doenca?.updated_at && doenca.updated_at !== doenca.created_at && (
                  <Text style={styles.infoText}>
                    🔄 Atualizado em: {new Date(doenca.updated_at).toLocaleDateString('pt-BR')}
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Botões do Footer */}
        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.footerButton}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            mode="contained"
            onPress={handleSave}
            style={[styles.footerButton, styles.saveFooterButton]}
            loading={loading}
            disabled={loading}
            buttonColor="#8A9E8E"
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Doença'}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8A9E8E',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButtonTextDisabled: {
    opacity: 0.6,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  required: {
    color: '#e74c3c',
  },
  textInput: {
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  switchLabel: {
    flex: 1,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#8A9E8E',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  saveFooterButton: {
    backgroundColor: '#8A9E8E',
  },
});

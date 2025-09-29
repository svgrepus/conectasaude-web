import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Equipe } from '../services/equipeService';

interface EquipeFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { nome: string; codigo?: string; descricao?: string; ativa?: boolean }) => Promise<void>;
  equipe?: Equipe | null;
}

export const EquipeForm: React.FC<EquipeFormProps> = ({
  visible,
  onClose,
  onSave,
  equipe,
}) => {
  const [form, setForm] = useState({
    nome: '',
    codigo: '',
    descricao: '',
    ativa: true,
  });
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Resetar formulário quando abrir/fechar
  useEffect(() => {
    if (visible) {
      if (equipe) {
        // Editando - preencher com dados existentes
        setForm({
          nome: equipe.nome || '',
          codigo: equipe.codigo || '',
          descricao: equipe.descricao || '',
          ativa: equipe.ativa !== undefined ? equipe.ativa : true,
        });
      } else {
        // Criando - formulário limpo
        setForm({
          nome: '',
          codigo: '',
          descricao: '',
          ativa: true,
        });
      }
    }
  }, [visible, equipe]);

  const handleSave = async () => {
    // Validações
    if (!form.nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        nome: form.nome.trim(),
        codigo: form.codigo.trim() || undefined,
        descricao: form.descricao.trim() || undefined,
        ativa: form.ativa,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: currentTheme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: currentTheme.text }]}>
              {equipe ? 'Editar Equipe' : 'Nova Equipe'}
            </Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={24} color={currentTheme.text} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Nome */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Nome *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="Digite o nome da equipe"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.nome}
                onChangeText={(text) => setForm(prev => ({ ...prev, nome: text }))}
                editable={!loading}
              />
            </View>

            {/* Código */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Código
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="Digite o código da equipe"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.codigo}
                onChangeText={(text) => setForm(prev => ({ ...prev, codigo: text }))}
                editable={!loading}
              />
            </View>

            {/* Descrição */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Descrição
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="Digite a descrição da equipe"
                placeholderTextColor={currentTheme.mutedForeground}
                value={form.descricao}
                onChangeText={(text) => setForm(prev => ({ ...prev, descricao: text }))}
                multiline={true}
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            {/* Ativa */}
            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Ativa
              </Text>
              <Switch
                value={form.ativa}
                onValueChange={(value) => setForm(prev => ({ ...prev, ativa: value }))}
                disabled={loading}
                trackColor={{ false: currentTheme.muted, true: '#8A9E8E' }}
                thumbColor={form.ativa ? '#ffffff' : currentTheme.mutedForeground}
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: currentTheme.border }]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: currentTheme.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 12,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#8A9E8E',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
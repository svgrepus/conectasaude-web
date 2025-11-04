import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { MedicamentoEstoque } from '../services/medicamentosEstoqueService';

interface ExcluirEstoqueModalProps {
  visible: boolean;
  estoque: MedicamentoEstoque | null;
  onClose: () => void;
  onConfirm: (motivo: string) => Promise<void>;
  isDarkMode?: boolean;
}

const ExcluirEstoqueModal: React.FC<ExcluirEstoqueModalProps> = ({
  visible,
  estoque,
  onClose,
  onConfirm,
  isDarkMode = false,
}) => {
  const [motivo, setMotivo] = useState('');
  const [motivoSelecionado, setMotivoSelecionado] = useState('');
  const [loading, setLoading] = useState(false);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const motivosComuns = [
    'Medicamento vencido',
    'Medicamento danificado',
    'Lote com problemas de qualidade',
    'Erro de cadastro',
    'Devolução ao fornecedor',
    'Descarte por contaminação',
    'Transferência para outra unidade',
    'Outros'
  ];

  const handleClose = () => {
    setMotivo('');
    setMotivoSelecionado('');
    onClose();
  };

  const handleConfirm = async () => {
    console.log('🎯 handleConfirm iniciado');
    console.log('📝 Estado atual:', { motivoSelecionado, motivo, loading });
    
    try {
      const motivoFinal = motivoSelecionado === 'Outros' ? motivo : motivoSelecionado;
      console.log('🔍 Motivo final:', motivoFinal);
      
      if (!motivoFinal.trim()) {
        console.log('❌ Motivo vazio, mostrando alerta');
        Alert.alert('Erro', 'Por favor, informe o motivo da exclusão');
        return;
      }

      console.log('⏳ Iniciando loading...');
      setLoading(true);
      
      console.log('📞 Chamando onConfirm com motivo:', motivoFinal.trim());
      await onConfirm(motivoFinal.trim());
      
      console.log('✅ onConfirm executado com sucesso');
      // NÃO chamar handleClose aqui - será fechado pela tela principal
    } catch (error) {
      console.error('❌ Erro em handleConfirm:', error);
      Alert.alert('Erro', 'Erro inesperado ao excluir estoque');
    } finally {
      console.log('🔄 Finalizando loading...');
      setLoading(false);
    }
  };

  const handleMotivoSelect = (motivoEscolhido: string) => {
    setMotivoSelecionado(motivoEscolhido);
    if (motivoEscolhido !== 'Outros') {
      setMotivo('');
    }
  };

  if (!visible || !estoque) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: currentTheme.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: '#dc2626' }]}>
            <View style={styles.headerContent}>
              <Ionicons name="alert-circle" size={24} color="#ffffff" />
              <Text style={styles.title}>Excluir Estoque</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Informações do item */}
            <View style={[styles.infoContainer, { 
              backgroundColor: currentTheme.card, 
              borderColor: currentTheme.border 
            }]}>
              <Text style={[styles.infoTitle, { color: currentTheme.text }]}>
                Item a ser excluído:
              </Text>
              <Text style={[styles.infoMedicamento, { color: currentTheme.text }]}>
                {estoque.nome_dcb || estoque.nome_dci || 'Medicamento não identificado'}
              </Text>
              <Text style={[styles.infoLote, { color: currentTheme.mutedForeground }]}>
                Lote: {estoque.lote}
              </Text>
              {estoque.quantidade_atual !== undefined && (
                <Text style={[styles.infoQuantidade, { color: currentTheme.mutedForeground }]}>
                  Quantidade: {estoque.quantidade_atual.toLocaleString('pt-BR')}
                </Text>
              )}
            </View>

            {/* Warning */}
            <View style={[styles.warningContainer, { 
              backgroundColor: '#fef3c7', 
              borderColor: '#f59e0b' 
            }]}>
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <Text style={[styles.warningText, { color: '#92400e' }]}>
                Esta ação não pode ser desfeita. O registro será marcado como excluído no sistema para fins de auditoria.
              </Text>
            </View>

            {/* Motivos comuns */}
            <View style={styles.motivosContainer}>
              <Text style={[styles.motivosTitle, { color: currentTheme.text }]}>
                Motivo da exclusão:
              </Text>
              
              {motivosComuns.map((motivoItem) => (
                <TouchableOpacity
                  key={motivoItem}
                  style={[
                    styles.motivoItem,
                    { 
                      backgroundColor: motivoSelecionado === motivoItem 
                        ? currentTheme.primary 
                        : currentTheme.card,
                      borderColor: motivoSelecionado === motivoItem
                        ? currentTheme.primary
                        : currentTheme.border
                    }
                  ]}
                  onPress={() => handleMotivoSelect(motivoItem)}
                >
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioButton,
                      { 
                        borderColor: motivoSelecionado === motivoItem 
                          ? '#ffffff' 
                          : currentTheme.border
                      }
                    ]}>
                      {motivoSelecionado === motivoItem && (
                        <View style={[styles.radioSelected, { backgroundColor: '#ffffff' }]} />
                      )}
                    </View>
                    <Text style={[
                      styles.motivoText,
                      { 
                        color: motivoSelecionado === motivoItem 
                          ? '#ffffff' 
                          : currentTheme.text
                      }
                    ]}>
                      {motivoItem}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Campo de texto personalizado */}
            {motivoSelecionado === 'Outros' && (
              <View style={styles.customMotivoContainer}>
                <Text style={[styles.customMotivoLabel, { color: currentTheme.text }]}>
                  Descreva o motivo:
                </Text>
                <TextInput
                  style={[
                    styles.customMotivoInput,
                    { 
                      backgroundColor: currentTheme.background,
                      borderColor: currentTheme.border,
                      color: currentTheme.text
                    }
                  ]}
                  placeholder="Digite o motivo da exclusão..."
                  placeholderTextColor={currentTheme.mutedForeground}
                  value={motivo}
                  onChangeText={setMotivo}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: currentTheme.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: currentTheme.border }]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: currentTheme.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { 
                  backgroundColor: loading ? '#9ca3af' : '#dc2626',
                  opacity: loading ? 0.7 : 1
                }
              ]}
              onPress={handleConfirm}
              disabled={loading || !motivoSelecionado}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
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
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoMedicamento: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoLote: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoQuantidade: {
    fontSize: 14,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 20,
  },
  motivosContainer: {
    marginBottom: 20,
  },
  motivosTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  motivoItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  motivoText: {
    fontSize: 14,
    flex: 1,
  },
  customMotivoContainer: {
    marginBottom: 20,
  },
  customMotivoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  customMotivoInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExcluirEstoqueModal;
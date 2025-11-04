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
import { estoqueMovimentosService } from '../services/estoqueMovimentosService';
import { MedicamentoEstoque } from '../services/medicamentosEstoqueService';
import { theme } from '../constants/theme';
import { withAuth, analyzeError } from '../utils/authUtils';

interface SaidaEstoqueModalProps {
  visible: boolean;
  estoque: MedicamentoEstoque | null;
  onClose: () => void;
  onSuccess: () => void;
  isDarkMode?: boolean;
}

const formatQuantity = (quantidade: number): string => {
  try {
    if (quantidade === null || quantidade === undefined || isNaN(quantidade)) {
      return '0';
    }
    return quantidade.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  } catch (error) {
    console.error('Erro ao formatar quantidade:', error);
    return '0';
  }
};

export const SaidaEstoqueModal: React.FC<SaidaEstoqueModalProps> = ({
  visible,
  estoque,
  onClose,
  onSuccess,
  isDarkMode = false,
}) => {
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const handleClose = () => {
    setQuantidade('');
    setMotivo('');
    onClose();
  };

  const handleSubmit = async () => {
    console.log('🔄 handleSubmit chamado');
    
    if (!estoque) {
      console.log('❌ Nenhum estoque selecionado');
      Alert.alert('Erro', 'Nenhum estoque selecionado');
      return;
    }

    if (!quantidade || !motivo.trim()) {
      console.log('❌ Campos obrigatórios não preenchidos');
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const quantidadeNum = parseFloat(quantidade.replace(',', '.'));
    console.log('📊 Quantidade convertida:', quantidadeNum);
    
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      console.log('❌ Quantidade inválida:', quantidadeNum);
      Alert.alert('Erro', 'Quantidade deve ser um número válido maior que zero');
      return;
    }

    if (quantidadeNum > (estoque.quantidade_atual || 0)) {
      console.log('❌ Quantidade maior que estoque disponível');
      Alert.alert(
        'Erro', 
        `Quantidade solicitada (${formatQuantity(quantidadeNum)}) é maior que o estoque disponível (${formatQuantity(estoque.quantidade_atual || 0)})`
      );
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 Iniciando processamento da saída');
      
      const estoqueId = estoque.id || (estoque as any).estoque_id;
      if (!estoqueId) {
        throw new Error('ID do estoque não encontrado');
      }

      console.log('📤 Registrando saída:', {
        estoqueId,
        quantidade: quantidadeNum,
        motivo: motivo.trim()
      });

      const resultado = await withAuth(async () => {
        return await estoqueMovimentosService.registrarSaidaEstoque({
          medicamentos_estoque_id: estoqueId,
          quantidade: quantidadeNum,
          motivo: motivo.trim()
        });
      });

      if (!resultado) {
        // Erro de autenticação já foi tratado pelo withAuth
        return;
      }

      console.log('✅ Resultado recebido:', resultado);

      if (resultado.success) {
        // Fechar modal e atualizar dados imediatamente
        console.log('🎉 Sucesso! Fechando modal e atualizando dados...');
        
        // Aguardar um pouco para garantir que a transação foi commitada
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 100);
        
        // Mostrar feedback de sucesso mais simples
        Alert.alert(
          'Sucesso!',
          `Saída registrada com sucesso!\n\n` +
          `Medicamento: ${resultado.medicamento || estoque.nome_dcb || estoque.nome_dci}\n` +
          `Quantidade: ${formatQuantity(resultado.quantidade_saida || quantidadeNum)}\n` +
          `Estoque anterior: ${formatQuantity(resultado.estoque_anterior || 0)}\n` +
          `Estoque atual: ${formatQuantity(resultado.estoque_atual || 0)}`
        );
      } else {
        console.log('❌ Falha na operação:', resultado.error || resultado.message);
        Alert.alert('Erro', resultado.error || resultado.message || 'Erro ao registrar saída');
      }
    } catch (error) {
      console.error('❌ Erro ao registrar saída:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido ao registrar saída');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

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
          <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
            <Text style={[styles.title, { color: currentTheme.primaryForeground }]}>Registrar Saída de Estoque</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={20} color={currentTheme.primaryForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Informações do Medicamento */}
            {estoque && (
              <View style={[styles.medicamentoInfo, { 
                backgroundColor: currentTheme.primary + '15', // Verde bem claro
                borderLeftColor: theme.colors.jambeiro.greenDark // Verde mais escuro na borda esquerda
              }]}>
                <Text style={[styles.medicamentoNome, { color: currentTheme.text }]}>
                  {estoque.nome_dcb || estoque.nome_dci || 'Medicamento'}
                </Text>
                <View style={styles.medicamentoDetalhes}>
                  <Text style={[styles.codigoText, { color: currentTheme.textMuted }]}>
                    Código: {estoque.codigo_interno || 'N/A'}
                  </Text>
                  <Text style={[styles.loteText, { color: currentTheme.textMuted }]}>
                    Lote: {estoque.lote || 'N/A'}
                  </Text>
                </View>
                <View style={styles.estoqueAtualContainer}>
                  <Text style={[styles.estoqueLabel, { color: currentTheme.text }]}>Estoque Atual:</Text>
                  <Text style={[styles.estoqueValue, { color: theme.colors.jambeiro.green }]}>
                    {formatQuantity(estoque.quantidade_atual || 0)}
                  </Text>
                </View>
              </View>
            )}

            {/* Formulário */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Quantidade <Text style={[styles.required, { color: theme.colors.jambeiro.green }]}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: currentTheme.input, borderColor: currentTheme.border, color: currentTheme.text }]}
                  value={quantidade}
                  onChangeText={setQuantidade}
                  placeholder="Digite a quantidade"
                  placeholderTextColor={currentTheme.textMuted}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Motivo <Text style={[styles.required, { color: theme.colors.jambeiro.green }]}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: currentTheme.input, borderColor: currentTheme.border, color: currentTheme.text }]}
                  value={motivo}
                  onChangeText={setMotivo}
                  placeholder="Ex: Dispensação para paciente João Silva"
                  placeholderTextColor={currentTheme.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!loading}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: currentTheme.border }]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: currentTheme.secondary, borderColor: currentTheme.border }]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: currentTheme.secondaryForeground }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, { backgroundColor: currentTheme.primary }, loading && { backgroundColor: currentTheme.textMuted }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <Text style={[styles.submitButtonText, { color: currentTheme.primaryForeground }]}>Processando...</Text>
              ) : (
                <>
                  <Ionicons name="arrow-down" size={16} color={currentTheme.primaryForeground} />
                  <Text style={[styles.submitButtonText, { color: currentTheme.primaryForeground }]}>Registrar Saída</Text>
                </>
              )}
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
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  medicamentoInfo: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  medicamentoNome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  medicamentoDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codigoText: {
    fontSize: 12,
  },
  loteText: {
    fontSize: 12,
  },
  estoqueAtualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  estoqueLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  estoqueValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    // backgroundColor será aplicado dinamicamente
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SaidaEstoqueModal;
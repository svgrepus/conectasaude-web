import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { estoqueMovimentosService, EstoqueMovimento } from '../services/estoqueMovimentosService';
import { MedicamentoEstoque } from '../services/medicamentosEstoqueService';

interface MovimentosModalProps {
  visible: boolean;
  estoque: MedicamentoEstoque | null;
  onClose: () => void;
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

const formatDateTime = (dateTime: string): string => {
  try {
    if (!dateTime) return 'Data não informada';
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'Data inválida';
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

const getTipoColor = (tipo: string): string => {
  switch (tipo) {
    case 'ENTRADA':
      return '#22c55e'; // Verde
    case 'SAIDA':
      return '#ef4444'; // Vermelho
    case 'TRANSFERENCIA':
      return '#3b82f6'; // Azul
    default:
      return '#6b7280'; // Cinza
  }
};

const getTipoIcon = (tipo: string): any => {
  switch (tipo) {
    case 'ENTRADA':
      return 'add-circle';
    case 'SAIDA':
      return 'remove-circle';
    case 'TRANSFERENCIA':
      return 'swap-horizontal';
    default:
      return 'help-circle';
  }
};

export const MovimentosModal: React.FC<MovimentosModalProps> = ({
  visible,
  estoque,
  onClose,
}) => {
  const [movimentos, setMovimentos] = useState<EstoqueMovimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [resumo, setResumo] = useState<{
    totalEntradas: number;
    totalSaidas: number;
    saldoMovimentacao: number;
    ultimaMovimentacao?: EstoqueMovimento;
  } | null>(null);

  useEffect(() => {
    if (visible && estoque) {
      // Verificar se tem ID válido (pode ser 'id' ou 'estoque_id')
      const estoqueId = estoque.id || (estoque as any).estoque_id;
      
      if (estoqueId) {
        console.log('🔄 Modal aberto para estoque:', {
          id: estoqueId,
          nome: estoque.nome_dcb || estoque.nome_dci,
          lote: estoque.lote
        });
        fetchMovimentos(estoqueId);
        fetchResumo(estoqueId);
      } else {
        console.warn('⚠️ Modal aberto mas estoque não tem ID válido:', estoque);
      }
    }
  }, [visible, estoque]);

  const fetchMovimentos = async (estoqueId?: string) => {
    const idToUse = estoqueId || estoque?.id || (estoque as any)?.estoque_id;
    
    if (!idToUse) {
      console.warn('⚠️ Tentativa de buscar movimentações sem ID do estoque');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Buscando movimentações para estoque ID:', idToUse);
      
      // Primeiro testar se a tabela existe
      const canConnect = await estoqueMovimentosService.testConnection();
      if (!canConnect) {
        throw new Error('Não foi possível acessar a tabela de movimentações');
      }
      
      const response = await estoqueMovimentosService.getByEstoqueId(idToUse);
      setMovimentos(response);
      
      console.log('✅ Movimentações carregadas:', response.length);
    } catch (error) {
      console.error('❌ Erro ao buscar movimentações:', error);
      
      // Mostrar detalhes do erro
      if (error instanceof Error) {
        console.error('Detalhes do erro:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        Alert.alert('Erro', `Erro ao carregar histórico: ${error.message}`);
      } else {
        console.error('Erro desconhecido:', error);
        Alert.alert('Erro', 'Erro desconhecido ao carregar histórico de movimentações.');
      }
      
      // Definir estado vazio em caso de erro
      setMovimentos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumo = async (estoqueId?: string) => {
    const idToUse = estoqueId || estoque?.id || (estoque as any)?.estoque_id;
    
    if (!idToUse) return;

    try {
      console.log('📊 Buscando resumo para estoque ID:', idToUse);
      
      const response = await estoqueMovimentosService.getResumoByEstoqueId(idToUse);
      setResumo(response);
      
      console.log('✅ Resumo carregado:', response);
    } catch (error) {
      console.error('❌ Erro ao buscar resumo:', error);
    }
  };

  const renderMovimentoItem = ({ item }: { item: EstoqueMovimento }) => (
    <View style={styles.movimentoItem}>
      <View style={styles.movimentoHeader}>
        <View style={styles.tipoContainer}>
          <Ionicons
            name={getTipoIcon(item.tipo)}
            size={18}
            color={getTipoColor(item.tipo)}
          />
          <Text style={[styles.tipoText, { color: getTipoColor(item.tipo) }]}>
            {item.tipo || 'N/A'}
          </Text>
        </View>
        <Text style={styles.dataText}>
          {formatDateTime(item.executed_at)}
        </Text>
      </View>
      
      <View style={styles.movimentoBody}>
        <View style={styles.quantidadeContainer}>
          <Text style={styles.quantidadeLabel}>
            Quantidade:
          </Text>
          <Text style={styles.quantidadeValue}>
            {`${item.tipo === 'SAIDA' ? '-' : '+'}${formatQuantity(item.quantidade)}`}
          </Text>
        </View>
        
        {item.motivo && item.motivo.trim() && (
          <Text style={styles.motivoText} numberOfLines={2}>
            {item.motivo}
          </Text>
        )}
      </View>
    </View>
  );

  const renderMovimentoItemCompacto = ({ item }: { item: EstoqueMovimento }) => {
    const tipoColor = getTipoColor(item.tipo);
    const tipoIcon = getTipoIcon(item.tipo);
    
    return (
      <View style={styles.movimentoItemCompacto}>
        <View style={styles.movimentoRowCompacto}>
          <View style={styles.tipoContainerCompacto}>
            <Ionicons name={tipoIcon} size={16} color={tipoColor} />
            <Text style={[styles.tipoTextCompacto, { color: tipoColor }]}>
              {item.tipo || 'N/A'}
            </Text>
          </View>
          
          <Text style={styles.dataTextCompacto}>
            {formatDateTime(item.executed_at)}
          </Text>
          
          <Text style={[styles.quantidadeCompacta, { color: tipoColor }]}>
            {`${item.tipo === 'SAIDA' ? '-' : '+'}${formatQuantity(item.quantidade)}`}
          </Text>
        </View>
        
        {item.motivo && item.motivo.trim() && (
          <Text style={styles.motivoTextCompacto} numberOfLines={1}>
            {item.motivo}
          </Text>
        )}
      </View>
    );
  };

  const renderResumoCard = () => {
    if (!resumo) return null;

    return (
      <View style={styles.resumoContainer}>
        <Text style={styles.resumoTitle}>
          Resumo de Movimentações
        </Text>
        
        <View style={styles.resumoGrid}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>
              Total Entradas
            </Text>
            <Text style={[styles.resumoValue, { color: '#22c55e' }]}>
              {`+${formatQuantity(resumo.totalEntradas)}`}
            </Text>
          </View>
          
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>
              Total Saídas
            </Text>
            <Text style={[styles.resumoValue, { color: '#ef4444' }]}>
              {`-${formatQuantity(resumo.totalSaidas)}`}
            </Text>
          </View>
        </View>
        
        <View style={styles.saldoContainer}>
          <Text style={styles.resumoLabel}>
            Saldo das Movimentações
          </Text>
          <Text style={[
            styles.saldoValue,
            { color: resumo.saldoMovimentacao >= 0 ? '#22c55e' : '#ef4444' }
          ]}>
            {resumo.saldoMovimentacao >= 0 ? '+' : ''}{formatQuantity(resumo.saldoMovimentacao)}
          </Text>
        </View>
        
        {resumo.ultimaMovimentacao && (
          <View style={styles.ultimaMovimentacaoContainer}>
            <Text style={styles.resumoLabel}>
              Última Movimentação
            </Text>
            <Text style={styles.ultimaMovimentacaoText}>
              {`${resumo.ultimaMovimentacao.tipo || 'N/A'} - ${formatDateTime(resumo.ultimaMovimentacao.executed_at)}`}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text" size={48} color="#9ca3af" />
      <Text style={styles.emptyTitle}>
        Nenhuma movimentação encontrada
      </Text>
      <Text style={styles.emptySubtitle}>
        Este estoque ainda não possui histórico de movimentações
      </Text>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Histórico de Movimentações
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Informações do Estoque */}
          {estoque && (
            <View style={styles.estoqueInfo}>
              <Text style={styles.medicamentoNome} numberOfLines={1}>
                {estoque.nome_dcb || estoque.nome_dci || 'Medicamento'}
              </Text>
              <View style={styles.estoqueDetalhes}>
                <Text style={styles.codigoText}>
                  {`Cód: ${estoque.codigo_interno || 'N/A'}`}
                </Text>
                <Text style={styles.estoqueAtual}>
                  {`Estoque: ${formatQuantity(estoque.quantidade_atual || 0)}`}
                </Text>
              </View>
            </View>
          )}

          {/* Resumo Compacto */}
          {resumo && (
            <View style={styles.resumoCompacto}>
              <View style={styles.resumoItemCompacto}>
                <Text style={styles.resumoLabel}>Entradas</Text>
                <Text style={[styles.resumoValue, { color: '#22c55e' }]}>
                  {`+${formatQuantity(resumo.totalEntradas)}`}
                </Text>
              </View>
              <View style={styles.resumoItemCompacto}>
                <Text style={styles.resumoLabel}>Saídas</Text>
                <Text style={[styles.resumoValue, { color: '#ef4444' }]}>
                  {`-${formatQuantity(resumo.totalSaidas)}`}
                </Text>
              </View>
              <View style={styles.resumoItemCompacto}>
                <Text style={styles.resumoLabel}>Saldo</Text>
                <Text style={[
                  styles.resumoValue, 
                  { color: resumo.saldoMovimentacao >= 0 ? '#22c55e' : '#ef4444' }
                ]}>
                  {formatQuantity(resumo.saldoMovimentacao)}
                </Text>
              </View>
            </View>
          )}

          {/* Lista de Movimentações */}
          <View style={styles.movimentosContainer}>
            <Text style={styles.sectionTitle}>
              {`Movimentações (${movimentos.length})`}
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando...</Text>
              </View>
            ) : movimentos.length > 0 ? (
              <FlatList
                data={movimentos}
                renderItem={renderMovimentoItemCompacto}
                keyExtractor={(item) => item.id}
                style={styles.movimentosList}
                showsVerticalScrollIndicator={true}
              />
            ) : (
              renderEmptyState()
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal overlay e container
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 600,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    borderRadius: 4,
  },

  // Informações do estoque
  estoqueInfo: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  medicamentoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  estoqueDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codigoText: {
    fontSize: 12,
    color: '#64748b',
  },
  estoqueAtual: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },

  // Resumo compacto
  resumoCompacto: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resumoItemCompacto: {
    flex: 1,
    alignItems: 'center',
  },
  resumoLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
    textAlign: 'center',
  },
  resumoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Container de movimentações
  movimentosContainer: {
    flex: 1,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  // Lista de movimentações
  movimentosList: {
    flex: 1,
  },

  // Item compacto de movimento
  movimentoItemCompacto: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  movimentoRowCompacto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipoContainerCompacto: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tipoTextCompacto: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  dataTextCompacto: {
    fontSize: 11,
    color: '#6b7280',
    flex: 1,
    textAlign: 'center',
  },
  quantidadeCompacta: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: 60,
  },
  motivoTextCompacto: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Loading e empty states
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },

  // Estilos antigos mantidos para compatibilidade
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    maxHeight: '80%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  estoqueNome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  estoqueCodigo: {
    fontSize: 13,
    marginBottom: 2,
    color: '#6b7280',
  },
  estoqueQuantidade: {
    fontSize: 13,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  resumoContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  resumoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  resumoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumoLabel: {
    fontSize: 11,
    marginBottom: 2,
    color: '#6b7280',
  },
  resumoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  saldoContainer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 8,
  },
  saldoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ultimaMovimentacaoContainer: {
    alignItems: 'center',
  },
  ultimaMovimentacaoText: {
    fontSize: 12,
    color: '#111827',
  },
  movimentosSection: {
    flex: 1,
    minHeight: 200, // Altura mínima para a lista
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  movimentosList: {
    flex: 1,
    maxHeight: 300, // Limitar altura da lista
  },
  movimentoItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  movimentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipoText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  dataText: {
    fontSize: 11,
    color: '#6b7280',
  },
  movimentoBody: {
    gap: 4,
  },
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quantidadeLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  quantidadeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  motivoText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#111827',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    color: '#6b7280',
  },
});

export default MovimentosModal;
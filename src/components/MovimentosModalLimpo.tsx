import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

interface ResumoMovimentacoes {
  totalEntradas: number;
  totalSaidas: number;
  saldoMovimentacao: number;
  ultimaMovimentacao?: string;
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

const formatDateTime = (dateString: string): string => {
  try {
    if (!dateString) return 'Data não disponível';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data não disponível';
  }
};

const MovimentosModalCompacto: React.FC<MovimentosModalProps> = ({
  visible,
  estoque,
  onClose,
}) => {
  const [movimentos, setMovimentos] = useState<EstoqueMovimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [resumo, setResumo] = useState<ResumoMovimentacoes | null>(null);

  useEffect(() => {
    if (visible && estoque) {
      const estoqueId = estoque.id;
      if (estoqueId) {
        loadMovimentos(estoqueId.toString());
        loadResumo(estoqueId.toString());
      }
    }
  }, [visible, estoque]);

  const getTipoIcon = (tipo: string): keyof typeof Ionicons.glyphMap => {
    switch (tipo?.toUpperCase()) {
      case 'ENTRADA':
        return 'add-circle';
      case 'SAIDA':
        return 'remove-circle';
      case 'AJUSTE':
        return 'settings';
      default:
        return 'help-circle';
    }
  };

  const getTipoColor = (tipo: string): string => {
    switch (tipo?.toUpperCase()) {
      case 'ENTRADA':
        return '#22c55e';
      case 'SAIDA':
        return '#ef4444';
      case 'AJUSTE':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const loadMovimentos = async (estoqueId: string) => {
    try {
      setLoading(true);
      console.log('🔄 Carregando movimentos para estoque:', estoqueId);
      
      const response = await estoqueMovimentosService.getByEstoqueId(estoqueId);
      
      if (response && Array.isArray(response)) {
        const movimentosOrdenados = response.sort((a, b) => {
          const dataA = new Date(a.executed_at || '').getTime();
          const dataB = new Date(b.executed_at || '').getTime();
          return dataB - dataA;
        });
        
        setMovimentos(movimentosOrdenados);
        console.log('✅ Movimentos carregados:', movimentosOrdenados.length);
      } else {
        setMovimentos([]);
        console.warn('⚠️ Resposta inválida da API:', response);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar movimentos:', error);
      setMovimentos([]);
      Alert.alert('Erro', 'Não foi possível carregar as movimentações');
    } finally {
      setLoading(false);
    }
  };

  const loadResumo = async (estoqueId: string) => {
    try {
      console.log('🔄 Carregando resumo para estoque:', estoqueId);
      
      const response = await estoqueMovimentosService.getByEstoqueId(estoqueId);
      
      if (response && Array.isArray(response)) {
        const totalEntradas = response
          .filter(m => m.tipo?.toUpperCase() === 'ENTRADA')
          .reduce((sum, m) => sum + (m.quantidade || 0), 0);
        
        const totalSaidas = response
          .filter(m => m.tipo?.toUpperCase() === 'SAIDA')
          .reduce((sum, m) => sum + (m.quantidade || 0), 0);
        
        const saldoMovimentacao = totalEntradas - totalSaidas;
        
        const ultimaMovimentacao = response.length > 0 
          ? response.sort((a, b) => {
              const dataA = new Date(a.executed_at || '').getTime();
              const dataB = new Date(b.executed_at || '').getTime();
              return dataB - dataA;
            })[0]?.executed_at
          : undefined;

        setResumo({
          totalEntradas,
          totalSaidas,
          saldoMovimentacao,
          ultimaMovimentacao,
        });
      }
      
      console.log('✅ Resumo carregado');
    } catch (error) {
      console.error('❌ Erro ao buscar resumo:', error);
    }
  };

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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text" size={48} color="#9ca3af" />
      <Text style={styles.emptyTitle}>Nenhuma movimentação encontrada</Text>
      <Text style={styles.emptySubtitle}>Este medicamento ainda não possui movimentações registradas</Text>
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
          <View style={styles.header}>
            <Text style={styles.title}>Histórico de Movimentações</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

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
  movimentosList: {
    flex: 1,
  },
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
});

export default MovimentosModalCompacto;
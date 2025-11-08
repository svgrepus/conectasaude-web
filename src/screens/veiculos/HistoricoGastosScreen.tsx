import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { DatePicker } from '../../components/DatePicker';
import { Dropdown } from '../../components/Dropdown';
import { GastoForm } from '../../components/GastoForm';
import { 
  veiculosService, 
  VeiculoGasto, 
  GastoFormData,
  FORMAS_PAGAMENTO,
  Veiculo
} from '../../services/veiculosService';

interface HistoricoGastosScreenProps {
  veiculo: Veiculo;
  onClose: () => void;
}

// Função auxiliar para download de arquivos
const downloadFile = async (blob: Blob, fileName: string) => {
  try {
    // Para web
    if (typeof window !== 'undefined' && window.document) {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // Para mobile - tentar usar APIs nativas se disponíveis
    // Por enquanto, apenas log para desenvolvimento futuro
    console.log('Download solicitado para mobile:', fileName);
    throw new Error('Download em mobile será implementado em breve');

  } catch (error) {
    console.error('Erro no download:', error);
    throw error;
  }
};

export const HistoricoGastosScreen: React.FC<HistoricoGastosScreenProps> = ({ 
  veiculo, 
  onClose 
}) => {
  const [gastos, setGastos] = useState<VeiculoGasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState<VeiculoGasto | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<VeiculoGasto | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filtros
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    fornecedor: '',
    forma_pagamento: '',
    valor_min: '',
    valor_max: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Resumo
  const [resumo, setResumo] = useState({
    total_periodo: 0,
    total_geral: 0,
    total_registros: 0
  });

  const itemsPerPage = 20;
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const fetchGastos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const filtrosAPI: any = {
        veiculo_id: veiculo.id,
        limit: 1000,
        offset: 0
      };

      // Aplicar filtros se preenchidos
      if (filtros.data_inicio) {
        filtrosAPI.data_inicio = filtros.data_inicio;
      }
      if (filtros.data_fim) {
        filtrosAPI.data_fim = filtros.data_fim;
      }
      if (filtros.fornecedor.trim()) {
        filtrosAPI.fornecedor = filtros.fornecedor.trim();
      }
      if (filtros.forma_pagamento) {
        filtrosAPI.forma_pagamento = filtros.forma_pagamento;
      }
      if (filtros.valor_min) {
        filtrosAPI.valor_min = parseFloat(filtros.valor_min);
      }
      if (filtros.valor_max) {
        filtrosAPI.valor_max = parseFloat(filtros.valor_max);
      }

      const response = await veiculosService.buscarGastos(filtrosAPI);
      
      if (response.success) {
        setGastos(response.data || []);
        setResumo({
          total_periodo: response.summary?.total_periodo || 0,
          total_geral: response.summary?.total_geral || 0,
          total_registros: response.data?.length || 0
        });
      } else {
        setError(response.error || 'Erro ao carregar gastos');
      }
    } catch (err) {
      console.error('Erro ao buscar gastos:', err);
      setError('Erro ao carregar gastos');
    } finally {
      setLoading(false);
    }
  }, [veiculo.id, filtros]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  // Paginação local
  const totalPages = Math.ceil(gastos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGastos = gastos.slice(startIndex, endIndex);

  const handleAdd = () => {
    setSelectedGasto(null);
    setFormVisible(true);
  };

  const handleEdit = (item: VeiculoGasto) => {
    setSelectedGasto(item);
    setFormVisible(true);
  };

  const handleFormSubmit = async (data: GastoFormData) => {
    try {
      setError('');
      
      let response;
      if (selectedGasto) {
        response = await veiculosService.atualizarGasto(selectedGasto.id, data);
        setSuccessMessage('Gasto atualizado com sucesso!');
      } else {
        response = await veiculosService.criarGasto(data);
        setSuccessMessage('Gasto registrado com sucesso!');
      }

      if (!response.success) {
        throw new Error(response.error || 'Erro ao salvar gasto');
      }
      
      setFormVisible(false);
      setSelectedGasto(null);
      await fetchGastos();
      setSuccessVisible(true);
      
    } catch (err) {
      console.error('Erro ao salvar gasto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar gasto');
    }
  };

  const handleDelete = (item: VeiculoGasto) => {
    setItemToDelete(item);
    setConfirmDeleteVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setError('');
      
      const response = await veiculosService.excluirGasto(
        itemToDelete.id,
        `Exclusão do gasto "${itemToDelete.descricao}" de ${veiculosService.formatarMoeda(itemToDelete.valor_total)} via aplicativo`
      );

      if (!response.success) {
        throw new Error(response.error || 'Erro ao excluir gasto');
      }

      setConfirmDeleteVisible(false);
      setItemToDelete(null);
      setSuccessMessage('Gasto excluído com sucesso!');
      await fetchGastos();
      setSuccessVisible(true);
      
    } catch (err) {
      console.error('Erro ao excluir gasto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir gasto');
      setConfirmDeleteVisible(false);
      setItemToDelete(null);
    }
  };

  const handleExport = async () => {
    try {
      if (gastos.length === 0) {
        Alert.alert('Aviso', 'Não há gastos para exportar.');
        return;
      }

      setLoading(true);

      // Preparar dados para exportação
      const dadosParaExportacao = gastos.map((gasto, index) => ({
        'Nº': index + 1,
        'Data': veiculosService.formatarData(gasto.data_gasto),
        'Descrição': gasto.descricao,
        'Fornecedor': gasto.fornecedor,
        'Quantidade': gasto.quantidade,
        'Valor Unit.': `R$ ${gasto.valor_unitario.toFixed(2).replace('.', ',')}`,
        'Valor Total': veiculosService.formatarMoeda(gasto.valor_total),
        'Forma Pgto.': FORMAS_PAGAMENTO.find(f => f.value === gasto.forma_pagamento)?.label || gasto.forma_pagamento,
        'Observações': gasto.observacoes || '-'
      }));

      // Criar conteúdo CSV
      const headers = Object.keys(dadosParaExportacao[0]);
      const csvContent = [
        // Cabeçalho com informações do veículo
        [`Relatório de Gastos - ${veiculosService.formatarVeiculoCompleto(veiculo)}`],
        [`Período: ${filtros.data_inicio ? veiculosService.formatarData(filtros.data_inicio) : 'Início'} até ${filtros.data_fim ? veiculosService.formatarData(filtros.data_fim) : 'Hoje'}`],
        [`Total de Registros: ${gastos.length}`],
        [`Total Geral: ${veiculosService.formatarMoeda(resumo.total_periodo)}`],
        [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
        [''], // Linha vazia
        // Cabeçalhos das colunas
        headers,
        // Dados
        ...dadosParaExportacao.map(row => headers.map(header => row[header as keyof typeof row]))
      ]
        .map(row => row.join(';'))
        .join('\n');

      // Criar e baixar arquivo
      const blob = new Blob(['\ufeff' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });

      const fileName = `gastos_${veiculo.marca}_${veiculo.modelo}_${veiculo.placa.replace('-', '')}_${new Date().toISOString().split('T')[0]}.csv`;

      // Download para diferentes plataformas
      await downloadFile(blob, fileName);

      Alert.alert(
        'Exportação Concluída', 
        `Arquivo "${fileName}" foi baixado com sucesso!\n\nContém ${gastos.length} registro(s) de gastos.\n\nTotal: ${veiculosService.formatarMoeda(resumo.total_periodo)}`
      );

    } catch (error) {
      console.error('Erro ao exportar gastos:', error);
      Alert.alert('Erro', 'Não foi possível exportar os gastos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      data_inicio: '',
      data_fim: '',
      fornecedor: '',
      forma_pagamento: '',
      valor_min: '',
      valor_max: ''
    });
    setCurrentPage(1);
  };

  const renderGastoItem = ({ item }: { item: VeiculoGasto }) => (
    <View style={[styles.itemContainer, { backgroundColor: currentTheme.card }]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: currentTheme.text }]}>
            {item.descricao}
          </Text>
          <Text style={[styles.itemSubtitle, { color: currentTheme.mutedForeground }]}>
            {item.fornecedor} • {veiculosService.formatarData(item.data_gasto)}
          </Text>
          <Text style={[styles.itemSubtitle, { color: currentTheme.mutedForeground }]}>
            Qtd: {item.quantidade} × {veiculosService.formatarMoeda(item.valor_unitario)}
          </Text>
          <Text style={[styles.itemSubtitle, { color: currentTheme.mutedForeground }]}>
            Pagamento: {FORMAS_PAGAMENTO.find(f => f.value === item.forma_pagamento)?.label}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <Text style={[styles.valorTotal, { color: currentTheme.text }]}>
            {veiculosService.formatarMoeda(item.valor_total)}
          </Text>
        </View>
      </View>

      <View style={styles.itemFooter}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#dbeafe' }]}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="pencil" size={16} color="#2563eb" />
          <Text style={[styles.actionButtonText, { color: '#2563eb' }]}>
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#fee2e2' }]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash" size={16} color="#dc2626" />
          <Text style={[styles.actionButtonText, { color: '#dc2626' }]}>
            Excluir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
            Histórico de Gastos
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.mutedForeground }]}>
            {veiculosService.formatarVeiculoCompleto(veiculo)}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Novo Gasto</Text>
        </TouchableOpacity>
      </View>

      {/* Resumo */}
      <View style={[styles.resumoContainer, { backgroundColor: currentTheme.card }]}>
        <View style={styles.resumoItem}>
          <Text style={[styles.resumoLabel, { color: currentTheme.mutedForeground }]}>
            Total do Período
          </Text>
          <Text style={[styles.resumoValor, { color: currentTheme.text }]}>
            {veiculosService.formatarMoeda(resumo.total_periodo)}
          </Text>
        </View>
        <View style={styles.resumoItem}>
          <Text style={[styles.resumoLabel, { color: currentTheme.mutedForeground }]}>
            Total Geral
          </Text>
          <Text style={[styles.resumoValor, { color: currentTheme.text }]}>
            {veiculosService.formatarMoeda(resumo.total_geral)}
          </Text>
        </View>
        <View style={styles.resumoItem}>
          <Text style={[styles.resumoLabel, { color: currentTheme.mutedForeground }]}>
            Registros
          </Text>
          <Text style={[styles.resumoValor, { color: currentTheme.text }]}>
            {resumo.total_registros}
          </Text>
        </View>
      </View>

      {/* Barra de Ações */}
      <View style={[styles.actionsContainer, { backgroundColor: currentTheme.card }]}>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={16} color={showFilters ? '#ffffff' : currentTheme.text} />
          <Text style={[
            styles.filterButtonText, 
            { color: showFilters ? '#ffffff' : currentTheme.text }
          ]}>
            Filtros
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, loading && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={loading}
        >
          <Ionicons 
            name={loading ? "hourglass" : "download"} 
            size={16} 
            color={loading ? "#9ca3af" : "#374151"} 
          />
          <Text style={[styles.exportButtonText, { 
            color: loading ? "#9ca3af" : "#374151" 
          }]}>
            {loading ? 'Exportando...' : 'Exportar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: currentTheme.card }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContent}>
              {/* Data Início */}
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: currentTheme.text }]}>
                  Data Início
                </Text>
                <DatePicker
                  value={filtros.data_inicio}
                  onDateChange={(date) => setFiltros(prev => ({ ...prev, data_inicio: date }))}
                  placeholder="DD/MM/AAAA"
                />
              </View>

              {/* Data Fim */}
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: currentTheme.text }]}>
                  Data Fim
                </Text>
                <DatePicker
                  value={filtros.data_fim}
                  onDateChange={(date) => setFiltros(prev => ({ ...prev, data_fim: date }))}
                  placeholder="DD/MM/AAAA"
                />
              </View>

              {/* Fornecedor */}
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: currentTheme.text }]}>
                  Fornecedor
                </Text>
                <TextInput
                  style={[styles.filterInput, { 
                    color: currentTheme.text,
                    borderColor: currentTheme.border
                  }]}
                  value={filtros.fornecedor}
                  onChangeText={(text) => setFiltros(prev => ({ ...prev, fornecedor: text }))}
                  placeholder="Nome do fornecedor"
                  placeholderTextColor={currentTheme.mutedForeground}
                />
              </View>

              {/* Forma de Pagamento */}
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: currentTheme.text }]}>
                  Forma de Pagamento
                </Text>
                <Dropdown
                  items={[
                    { label: 'Todas', value: '' },
                    ...FORMAS_PAGAMENTO.map(f => ({ label: f.label, value: f.value }))
                  ]}
                  selectedValue={filtros.forma_pagamento}
                  onValueChange={(value) => setFiltros(prev => ({ ...prev, forma_pagamento: value }))}
                  placeholder="Selecione"
                />
              </View>

              {/* Valor Mínimo */}
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: currentTheme.text }]}>
                  Valor Mínimo
                </Text>
                <TextInput
                  style={[styles.filterInput, { 
                    color: currentTheme.text,
                    borderColor: currentTheme.border
                  }]}
                  value={filtros.valor_min}
                  onChangeText={(text) => setFiltros(prev => ({ ...prev, valor_min: text }))}
                  placeholder="R$ 0,00"
                  placeholderTextColor={currentTheme.mutedForeground}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Valor Máximo */}
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: currentTheme.text }]}>
                  Valor Máximo
                </Text>
                <TextInput
                  style={[styles.filterInput, { 
                    color: currentTheme.text,
                    borderColor: currentTheme.border
                  }]}
                  value={filtros.valor_max}
                  onChangeText={(text) => setFiltros(prev => ({ ...prev, valor_max: text }))}
                  placeholder="R$ 0,00"
                  placeholderTextColor={currentTheme.mutedForeground}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.filtersActions}>
            <TouchableOpacity
              style={[styles.clearFiltersButton]}
              onPress={limparFiltros}
            >
              <Text style={styles.clearFiltersText}>Limpar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lista */}
      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchGastos}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={currentGastos}
              renderItem={renderGastoItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              refreshing={loading}
              onRefresh={fetchGastos}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cash-outline" size={48} color={currentTheme.mutedForeground} />
                  <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                    Nenhum gasto encontrado
                  </Text>
                  <Text style={[styles.emptySubtext, { color: currentTheme.mutedForeground }]}>
                    Registre o primeiro gasto deste veículo
                  </Text>
                </View>
              }
            />

            {/* Paginação */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? '#9ca3af' : '#374151'} />
                </TouchableOpacity>

                <Text style={[styles.paginationText, { color: currentTheme.text }]}>
                  {currentPage} de {totalPages}
                </Text>

                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? '#9ca3af' : '#374151'} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Formulário de Gasto */}
      <GastoForm
        visible={formVisible}
        onClose={() => {
          setFormVisible(false);
          setSelectedGasto(null);
        }}
        onSave={handleFormSubmit}
        gasto={selectedGasto}
        veiculoId={veiculo.id}
      />

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={confirmDeleteVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.card }]}>
            <Ionicons name="warning" size={48} color="#f59e0b" />
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Confirmar Exclusão
            </Text>
            <Text style={[styles.modalText, { color: currentTheme.mutedForeground }]}>
              Tem certeza que deseja excluir o gasto{'\n'}
              <Text style={{ fontWeight: '600' }}>
                {itemToDelete?.descricao}
              </Text>?
            </Text>
            <Text style={[styles.modalSubtext, { color: currentTheme.mutedForeground }]}>
              Esta ação não pode ser desfeita.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmDeleteVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Sucesso */}
      <Modal
        visible={successVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.card }]}>
            <Ionicons name="checkmark-circle" size={48} color="#10b981" />
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Sucesso!
            </Text>
            <Text style={[styles.modalText, { color: currentTheme.mutedForeground }]}>
              {successMessage}
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.successButton]}
              onPress={() => setSuccessVisible(false)}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.light.border,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  resumoContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.light.border,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.light.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.light.border,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: theme.light.primary,
    borderColor: theme.light.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.light.border,
    paddingVertical: 16,
  },
  filtersContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  filterItem: {
    width: 150,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  filterInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
  },
  filtersActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  valorTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  itemFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: theme.light.background,
    borderWidth: 1,
    borderColor: theme.light.border,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.light.border,
  },
  cancelButtonText: {
    color: theme.light.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  successButton: {
    backgroundColor: theme.light.primary,
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
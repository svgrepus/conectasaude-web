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
import { 
  veiculosService, 
  Veiculo, 
  VeiculoFormData,
  SITUACOES_VEICULO 
} from '../../services/veiculosService';
import { VeiculoForm } from '../../components/VeiculoForm';
import { HistoricoGastosScreen } from './HistoricoGastosScreen';

export const VeiculosScreen: React.FC = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Veiculo | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS');
  const [showHistoricoGastos, setShowHistoricoGastos] = useState(false);
  const [selectedVeiculoGastos, setSelectedVeiculoGastos] = useState<Veiculo | null>(null);

  const itemsPerPage = 10;
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const fetchVeiculos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 VeiculosScreen: Iniciando busca de veículos...');
      
      const filtros: any = {
        limit: 1000,
        offset: 0
      };

      if (searchQuery.trim()) {
        // Se tem busca, filtra por marca, modelo ou placa
        filtros.marca = searchQuery.trim();
      }

      if (filtroSituacao !== 'TODOS') {
        filtros.situacao = filtroSituacao;
      }

      console.log('📋 VeiculosScreen: Filtros aplicados:', filtros);
      const response = await veiculosService.buscar(filtros);
      
      console.log('📦 VeiculosScreen: Resposta do serviço:', {
        success: response.success,
        dataLength: Array.isArray(response.data) ? response.data.length : 0,
        error: response.error
      });
      
      if (response.success && response.data) {
        // Garantir que sempre seja um array, mesmo que vazio
        const veiculosData = Array.isArray(response.data) ? response.data : [];
        console.log('✅ VeiculosScreen: Veículos carregados:', veiculosData.length);
        setVeiculos(veiculosData);
        setError(''); // Limpar erro anterior
      } else {
        console.error('❌ VeiculosScreen: Erro na resposta:', response.error);
        setError(response.error || 'Erro ao carregar veículos');
        setVeiculos([]); // Resetar para array vazio em caso de erro
      }
    } catch (err) {
      console.error('❌ VeiculosScreen: Erro ao buscar veículos:', err);
      setError('Erro ao carregar veículos');
      setVeiculos([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filtroSituacao]);

  const searchVeiculos = useCallback(async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Carregar dados inicialmente
  useEffect(() => {
    fetchVeiculos();
  }, []); // Array vazio = executa apenas na montagem

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVeiculos();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filtroSituacao]);

  // Aplicar filtros e paginação localmente
  const filteredVeiculos = Array.isArray(veiculos) ? veiculos.filter(veiculo => {
    const matchesSearch = !searchQuery.trim() || 
      veiculo.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veiculo.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veiculo.placa.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) : [];

  const totalPages = Math.ceil(filteredVeiculos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVeiculos = filteredVeiculos.slice(startIndex, endIndex);

  const handleEdit = (item: Veiculo) => {
    setSelectedVeiculo(item);
    setFormVisible(true);
  };

  const handleAdd = () => {
    setSelectedVeiculo(null);
    setFormVisible(true);
  };

  const handleFormSubmit = async (data: VeiculoFormData) => {
    try {
      setError('');
      
      let response;
      if (selectedVeiculo) {
        response = await veiculosService.atualizar(selectedVeiculo.id, data);
      } else {
        response = await veiculosService.criar(data);
      }

      if (!response.success) {
        // NÃO fechar o formulário quando há erro
        console.error('Erro ao salvar veículo:', response.error);
        setError(response.error || 'Erro ao salvar veículo');
        return; // Para aqui, mantém o formulário aberto
      }
      
      // Só fecha o formulário e mostra sucesso se deu certo
      setFormVisible(false);
      setSelectedVeiculo(null);
      await fetchVeiculos();
      setSuccessMessage(selectedVeiculo ? 'Veículo atualizado com sucesso!' : 'Veículo criado com sucesso!');
      setSuccessVisible(true);
      
    } catch (err) {
      console.error('Erro ao salvar veículo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar veículo');
      // NÃO fechar o formulário quando há erro
    }
  };

  const handleDelete = (item: Veiculo) => {
    setItemToDelete(item);
    setConfirmDeleteVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setError('');
      
      const response = await veiculosService.excluir(
        itemToDelete.id, 
        `Exclusão do veículo ${itemToDelete.marca} ${itemToDelete.modelo} (${itemToDelete.placa}) via aplicativo`
      );

      if (!response.success) {
        throw new Error(response.error || 'Erro ao excluir veículo');
      }

      setConfirmDeleteVisible(false);
      setItemToDelete(null);
      setSuccessMessage('Veículo excluído com sucesso!');
      await fetchVeiculos();
      setSuccessVisible(true);
      
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir veículo');
      setConfirmDeleteVisible(false);
      setItemToDelete(null);
    }
  };

  const handleHistoricoGastos = (veiculo: Veiculo) => {
    setSelectedVeiculoGastos(veiculo);
    setShowHistoricoGastos(true);
  };

  const renderVeiculoItem = ({ item }: { item: Veiculo }) => (
    <View style={[styles.tableRow, { borderBottomColor: currentTheme.border }]}>
      <View style={styles.nameCell}>
        <Text style={[styles.cellText, { color: currentTheme.text }]} numberOfLines={1}>
          {item.marca} {item.modelo}
        </Text>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]} numberOfLines={1}>
          Placa: {item.placa}
        </Text>
        {item.tipo_veiculo_nome && (
          <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground, fontSize: 10 }]} numberOfLines={1}>
            {item.tipo_veiculo_nome}
          </Text>
        )}
      </View>
      <View style={styles.yearCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.ano_fabricacao}
        </Text>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground, fontSize: 10 }]}>
          {item.capacidade_passageiros} pass.
        </Text>
      </View>
      <View style={styles.fuelCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground, fontSize: 12 }]}>
          {item.tipo_combustivel}
        </Text>
        {item.autonomia_combustivel && (
          <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground, fontSize: 10 }]}>
            {item.autonomia_combustivel.toFixed(1)} km/l
          </Text>
        )}
      </View>
      <View style={styles.statusCell}>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.situacao === 'ATIVO' ? '#10b981' : '#ef4444' }
        ]}>
          <Text style={styles.statusText}>
            {item.situacao}
          </Text>
        </View>
      </View>
      <View style={styles.actionCell}>
        <TouchableOpacity
          style={styles.gastosButton}
          onPress={() => handleHistoricoGastos(item)}
        >
          <Ionicons name="cash-outline" size={16} color="#16a34a" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.editButtonText}>
            Editar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>
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
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          Veículos
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Novo Veículo</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={[styles.filtersContainer, { backgroundColor: currentTheme.card }]}>
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={currentTheme.mutedForeground} 
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { 
              color: currentTheme.text,
              backgroundColor: currentTheme.background
            }]}
            placeholder="Buscar por marca, modelo ou placa..."
            placeholderTextColor={currentTheme.mutedForeground}
            value={searchQuery}
            onChangeText={searchVeiculos}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {['TODOS', 'ATIVO', 'INATIVO'].map((situacao) => (
            <TouchableOpacity
              key={situacao}
              style={[
                styles.filterChip,
                filtroSituacao === situacao && styles.filterChipActive
              ]}
              onPress={() => setFiltroSituacao(situacao as any)}
            >
              <Text style={[
                styles.filterChipText,
                filtroSituacao === situacao && styles.filterChipTextActive
              ]}>
                {situacao === 'TODOS' ? 'Todos' : situacao}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista */}
      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchVeiculos}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Tabela */}
            {loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="car-outline" size={64} color={currentTheme.mutedForeground} />
                <Text style={[styles.emptyText, { color: currentTheme.text }]}>
                  Carregando veículos...
                </Text>
              </View>
            ) : (
              <View style={[styles.tableContainer, { 
                backgroundColor: currentTheme.card, 
                borderColor: currentTheme.border 
              }]}>
                {/* Table Header */}
                <View style={[styles.tableHeader, { backgroundColor: currentTheme.muted }]}>
                  <View style={styles.nameCell}>
                    <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                      Veículo / Placa
                    </Text>
                  </View>
                  <View style={styles.yearCell}>
                    <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                      Ano / Cap.
                    </Text>
                  </View>
                  <View style={styles.fuelCell}>
                    <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                      Combustível
                    </Text>
                  </View>
                  <View style={styles.statusCell}>
                    <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                      Status
                    </Text>
                  </View>
                  <View style={styles.actionCell}>
                    <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                      Ações
                    </Text>
                  </View>
                </View>

                {/* Lista */}
                <FlatList
                  data={currentVeiculos}
                  renderItem={renderVeiculoItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 400 }}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="car-outline" size={64} color={currentTheme.mutedForeground} />
                      <Text style={[styles.emptyText, { color: currentTheme.text }]}>
                        Nenhum veículo encontrado
                      </Text>
                      <Text style={[styles.emptySubtext, { color: currentTheme.mutedForeground }]}>
                        {searchQuery ? 'Tente ajustar os filtros de busca' : 'Toque no botão Adicionar para cadastrar o primeiro veículo'}
                      </Text>
                    </View>
                  }
                />
              </View>
            )}
          </>
        )}

        {/* Total */}
        {!loading && (
          <View style={styles.totalContainer}>
            <Text style={[styles.totalText, { color: currentTheme.text }]}>
              Total: {filteredVeiculos.length} veículo{filteredVeiculos.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Formulário Modal */}
      <VeiculoForm
        visible={formVisible}
        onClose={() => {
          setFormVisible(false);
          setSelectedVeiculo(null);
          setError(''); // Limpar erro ao fechar
        }}
        onSave={handleFormSubmit}
        veiculo={selectedVeiculo}
        externalError={error}
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
              Tem certeza que deseja excluir o veículo{'\n'}
              <Text style={{ fontWeight: '600' }}>
                {itemToDelete?.marca} {itemToDelete?.modelo} ({itemToDelete?.placa})
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
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalDeleteButtonText}>Excluir</Text>
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

      {/* Tela de Histórico de Gastos */}
      {showHistoricoGastos && selectedVeiculoGastos && (
        <Modal
          visible={showHistoricoGastos}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <HistoricoGastosScreen
            veiculo={selectedVeiculoGastos}
            onClose={() => {
              setShowHistoricoGastos(false);
              setSelectedVeiculoGastos(null);
            }}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default VeiculosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.light.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
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
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.light.border,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.light.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.light.background,
    borderWidth: 1,
    borderColor: theme.light.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.light.primary,
    borderColor: theme.light.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: theme.light.mutedForeground,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  tableContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  nameCell: {
    flex: 3,
    paddingRight: 8,
  },
  yearCell: {
    flex: 1.5,
    paddingRight: 8,
  },
  fuelCell: {
    flex: 1.5,
    paddingRight: 8,
  },
  statusCell: {
    flex: 1,
    paddingRight: 8,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  dateCell: {
    flex: 2,
    paddingRight: 8,
  },
  actionCell: {
    flex: 2.5,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cellText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  cellTextSecondary: {
    fontSize: 12,
  },
  gastosButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  gastosButtonText: {
    color: "#8A9E8E",
    fontSize: 12,
    fontWeight: "500",
  },
  editButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  editButtonText: {
    color: "#8A9E8E",
    fontSize: 12,
    fontWeight: "500",
  },
  deleteButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  deleteButtonText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "500",
  },
  totalContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "500",
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
  modalDeleteButton: {
    backgroundColor: '#dc2626',
  },
  modalDeleteButtonText: {
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
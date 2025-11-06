import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { medicamentosEstoqueService, MedicamentoEstoque } from '../../services/medicamentosEstoqueService';
import EstoqueMedicamentoForm from '../../components/EstoqueMedicamentoForm';
import { MovimentosModal } from '../../components/MovimentosModal';
import SaidaEstoqueModal from '../../components/SaidaEstoqueModal';
import ExcluirEstoqueModal from '../../components/ExcluirEstoqueModal';

const EstoqueMedicamentosScreen: React.FC = () => {
  const [estoques, setEstoques] = useState<MedicamentoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Estados para modais
  const [formVisible, setFormVisible] = useState(false);
  const [selectedEstoque, setSelectedEstoque] = useState<MedicamentoEstoque | null>(null);
  const [showMovimentos, setShowMovimentos] = useState(false);
  const [showSaidaModal, setShowSaidaModal] = useState(false);
  const [showExcluirModal, setShowExcluirModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MedicamentoEstoque | null>(null);
  const [itemParaExcluir, setItemParaExcluir] = useState<MedicamentoEstoque | null>(null); // Backup do item
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const itemsPerPage = 10;
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const fetchEstoques = useCallback(async () => {
    try {
      console.log('🎯 INÍCIO fetchEstoques - função chamada!');
      setLoading(true);
      setError('');
      console.log('🔄 Buscando estoque de medicamentos...');
      
      const response = await medicamentosEstoqueService.getAll();
      console.log('✅ Estoque recebido:', response);
      console.log('✅ Quantidade de itens:', response.length);
      console.log('✅ Primeiro item:', response[0]);
      setEstoques(response);
      console.log('📝 Estado estoques atualizado com', response.length, 'itens');
    } catch (err: any) {
      console.error('❌ Erro ao buscar estoque:', err);
      
      let errorMessage = 'Erro ao carregar estoque de medicamentos. Tente novamente.';
      if (err?.message) {
        errorMessage = `Erro ao carregar: ${err.message}`;
      }
      
      Alert.alert('Erro ao Carregar', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchEstoques = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchEstoques();
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await medicamentosEstoqueService.getAll({ medicamento_nome: query });
      setEstoques(response);
    } catch (err) {
      console.error('Erro ao buscar estoque:', err);
      Alert.alert(
        'Erro',
        'Erro ao buscar estoque. Tente novamente.',
        [{ text: 'OK' }]
      );
      setError('Erro ao buscar estoque');
    } finally {
      setLoading(false);
    }
  }, [fetchEstoques]);

  useFocusEffect(
    useCallback(() => {
      console.log('🎯 useFocusEffect executado - chamando fetchEstoques...');
      fetchEstoques();
    }, [fetchEstoques])
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchEstoques(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchEstoques]);

  // Debug: monitorar mudanças no successVisible
  useEffect(() => {
    console.log('🔍 Debug: successVisible mudou para:', successVisible);
    console.log('🔍 Debug: successMessage:', successMessage);
  }, [successVisible, successMessage]);

  const totalPages = Math.ceil(estoques.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEstoques = estoques.slice(startIndex, endIndex);

  console.log('🔍 Debug renderização:');
  console.log('- estoques.length:', estoques.length);
  console.log('- currentEstoques.length:', currentEstoques.length);
  console.log('- loading:', loading);
  console.log('- error:', error);

  const handleEdit = (item: MedicamentoEstoque) => {
    setSelectedEstoque(item);
    setFormVisible(true);
  };

  const handleAdd = () => {
    setSelectedEstoque(null);
    setFormVisible(true);
  };

  const handleSaveEstoque = async (data: any) => {
    try {
      setLoading(true);
      console.log('🎯 INÍCIO handleSaveEstoque');
      
      if (selectedEstoque?.id) {
        console.log('🔄 Atualizando estoque:', selectedEstoque.id);
        await medicamentosEstoqueService.update(selectedEstoque.id, data);
        console.log('✅ Estoque atualizado com sucesso!');
        setSuccessMessage('Estoque atualizado com sucesso!');
        console.log('✅ Mensagem de sucesso definida');
      } else {
        console.log('➕ Criando novo estoque');
        await medicamentosEstoqueService.create(data);
        console.log('✅ Estoque cadastrado com sucesso!');
        setSuccessMessage('Estoque cadastrado com sucesso!');
        console.log('✅ Mensagem de sucesso definida');
      }
      
      console.log('🔄 Fechando formulário...');
      setFormVisible(false);
      console.log('🔄 Limpando estoque selecionado...');
      setSelectedEstoque(null);
      console.log('🔄 Recarregando lista de estoques...');
      await fetchEstoques();
      console.log('✅ Lista recarregada, mostrando modal de sucesso...');
      
      setSuccessMessage(selectedEstoque?.id ? 'Estoque atualizado com sucesso!' : 'Estoque cadastrado com sucesso!');
      setSuccessVisible(true);
      console.log('✅ Modal de sucesso ativado, successVisible:', true);
    } catch (err: any) {
      console.error('❌ Erro ao salvar estoque:', err);
      
      let errorMessage = 'Erro ao salvar estoque. Tente novamente.';
      
      if (err.code === '23505') {
        errorMessage = 'Já existe um estoque para este medicamento, unidade e lote. Por favor, verifique os dados.';
      } else if (err.code === '23514') {
        errorMessage = 'Dados inválidos: Verifique se a quantidade máxima é maior ou igual à quantidade mínima.';
      } else if (err.code === '22008') {
        errorMessage = 'Data inválida. Verifique o formato das datas (DD/MM/AAAA).';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Erro', errorMessage, [{ text: 'OK' }]);
    } finally {
      console.log('🔄 Finalizando handleSaveEstoque...');
      setLoading(false);
      console.log('✅ handleSaveEstoque finalizado');
    }
  };

  const handleDelete = (item: MedicamentoEstoque) => {
    console.log('🎯 handleDelete chamado com item:', item?.id);
    console.log('🔍 Item completo:', JSON.stringify(item, null, 2));
    setItemToDelete(item);
    setItemParaExcluir(item); // Backup em estado separado
    setShowExcluirModal(true);
  };

  const handleCancelExclusao = () => {
    console.log('🚫 Usuário cancelou a exclusão');
    setShowExcluirModal(false);
    setItemToDelete(null);
    setItemParaExcluir(null);
  };

  const handleConfirmSoftDelete = async (motivo: string, itemPassado?: MedicamentoEstoque) => {
    console.log('🎯 handleConfirmSoftDelete iniciado');
    console.log('📝 Parâmetros recebidos:', { 
      motivo, 
      itemPassado: itemPassado?.id,
      itemToDelete: itemToDelete?.id,
      itemParaExcluir: itemParaExcluir?.id 
    });
    
    // Tentar múltiplas fontes para o item
    const item = itemPassado || itemParaExcluir || itemToDelete;
    console.log('🔍 Item final selecionado:', {
      id: item?.id,
      lote: item?.lote,
      nome: item?.nome_dcb || item?.nome_dci,
      itemCompleto: item
    });
    
    // Verificar se temos ID válido ou pelo menos dados suficientes
    const itemId = item?.id || item?.estoque_id;
    console.log('🆔 ID encontrado:', itemId);
    
    if (!itemId) {
      console.log('❌ Nenhum ID válido encontrado');
      console.log('🔍 Estados atuais:', {
        itemPassado,
        itemParaExcluir,
        itemToDelete
      });
      Alert.alert('Erro', 'ID do item não encontrado para exclusão. Tente novamente.');
      return;
    }

    try {
      console.log('⏳ Iniciando processo de exclusão...');
      setLoading(true);
      console.log('🗑️ Excluindo estoque:', itemId, 'Motivo:', motivo);
      
      console.log('📞 Chamando medicamentosEstoqueService.excluirEstoque...');
      
      const result = await medicamentosEstoqueService.excluirEstoque(itemId, motivo);
      console.log('📞 Resultado da exclusão recebido:', result);
      
      if (result.success) {
        console.log('✅ Estoque excluído com sucesso!');
        const mensagem = `Estoque excluído com sucesso!\n\nMedicamento: ${result.medicamento}\nLote: ${result.lote}\nQuantidade: ${result.quantidade_excluida}`;
        setSuccessMessage(mensagem);
        await fetchEstoques();
        setSuccessVisible(true);
      } else {
        console.log('❌ Falha na exclusão:', result.error);
        Alert.alert('Erro', result.error || 'Erro ao excluir estoque');
      }
    } catch (err: any) {
      console.error('❌ Erro ao excluir estoque:', err);
      console.error('❌ Stack trace:', err.stack);
      Alert.alert('Erro', err.message || 'Erro inesperado ao excluir estoque');
    } finally {
      console.log('🔄 Finalizando processo...');
      setLoading(false);
      setShowExcluirModal(false);
      setItemToDelete(null);
      setItemParaExcluir(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;

    try {
      setLoading(true);
      console.log('🗑️ Excluindo estoque:', itemToDelete.id);
      await medicamentosEstoqueService.delete(itemToDelete.id);
      console.log('✅ Estoque excluído com sucesso!');
      setSuccessMessage('Estoque excluído com sucesso!');
      await fetchEstoques();
      setSuccessVisible(true);
    } catch (err: any) {
      console.error('Erro ao excluir estoque:', err);
      
      let errorMessage = 'Erro ao excluir estoque. Tente novamente.';
      if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Erro', errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
      setConfirmDeleteVisible(false);
      setItemToDelete(null);
    }
  };

  const closeForm = () => {
    setFormVisible(false);
    setSelectedEstoque(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO': return { bg: '#dcfce7', text: '#166534' };
      case 'VENCIDO': return { bg: '#fee2e2', text: '#991b1b' };
      case 'QUARENTENA': return { bg: '#fef3c7', text: '#92400e' };
      case 'DEVOLVIDO': return { bg: '#f3e8ff', text: '#6b21a8' };
      case 'BLOQUEADO': return { bg: '#f1f5f9', text: '#475569' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ATIVO': return 'Ativo';
      case 'VENCIDO': return 'Vencido';
      case 'QUARENTENA': return 'Quarentena';
      case 'DEVOLVIDO': return 'Devolvido';
      case 'BLOQUEADO': return 'Bloqueado';
      default: return status;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR');
  };

  const formatQuantity = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('pt-BR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 3 
    });
  };

  const renderEstoqueItem = ({ item }: { item: MedicamentoEstoque }) => (
    <View style={[styles.tableRow, { borderTopColor: currentTheme.border }]}>
      <View style={styles.medicamentoCell}>
        <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]} numberOfLines={1}>
          {item.nome_dcb || item.nome_dci || 'Medicamento não identificado'}
        </Text>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]} numberOfLines={1}>
          Cód: {item.codigo_interno || 'N/A'}
        </Text>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]} numberOfLines={1}>
          {item.forca_valor && item.forca_unidade_abrev ? `${item.forca_valor}${item.forca_unidade_abrev}` : ''}
        </Text>
      </View>
      <View style={styles.loteCell}>
        <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]} numberOfLines={1}>
          {item.lote}
        </Text>
        {item.localizacao && (
          <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]} numberOfLines={1}>
            {item.localizacao}
          </Text>
        )}
        {item.data_validade && (
          <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]} numberOfLines={1}>
            Val: {new Date(item.data_validade).toLocaleDateString('pt-BR')}
          </Text>
        )}
      </View>
      <View style={styles.quantidadeCell}>
        <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]}>
          {formatQuantity(item.quantidade_atual)}
        </Text>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          Min: {formatQuantity(item.quantidade_minima)}
        </Text>
      </View>
      <View style={styles.statusCell}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status_lote).bg }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status_lote).text }
          ]}>
            {getStatusLabel(item.status_lote)}
          </Text>
        </View>
      </View>
      <View style={styles.actionCell}>
        <TouchableOpacity 
          onPress={() => {
            setSelectedEstoque(item);
            setShowMovimentos(true);
          }} 
          style={styles.viewButton}
        >
          <Ionicons name="eye" size={16} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            setSelectedEstoque(item);
            setShowSaidaModal(true);
          }} 
          style={styles.saidaButton}
        >
          <Ionicons name="arrow-down" size={16} color="#ef4444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
          <Text style={[styles.editButtonText, { color: '#8A9E8E' }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaginationButton = (page: number) => (
    <TouchableOpacity
      key={page}
      style={[
        styles.paginationButton,
        currentPage === page && styles.paginationButtonActive,
        { backgroundColor: currentPage === page ? '#8A9E8E' : 'transparent' }
      ]}
      onPress={() => setCurrentPage(page)}
    >
      <Text style={[
        styles.paginationText,
        { color: currentPage === page ? '#ffffff' : currentTheme.mutedForeground }
      ]}>
        {page}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Estoque de Medicamentos
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Novo Estoque</Text>
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Search */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
            <Ionicons name="search" size={20} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar por lote, localização ou fornecedor..."
              placeholderTextColor={currentTheme.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Table */}
        <View style={[styles.tableContainer, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          {/* Table Header */}
          <View style={[styles.tableHeader, { borderBottomColor: currentTheme.border }]}>
            <View style={styles.medicamentoCell}>
              <Text style={[styles.tableHeaderText, { color: currentTheme.mutedForeground }]}>MEDICAMENTO</Text>
            </View>
            <View style={styles.loteCell}>
              <Text style={[styles.tableHeaderText, { color: currentTheme.mutedForeground }]}>LOTE</Text>
            </View>
            <View style={styles.quantidadeCell}>
              <Text style={[styles.tableHeaderText, { color: currentTheme.mutedForeground }]}>QUANTIDADE</Text>
            </View>
            <View style={styles.statusCell}>
              <Text style={[styles.tableHeaderText, { color: currentTheme.mutedForeground }]}>STATUS</Text>
            </View>
            <View style={styles.actionCell}>
              <Text style={[styles.tableHeaderText, { color: currentTheme.mutedForeground }]}>AÇÕES</Text>
            </View>
          </View>

          {/* Table Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: currentTheme.mutedForeground }]}>
                Carregando estoque...
              </Text>
            </View>
          ) : currentEstoques.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                {searchQuery ? 'Nenhum estoque encontrado.' : 'Nenhum estoque cadastrado.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={currentEstoques}
              renderItem={renderEstoqueItem}
              keyExtractor={(item) => item.id || Math.random().toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Results Info */}
        {!loading && (
          <View style={[styles.resultsInfo, { backgroundColor: isDarkMode ? theme.dark.background : theme.light.background }]}>
            <Text style={[styles.resultsText, { color: isDarkMode ? theme.dark.secondary : theme.light.secondary }]}>
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, estoques.length)} de {estoques.length} registros
            </Text>
          </View>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationArrow, { opacity: currentPage === 1 ? 0.5 : 1 }]}
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <Ionicons name="chevron-back" size={20} color={currentTheme.mutedForeground} />
            </TouchableOpacity>

            <View style={styles.paginationNumbers}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, currentPage - 2);
                const page = startPage + i;
                return page <= totalPages ? renderPaginationButton(page) : null;
              })}
            </View>

            <TouchableOpacity
              style={[styles.paginationArrow, { opacity: currentPage === totalPages ? 0.5 : 1 }]}
              onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <Ionicons name="chevron-forward" size={20} color={currentTheme.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal do Formulário */}
      <Modal
        visible={formVisible}
        animationType="slide"
        onRequestClose={closeForm}
      >
        <EstoqueMedicamentoForm
          initialData={selectedEstoque}
          onSubmit={handleSaveEstoque}
          onCancel={closeForm}
        />
      </Modal>

      {/* Modal de Movimentos */}
      <MovimentosModal
        visible={showMovimentos}
        estoque={selectedEstoque}
        onClose={() => setShowMovimentos(false)}
      />

      {/* Modal de Saída de Estoque */}
      <SaidaEstoqueModal
        visible={showSaidaModal}
        estoque={selectedEstoque}
        onClose={() => {
          console.log('📤 Fechando modal de saída');
          setShowSaidaModal(false);
          setSelectedEstoque(null);
        }}
        onSuccess={() => {
          console.log('🔄 onSuccess chamado - recarregando dados...');
          setShowSaidaModal(false);
          setSelectedEstoque(null);
          fetchEstoques(); // Recarregar dados após sucesso
        }}
        isDarkMode={isDarkMode}
      />

      {/* Modal de Exclusão de Estoque */}
      <ExcluirEstoqueModal
        visible={showExcluirModal}
        estoque={itemParaExcluir || itemToDelete}
        onClose={handleCancelExclusao}
        onConfirm={(motivo: string) => handleConfirmSoftDelete(motivo, itemParaExcluir)}
        isDarkMode={isDarkMode}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={confirmDeleteVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModalContent, { backgroundColor: currentTheme.background }]}>
            <Ionicons name="alert-circle" size={48} color="#dc2626" />
            <Text style={[styles.deleteModalTitle, { color: currentTheme.text }]}>
              Confirmar Exclusão
            </Text>
            <Text style={[styles.deleteModalText, { color: currentTheme.mutedForeground }]}>
              Tem certeza que deseja excluir o estoque do lote "{itemToDelete?.lote}" do medicamento "{itemToDelete?.nome_dcb || itemToDelete?.nome_dci}"?
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: currentTheme.border }]}
                onPress={() => setConfirmDeleteVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: currentTheme.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={successVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            console.log('🔍 Modal de sucesso sendo fechado via onRequestClose');
            setSuccessVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.successModalContent, { backgroundColor: currentTheme.background }]}>
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              <Text style={[styles.successModalText, { color: currentTheme.text }]}>
                {successMessage}
              </Text>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => {
                  console.log('🔍 Botão OK pressionado, fechando modal');
                  setSuccessVisible(false);
                }}
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
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A9E8E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 4,
  },
  tableContainer: {
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  medicamentoCell: {
    flex: 3,
    paddingRight: 16,
  },
  loteCell: {
    flex: 2.5,
    paddingRight: 16,
  },
  quantidadeCell: {
    flex: 1.5,
    paddingRight: 16,
  },
  statusCell: {
    flex: 1.2,
    paddingRight: 16,
  },
  actionCell: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cellTextPrimary: {
    fontSize: 14,
    fontWeight: '500',
  },
  cellTextSecondary: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  saidaButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#dc2626',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  paginationArrow: {
    padding: 8,
  },
  paginationNumbers: {
    flexDirection: 'row',
    gap: 4,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  paginationButtonActive: {
    backgroundColor: '#8A9E8E',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsInfo: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultsText: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  deleteModalContent: {
    width: '80%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 8,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteModalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  successModalContent: {
    width: '80%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  successModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  successButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#8A9E8E',
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EstoqueMedicamentosScreen;
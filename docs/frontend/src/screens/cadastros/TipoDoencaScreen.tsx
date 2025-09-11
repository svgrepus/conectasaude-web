import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface TipoDoenca {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
}

export const TipoDoencaScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Dados mockados expandidos
  const [tiposDoenca] = useState<TipoDoenca[]>([
    { id: '1', nome: 'Diabetes Mellitus Tipo 1', descricao: 'Diabetes insulino-dependente', categoria: 'Endócrina' },
    { id: '2', nome: 'Diabetes Mellitus Tipo 2', descricao: 'Diabetes não insulino-dependente', categoria: 'Endócrina' },
    { id: '3', nome: 'Hipertensão Arterial Sistêmica', descricao: 'Pressão arterial elevada', categoria: 'Cardiovascular' },
    { id: '4', nome: 'Asma Brônquica', descricao: 'Doença inflamatória das vias aéreas', categoria: 'Respiratória' },
    { id: '5', nome: 'Doença de Alzheimer', descricao: 'Demência neurodegenerativa', categoria: 'Neurológica' },
    { id: '6', nome: 'Artrite Reumatoide', descricao: 'Doença autoimune das articulações', categoria: 'Reumatológica' },
    { id: '7', nome: 'Epilepsia', descricao: 'Distúrbio neurológico com convulsões', categoria: 'Neurológica' },
    { id: '8', nome: 'Doença Pulmonar Obstrutiva Crônica', descricao: 'DPOC - obstrução do fluxo aéreo', categoria: 'Respiratória' },
    { id: '9', nome: 'Insuficiência Cardíaca', descricao: 'Falência da função cardíaca', categoria: 'Cardiovascular' },
    { id: '10', nome: 'Doença Renal Crônica', descricao: 'Deterioração da função renal', categoria: 'Renal' },
    { id: '11', nome: 'Hepatite B Crônica', descricao: 'Inflamação crônica do fígado', categoria: 'Hepatológica' },
    { id: '12', nome: 'Fibromialgia', descricao: 'Síndrome de dor musculoesquelética', categoria: 'Reumatológica' },
  ]);

  const filteredTipos = tiposDoenca.filter(tipo =>
    tipo.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tipo.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tipo.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTipos.length / 10);

  const handleEdit = (id: string) => {
    console.log('Editar tipo de doença:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Excluir tipo de doença:', id);
  };

  const handleAdd = () => {
    console.log('Adicionar novo tipo de doença');
  };

  // Renderizar item da tabela
  const renderTipoItem = ({ item }: { item: TipoDoenca }) => (
    <View style={[styles.tableRow, { borderTopColor: currentTheme.border }]}>
      <View style={styles.nameCell}>
        <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]}>
          {item.nome}
        </Text>
      </View>
      <View style={styles.descriptionCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.descricao}
        </Text>
      </View>
      <View style={styles.categoryCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.categoria}
        </Text>
      </View>
      <View style={styles.actionCell}>
        <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.editButton}>
          <Text style={[styles.editButtonText, { color: '#8A9E8E' }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar botões de paginação
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
            Tipos de Doença
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Novo Tipo</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.surface }]}>
            <Ionicons name="search" size={16} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar por nome, descrição ou categoria..."
              placeholderTextColor={currentTheme.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Table */}
        <View style={[styles.tableContainer, { 
          backgroundColor: currentTheme.surface, 
          borderColor: currentTheme.border 
        }]}>
          {/* Table Header */}
          <View style={[styles.tableHeader, { backgroundColor: currentTheme.muted }]}>
            <View style={styles.nameCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                NOME
              </Text>
            </View>
            <View style={styles.descriptionCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                DESCRIÇÃO
              </Text>
            </View>
            <View style={styles.categoryCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                CATEGORIA
              </Text>
            </View>
            <View style={styles.actionCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                AÇÕES
              </Text>
            </View>
          </View>

          {/* Table Body */}
          {filteredTipos.length > 0 ? (
            <FlatList
              data={filteredTipos}
              renderItem={renderTipoItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                {searchQuery ? 'Nenhum tipo encontrado para a busca realizada' : 'Nenhum tipo de doença cadastrado'}
              </Text>
            </View>
          )}
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity 
              style={styles.paginationArrow}
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <Ionicons 
                name="chevron-back" 
                size={20} 
                color={currentPage === 1 ? '#ccc' : currentTheme.mutedForeground} 
              />
            </TouchableOpacity>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(renderPaginationButton)}
            
            <TouchableOpacity 
              style={styles.paginationArrow}
              onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={currentPage === totalPages ? '#ccc' : currentTheme.mutedForeground} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <Text style={[styles.infoText, { color: currentTheme.mutedForeground }]}>
            Total: {filteredTipos.length} tipos de doença
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A9E8E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    minHeight: 20,
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  nameCell: {
    flex: 2.5,
    justifyContent: 'center',
  },
  descriptionCell: {
    flex: 3,
    justifyContent: 'center',
    paddingRight: 8,
  },
  categoryCell: {
    flex: 1.5,
    justifyContent: 'center',
  },
  actionCell: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cellTextPrimary: {
    fontSize: 14,
    fontWeight: '500',
  },
  cellTextSecondary: {
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  paginationArrow: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  paginationButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  paginationButtonActive: {
    backgroundColor: '#8A9E8E',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

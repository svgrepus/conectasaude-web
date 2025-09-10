import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface Municipe {
  id: string;
  nome: string;
  cpf: string;
  doencasCronicas: string;
}

interface ListaMunicipesScreenProps {
  onNavigateToCadastro: () => void;
}

export const ListaMunicipesScreen: React.FC<ListaMunicipesScreenProps> = ({ 
  onNavigateToCadastro 
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Doenças Crônicas');
  const [currentPage, setCurrentPage] = useState(1);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Dados mockados dos munícipes
  const [municipes] = useState<Municipe[]>([
    { id: '1', nome: 'Sofia Almeida', cpf: '123.456.789-00', doencasCronicas: 'Diabetes' },
    { id: '2', nome: 'Lucas Pereira', cpf: '987.654.321-11', doencasCronicas: 'Hipertensão' },
    { id: '3', nome: 'Isabela Costa', cpf: '456.789.012-22', doencasCronicas: 'Asma' },
    { id: '4', nome: 'Mateus Oliveira', cpf: '789.012.345-33', doencasCronicas: 'Doença Cardíaca' },
    { id: '5', nome: 'Giovana Santos', cpf: '012.345.678-44', doencasCronicas: 'Diabetes' },
    { id: '6', nome: 'Rafael Lima', cpf: '345.678.901-55', doencasCronicas: 'Hipertensão' },
    { id: '7', nome: 'Beatriz Souza', cpf: '678.901.234-66', doencasCronicas: 'Asma' },
    { id: '8', nome: 'Guilherme Martins', cpf: '901.234.567-77', doencasCronicas: 'Doença Cardíaca' },
    { id: '9', nome: 'Larissa Rocha', cpf: '234.567.890-88', doencasCronicas: 'Diabetes' },
    { id: '10', nome: 'Rodrigo Fernandes', cpf: '567.890.123-99', doencasCronicas: 'Hipertensão' },
  ]);

  const filteredMunicipes = municipes.filter(municipe =>
    municipe.nome.toLowerCase().includes(searchText.toLowerCase()) ||
    municipe.cpf.includes(searchText)
  );

  const handleEdit = (id: string) => {
    console.log('Editar munícipe:', id);
    // Aqui seria implementada a navegação para edição
  };

  const renderMunicipeItem = ({ item }: { item: Municipe }) => (
    <View style={[styles.tableRow, { borderTopColor: currentTheme.border }]}>
      <View style={styles.tableCell}>
        <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]}>
          {item.nome}
        </Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.cpf}
        </Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.doencasCronicas}
        </Text>
      </View>
      <View style={[styles.tableCell, styles.actionCell]}>
        <TouchableOpacity onPress={() => handleEdit(item.id)}>
          <Text style={styles.editButton}>Editar</Text>
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
        { backgroundColor: currentPage === page ? '#ea2a33' : 'transparent' }
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
            Munícipes
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onNavigateToCadastro}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Adicionar Munícipe</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.surface }]}>
            <Ionicons name="search" size={16} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar por nome ou CPF"
              placeholderTextColor={currentTheme.mutedForeground}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <View style={[styles.filterContainer, { backgroundColor: currentTheme.surface }]}>
            <Text style={[styles.filterText, { color: currentTheme.text }]}>
              {selectedFilter}
            </Text>
            <Ionicons name="chevron-down" size={16} color={currentTheme.mutedForeground} />
          </View>
        </View>

        {/* Table */}
        <View style={[styles.tableContainer, { 
          backgroundColor: currentTheme.surface, 
          borderColor: currentTheme.border 
        }]}>
          {/* Table Header */}
          <View style={[styles.tableHeader, { backgroundColor: currentTheme.muted }]}>
            <View style={styles.tableCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                NOME
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                CPF
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                DOENÇAS CRÔNICAS
              </Text>
            </View>
            <View style={[styles.tableCell, styles.actionCell]}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                AÇÕES
              </Text>
            </View>
          </View>

          {/* Table Body */}
          <FlatList
            data={filteredMunicipes}
            renderItem={renderMunicipeItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Pagination */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity style={styles.paginationArrow}>
            <Ionicons name="chevron-back" size={20} color={currentTheme.mutedForeground} />
          </TouchableOpacity>
          
          {renderPaginationButton(1)}
          {renderPaginationButton(2)}
          {renderPaginationButton(3)}
          
          <Text style={[styles.paginationDots, { color: currentTheme.mutedForeground }]}>
            ...
          </Text>
          
          {renderPaginationButton(10)}
          
          <TouchableOpacity style={styles.paginationArrow}>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.mutedForeground} />
          </TouchableOpacity>
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
    backgroundColor: '#ea2a33',
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
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
    minWidth: 140,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
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
  tableCell: {
    flex: 1,
    justifyContent: 'center',
  },
  actionCell: {
    alignItems: 'flex-end',
    flex: 0.5,
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
    color: '#ea2a33',
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: '#ea2a33',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paginationDots: {
    fontSize: 14,
    paddingHorizontal: 8,
  },
});

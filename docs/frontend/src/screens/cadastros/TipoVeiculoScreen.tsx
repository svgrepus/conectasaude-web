import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface TipoVeiculo {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  capacidade: number;
  combustivel: string;
  ativo: boolean;
}

export const TipoVeiculoScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Dados mockados expandidos
  const [tiposVeiculo] = useState<TipoVeiculo[]>([
    {
      id: '1',
      nome: 'Ambulância UTI',
      categoria: 'Emergência',
      descricao: 'Unidade de Terapia Intensiva móvel para atendimento avançado',
      capacidade: 2,
      combustivel: 'Diesel',
      ativo: true,
    },
    {
      id: '2',
      nome: 'Ambulância Básica',
      categoria: 'Emergência',
      descricao: 'Veículo para suporte básico de vida e transporte de pacientes',
      capacidade: 3,
      combustivel: 'Diesel',
      ativo: true,
    },
    {
      id: '3',
      nome: 'SAMU',
      categoria: 'Emergência',
      descricao: 'Serviço de Atendimento Móvel de Urgência',
      capacidade: 4,
      combustivel: 'Diesel',
      ativo: true,
    },
    {
      id: '4',
      nome: 'Van de Transporte',
      categoria: 'Transporte',
      descricao: 'Veículo para transporte de pacientes em cadeira de rodas',
      capacidade: 8,
      combustivel: 'Flex',
      ativo: true,
    },
    {
      id: '5',
      nome: 'Micro-ônibus',
      categoria: 'Transporte',
      descricao: 'Transporte coletivo para múltiplos pacientes',
      capacidade: 20,
      combustivel: 'Diesel',
      ativo: true,
    },
    {
      id: '6',
      nome: 'Carro Administrativo',
      categoria: 'Administrativo',
      descricao: 'Veículo para uso administrativo e supervisão',
      capacidade: 5,
      combustivel: 'Flex',
      ativo: true,
    },
    {
      id: '7',
      nome: 'Motocicleta',
      categoria: 'Emergência',
      descricao: 'Moto para atendimento rápido em emergências',
      capacidade: 1,
      combustivel: 'Gasolina',
      ativo: true,
    },
    {
      id: '8',
      nome: 'Caminhão Lixo Hospitalar',
      categoria: 'Especial',
      descricao: 'Veículo para coleta de resíduos hospitalares',
      capacidade: 2,
      combustivel: 'Diesel',
      ativo: true,
    },
    {
      id: '9',
      nome: 'Veículo de Vigilância',
      categoria: 'Vigilância',
      descricao: 'Carro para atividades de vigilância sanitária',
      capacidade: 4,
      combustivel: 'Flex',
      ativo: true,
    },
    {
      id: '10',
      nome: 'Caminhão Vacina',
      categoria: 'Especial',
      descricao: 'Veículo refrigerado para transporte de vacinas',
      capacidade: 3,
      combustivel: 'Diesel',
      ativo: true,
    },
    {
      id: '11',
      nome: 'Unidade Móvel Odontológica',
      categoria: 'Especializada',
      descricao: 'Consultório odontológico móvel',
      capacidade: 4,
      combustivel: 'Diesel',
      ativo: true,
    },
    {
      id: '12',
      nome: 'Laboratório Móvel',
      categoria: 'Especializada',
      descricao: 'Unidade móvel para exames laboratoriais',
      capacidade: 3,
      combustivel: 'Diesel',
      ativo: true,
    },
  ]);

  const filteredTipos = tiposVeiculo.filter(tipo =>
    tipo.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tipo.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tipo.combustivel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tipo.descricao.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTipos.length / 10);

  const handleEdit = (id: string) => {
    console.log('Editar tipo de veículo:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Excluir tipo de veículo:', id);
  };

  const handleAdd = () => {
    console.log('Adicionar novo tipo de veículo');
  };

  // Renderizar item da tabela
  const renderVeiculoItem = ({ item }: { item: TipoVeiculo }) => (
    <View style={[styles.tableRow, { borderTopColor: currentTheme.border }]}>
      <View style={styles.nameCell}>
        <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]}>
          {item.nome}
        </Text>
      </View>
      <View style={styles.categoryCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.categoria}
        </Text>
      </View>
      <View style={styles.capacityCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.capacidade}
        </Text>
      </View>
      <View style={styles.fuelCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.combustivel}
        </Text>
      </View>
      <View style={styles.statusCell}>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.ativo ? '#dcfce7' : '#fef2f2' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: item.ativo ? '#16a34a' : '#dc2626' }
          ]}>
            {item.ativo ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
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
            Tipos de Veículo
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
              placeholder="Buscar por nome, categoria ou combustível..."
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
            <View style={styles.categoryCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                CATEGORIA
              </Text>
            </View>
            <View style={styles.capacityCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                CAPACIDADE
              </Text>
            </View>
            <View style={styles.fuelCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                COMBUSTÍVEL
              </Text>
            </View>
            <View style={styles.statusCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                STATUS
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
              renderItem={renderVeiculoItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                {searchQuery ? 'Nenhum tipo encontrado para a busca realizada' : 'Nenhum tipo de veículo cadastrado'}
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
            Total: {filteredTipos.length} tipos de veículo
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
  categoryCell: {
    flex: 1.5,
    justifyContent: 'center',
  },
  capacityCell: {
    flex: 1,
    justifyContent: 'center',
  },
  fuelCell: {
    flex: 1.2,
    justifyContent: 'center',
  },
  statusCell: {
    flex: 1,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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

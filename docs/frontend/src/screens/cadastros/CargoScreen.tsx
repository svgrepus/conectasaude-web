import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface Cargo {
  id: string;
  nome: string;
  descricao: string;
  nivel: string;
  area: string;
  salarioMinimo: number;
  cargaHoraria: number;
  ativo: boolean;
}

export const CargoScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Dados mockados expandidos
  const [cargos] = useState<Cargo[]>([
    {
      id: '1',
      nome: 'Médico Clínico Geral',
      descricao: 'Médico especialista em clínica geral',
      nivel: 'Superior',
      area: 'Assistencial',
      salarioMinimo: 15000,
      cargaHoraria: 40,
      ativo: true,
    },
    {
      id: '2',
      nome: 'Enfermeiro',
      descricao: 'Profissional de enfermagem de nível superior',
      nivel: 'Superior',
      area: 'Assistencial',
      salarioMinimo: 8000,
      cargaHoraria: 40,
      ativo: true,
    },
    {
      id: '3',
      nome: 'Técnico em Enfermagem',
      descricao: 'Técnico em enfermagem',
      nivel: 'Técnico',
      area: 'Assistencial',
      salarioMinimo: 3500,
      cargaHoraria: 40,
      ativo: true,
    },
    {
      id: '4',
      nome: 'Auxiliar de Enfermagem',
      descricao: 'Auxiliar de enfermagem',
      nivel: 'Médio',
      area: 'Assistencial',
      salarioMinimo: 2500,
      cargaHoraria: 40,
      ativo: true,
    },
    {
      id: '5',
      nome: 'Farmacêutico',
      descricao: 'Profissional farmacêutico',
      nivel: 'Superior',
      area: 'Assistencial',
      salarioMinimo: 7000,
      cargaHoraria: 40,
      ativo: true,
    },
    {
      id: '6',
      nome: 'Psicólogo',
      descricao: 'Profissional de psicologia',
      nivel: 'Superior',
      area: 'Assistencial',
      salarioMinimo: 6000,
      cargaHoraria: 30,
      ativo: true,
    },
    {
      id: '7',
      nome: 'Nutricionista',
      descricao: 'Profissional de nutrição',
      nivel: 'Superior',
      area: 'Assistencial',
      salarioMinimo: 5500,
      cargaHoraria: 30,
      ativo: true,
    },
    {
      id: '8',
      nome: 'Fisioterapeuta',
      descricao: 'Profissional de fisioterapia',
      nivel: 'Superior',
      area: 'Assistencial',
      salarioMinimo: 5000,
      cargaHoraria: 30,
      ativo: true,
    },
    {
      id: '9',
      nome: 'Dentista',
      descricao: 'Cirurgião dentista',
      nivel: 'Superior',
      area: 'Assistencial',
      salarioMinimo: 8000,
      cargaHoraria: 40,
      ativo: true,
    },
    {
      id: '10',
      nome: 'Auxiliar de Saúde Bucal',
      descricao: 'Auxiliar em saúde bucal',
      nivel: 'Técnico',
      area: 'Assistencial',
      salarioMinimo: 2000,
      cargaHoraria: 40,
      ativo: true,
    },
    {
      id: '11',
      nome: 'Motorista de Ambulância',
      descricao: 'Condutor de veículos de emergência',
      nivel: 'Médio',
      area: 'Operacional',
      salarioMinimo: 3000,
      cargaHoraria: 40,
      ativo: true,
    },
    {
      id: '12',
      nome: 'Auxiliar Administrativo',
      descricao: 'Auxiliar para atividades administrativas',
      nivel: 'Médio',
      area: 'Administrativa',
      salarioMinimo: 2200,
      cargaHoraria: 40,
      ativo: true,
    },
    {
      id: '13',
      nome: 'Assistente Social',
      descricao: 'Profissional de serviço social',
      nivel: 'Superior',
      area: 'Assistencial',
      salarioMinimo: 4500,
      cargaHoraria: 30,
      ativo: true,
    },
    {
      id: '14',
      nome: 'Agente Comunitário de Saúde',
      descricao: 'Agente de saúde da comunidade',
      nivel: 'Médio',
      area: 'Assistencial',
      salarioMinimo: 2000,
      cargaHoraria: 40,
      ativo: true,
    },
    {
      id: '15',
      nome: 'Coordenador de Unidade',
      descricao: 'Coordenador de unidade de saúde',
      nivel: 'Superior',
      area: 'Gestão',
      salarioMinimo: 10000,
      cargaHoraria: 40,
      ativo: true,
    },
  ]);

  const filteredCargos = cargos.filter(cargo =>
    cargo.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cargo.nivel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cargo.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cargo.descricao.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCargos.length / 10);

  const handleEdit = (id: string) => {
    console.log('Editar cargo:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Excluir cargo:', id);
  };

  const handleAdd = () => {
    console.log('Adicionar novo cargo');
  };

  // Renderizar item da tabela
  const renderCargoItem = ({ item }: { item: Cargo }) => (
    <View style={[styles.tableRow, { borderTopColor: currentTheme.border }]}>
      <View style={styles.nameCell}>
        <Text style={[styles.cellTextPrimary, { color: currentTheme.text }]}>
          {item.nome}
        </Text>
      </View>
      <View style={styles.levelCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.nivel}
        </Text>
      </View>
      <View style={styles.areaCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.area}
        </Text>
      </View>
      <View style={styles.workloadCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          {item.cargaHoraria}h
        </Text>
      </View>
      <View style={styles.salaryCell}>
        <Text style={[styles.cellTextSecondary, { color: currentTheme.mutedForeground }]}>
          R$ {item.salarioMinimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            Cargos
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Novo Cargo</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.filtersContainer}>
          <View style={[styles.searchContainer, { backgroundColor: currentTheme.surface }]}>
            <Ionicons name="search" size={16} color={currentTheme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Buscar por cargo, nível ou área..."
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
                CARGO
              </Text>
            </View>
            <View style={styles.levelCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                NÍVEL
              </Text>
            </View>
            <View style={styles.areaCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                ÁREA
              </Text>
            </View>
            <View style={styles.workloadCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                CARGA HORÁRIA
              </Text>
            </View>
            <View style={styles.salaryCell}>
              <Text style={[styles.headerText, { color: currentTheme.mutedForeground }]}>
                SALÁRIO MÍNIMO
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
          {filteredCargos.length > 0 ? (
            <FlatList
              data={filteredCargos}
              renderItem={renderCargoItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
                {searchQuery ? 'Nenhum cargo encontrado para a busca realizada' : 'Nenhum cargo cadastrado'}
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
            Total: {filteredCargos.length} cargos
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
  levelCell: {
    flex: 1,
    justifyContent: 'center',
  },
  areaCell: {
    flex: 1.2,
    justifyContent: 'center',
  },
  workloadCell: {
    flex: 1,
    justifyContent: 'center',
  },
  salaryCell: {
    flex: 1.5,
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

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Button, Searchbar, Chip, FAB } from 'react-native-paper';
import { useAuth, useTheme } from '../../hooks';
import { formatCurrency } from '../../utils';

interface Medicamento {
  id: string;
  nome: string;
  principio_ativo: string;
  concentracao?: string;
  forma_farmaceutica: string;
  fabricante?: string;
  preco_unitario?: number;
  estoque?: {
    quantidade_atual: number;
    estoque_minimo: number;
  };
}

export default function MedicamentosScreen() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const { theme } = useTheme();

  const filterOptions = [
    { value: 'estoque_baixo', label: 'Estoque Baixo' },
    { value: 'sem_estoque', label: 'Sem Estoque' },
    { value: 'disponivel', label: 'Disponível' },
  ];

  useEffect(() => {
    loadMedicamentos();
  }, []);

  const loadMedicamentos = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to load medicamentos
      // const data = await MedicamentoService.getMedicamentos();
      // setMedicamentos(data);
      
      // Mock data for now
      setMedicamentos([
        {
          id: '1',
          nome: 'Paracetamol 500mg',
          principio_ativo: 'Paracetamol',
          concentracao: '500mg',
          forma_farmaceutica: 'Comprimido',
          fabricante: 'EMS',
          preco_unitario: 0.15,
          estoque: {
            quantidade_atual: 150,
            estoque_minimo: 50,
          },
        },
        {
          id: '2',
          nome: 'Ibuprofeno 600mg',
          principio_ativo: 'Ibuprofeno',
          concentracao: '600mg',
          forma_farmaceutica: 'Comprimido',
          fabricante: 'Medley',
          preco_unitario: 0.25,
          estoque: {
            quantidade_atual: 25,
            estoque_minimo: 30,
          },
        },
      ]);
    } catch (error) {
      console.error('Error loading medicamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicamentos();
    setRefreshing(false);
  };

  const getEstoqueStatus = (medicamento: Medicamento) => {
    if (!medicamento.estoque) return 'unknown';
    
    const { quantidade_atual, estoque_minimo } = medicamento.estoque;
    
    if (quantidade_atual === 0) return 'sem_estoque';
    if (quantidade_atual <= estoque_minimo) return 'estoque_baixo';
    return 'disponivel';
  };

  const getEstoqueColor = (status: string) => {
    switch (status) {
      case 'sem_estoque': return theme.colors.error;
      case 'estoque_baixo': return theme.colors.warning;
      case 'disponivel': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getEstoqueLabel = (status: string) => {
    switch (status) {
      case 'sem_estoque': return 'Sem Estoque';
      case 'estoque_baixo': return 'Estoque Baixo';
      case 'disponivel': return 'Disponível';
      default: return 'Desconhecido';
    }
  };

  const renderMedicamento = ({ item }: { item: Medicamento }) => {
    const estoqueStatus = getEstoqueStatus(item);
    const estoqueColor = getEstoqueColor(estoqueStatus);
    const estoqueLabel = getEstoqueLabel(estoqueStatus);
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {item.nome}
            </Text>
            <Chip 
              mode="outlined" 
              textStyle={{ color: estoqueColor }}
              style={{ borderColor: estoqueColor }}
            >
              {estoqueLabel}
            </Chip>
          </View>
          
          <Text style={[styles.principio, { color: theme.colors.textSecondary }]}>
            Princípio ativo: {item.principio_ativo}
          </Text>
          
          <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
            {item.concentracao} - {item.forma_farmaceutica}
          </Text>
          
          {item.fabricante && (
            <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
              Fabricante: {item.fabricante}
            </Text>
          )}
          
          {item.preco_unitario && (
            <Text style={[styles.price, { color: theme.colors.primary }]}>
              Preço unitário: {formatCurrency(item.preco_unitario)}
            </Text>
          )}
          
          {item.estoque && (
            <View style={styles.estoqueInfo}>
              <Text style={[styles.estoque, { color: theme.colors.text }]}>
                Estoque: {item.estoque.quantidade_atual} unidades
              </Text>
              <Text style={[styles.estoqueMin, { color: theme.colors.textSecondary }]}>
                Mínimo: {item.estoque.estoque_minimo}
              </Text>
            </View>
          )}
        </Card.Content>
        
        <Card.Actions>
          <Button mode="outlined" compact>
            Detalhes
          </Button>
          {user?.role === 'funcionario' || user?.role === 'admin' ? (
            <Button mode="contained" compact>
              Dispensar
            </Button>
          ) : null}
        </Card.Actions>
      </Card>
    );
  };

  const filteredMedicamentos = medicamentos.filter(medicamento => {
    const matchesSearch = medicamento.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medicamento.principio_ativo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!selectedFilter) return matchesSearch;
    
    const estoqueStatus = getEstoqueStatus(medicamento);
    return matchesSearch && estoqueStatus === selectedFilter;
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      padding: theme.spacing.md,
    },
    filtersContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    filterChip: {
      marginRight: theme.spacing.sm,
    },
    card: {
      margin: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    name: {
      fontSize: theme.typography.h4,
      fontWeight: 'bold',
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    principio: {
      fontSize: theme.typography.body,
      marginBottom: theme.spacing.xs,
    },
    info: {
      fontSize: theme.typography.caption,
      marginBottom: theme.spacing.xs,
    },
    price: {
      fontSize: theme.typography.body,
      fontWeight: '600',
      marginTop: theme.spacing.xs,
    },
    estoqueInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    estoque: {
      fontSize: theme.typography.body,
      fontWeight: '600',
    },
    estoqueMin: {
      fontSize: theme.typography.caption,
    },
    fab: {
      position: 'absolute',
      margin: theme.spacing.md,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar medicamentos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ value: null, label: 'Todos' }, ...filterOptions]}
          renderItem={({ item }) => (
            <Chip
              selected={selectedFilter === item.value}
              onPress={() => setSelectedFilter(
                selectedFilter === item.value ? null : item.value
              )}
              style={styles.filterChip}
              mode={selectedFilter === item.value ? 'flat' : 'outlined'}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.value || 'all'}
        />
      </View>

      {filteredMedicamentos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || selectedFilter ? 'Nenhum medicamento encontrado' : 'Nenhum medicamento cadastrado'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMedicamentos}
          renderItem={renderMedicamento}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {(user?.role === 'funcionario' || user?.role === 'admin') && (
        <FAB
          style={styles.fab}
          icon="plus"
          label="Novo Medicamento"
          onPress={() => {
            // TODO: Navigate to new medicamento screen
            console.log('Navigate to new medicamento');
          }}
        />
      )}
    </View>
  );
}

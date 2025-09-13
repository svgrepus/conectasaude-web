import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Button, Searchbar, Chip, FAB } from 'react-native-paper';
import { useTheme } from '../../hooks';
import { formatDate } from '../../utils';

interface Exame {
  id: string;
  tipo_exame: string;
  data_solicitacao: string;
  data_realizacao?: string;
  status: string;
  funcionario_solicitante?: { nome: string };
  resultado?: string;
}

export default function ExamesScreen() {
  const [exames, setExames] = useState<Exame[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { theme } = useTheme();

  const statusOptions = [
    { value: 'solicitado', label: 'Solicitado', color: theme.colors.warning },
    { value: 'agendado', label: 'Agendado', color: theme.colors.info },
    { value: 'realizado', label: 'Realizado', color: theme.colors.success },
    { value: 'cancelado', label: 'Cancelado', color: theme.colors.error },
  ];

  useEffect(() => {
    loadExames();
  }, []);

  const loadExames = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to load exames
      // const data = await ExameService.getExames();
      // setExames(data);
      
      // Mock data for now
      setExames([
        {
          id: '1',
          tipo_exame: 'Hemograma Completo',
          data_solicitacao: '2024-01-10',
          data_realizacao: '2024-01-15',
          status: 'realizado',
          funcionario_solicitante: { nome: 'Dr. João Silva' },
          resultado: 'Disponível',
        },
        {
          id: '2',
          tipo_exame: 'Raio-X Tórax',
          data_solicitacao: '2024-01-12',
          status: 'agendado',
          funcionario_solicitante: { nome: 'Dra. Maria Santos' },
        },
      ]);
    } catch (error) {
      console.error('Error loading exames:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExames();
    setRefreshing(false);
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(option => option.value === status) || 
           { label: status, color: theme.colors.textSecondary };
  };

  const renderExame = ({ item }: { item: Exame }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={[styles.type, { color: theme.colors.text }]}>
              {item.tipo_exame}
            </Text>
            <Chip 
              mode="outlined" 
              textStyle={{ color: statusInfo.color }}
              style={{ borderColor: statusInfo.color }}
            >
              {statusInfo.label}
            </Chip>
          </View>
          
          <Text style={[styles.doctor, { color: theme.colors.textSecondary }]}>
            Solicitado por: {item.funcionario_solicitante?.nome}
          </Text>
          
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            Data da solicitação: {formatDate(item.data_solicitacao)}
          </Text>
          
          {item.data_realizacao && (
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
              Data da realização: {formatDate(item.data_realizacao)}
            </Text>
          )}
          
          {item.resultado && (
            <Text style={[styles.result, { color: theme.colors.success }]}>
              ✓ Resultado disponível
            </Text>
          )}
        </Card.Content>
        
        <Card.Actions>
          <Button mode="outlined" compact>
            Detalhes
          </Button>
          {item.resultado && (
            <Button mode="contained" compact>
              Ver Resultado
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  const filteredExames = exames.filter(exame => {
    const matchesSearch = exame.tipo_exame.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exame.funcionario_solicitante?.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || exame.status === selectedStatus;
    return matchesSearch && matchesStatus;
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
    type: {
      fontSize: theme.typography.h4,
      fontWeight: 'bold',
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    doctor: {
      fontSize: theme.typography.body,
      marginBottom: theme.spacing.xs,
    },
    date: {
      fontSize: theme.typography.caption,
      marginBottom: theme.spacing.xs,
    },
    result: {
      fontSize: theme.typography.body,
      fontWeight: '600',
      marginTop: theme.spacing.sm,
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
          placeholder="Buscar exames..."
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ value: null, label: 'Todos' }, ...statusOptions]}
          renderItem={({ item }) => (
            <Chip
              selected={selectedStatus === item.value}
              onPress={() => setSelectedStatus(
                selectedStatus === item.value ? null : item.value
              )}
              style={styles.filterChip}
              mode={selectedStatus === item.value ? 'flat' : 'outlined'}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.value || 'all'}
        />
      </View>

      {filteredExames.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || selectedStatus ? 'Nenhum exame encontrado' : 'Você não tem exames solicitados'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExames}
          renderItem={renderExame}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="Solicitar Exame"
        onPress={() => {
          // TODO: Navigate to new exame screen
          console.log('Navigate to new exame');
        }}
      />
    </View>
  );
}

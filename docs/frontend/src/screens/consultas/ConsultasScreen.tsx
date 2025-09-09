import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Button, Searchbar, FAB } from 'react-native-paper';
import { useTheme } from '../../hooks';
import { formatDate } from '../../utils';

interface Consulta {
  id: string;
  data_consulta: string;
  hora_consulta: string;
  tipo_consulta: string;
  status: string;
  funcionario?: { nome: string };
  unidade?: { nome: string };
}

export default function ConsultasScreen() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    loadConsultas();
  }, []);

  const loadConsultas = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to load consultas
      // const data = await ConsultaService.getConsultas();
      // setConsultas(data);
      
      // Mock data for now
      setConsultas([
        {
          id: '1',
          data_consulta: '2024-01-15',
          hora_consulta: '14:30',
          tipo_consulta: 'rotina',
          status: 'agendada',
          funcionario: { nome: 'Dr. João Silva' },
          unidade: { nome: 'UBS Centro' },
        },
      ]);
    } catch (error) {
      console.error('Error loading consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConsultas();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return theme.colors.info;
      case 'confirmada': return theme.colors.primary;
      case 'realizada': return theme.colors.success;
      case 'cancelada': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const renderConsulta = ({ item }: { item: Consulta }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={[styles.date, { color: theme.colors.text }]}>
            {formatDate(item.data_consulta)} às {item.hora_consulta}
          </Text>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        
        <Text style={[styles.doctor, { color: theme.colors.text }]}>
          {item.funcionario?.nome}
        </Text>
        
        <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>
          {item.unidade?.nome}
        </Text>
        
        <Text style={[styles.type, { color: theme.colors.textSecondary }]}>
          Tipo: {item.tipo_consulta}
        </Text>
      </Card.Content>
      
      <Card.Actions>
        <Button mode="outlined" compact>
          Detalhes
        </Button>
        {item.status === 'agendada' && (
          <Button mode="text" compact>
            Cancelar
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  const filteredConsultas = consultas.filter(consulta =>
    consulta.funcionario?.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    consulta.unidade?.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      padding: theme.spacing.md,
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
    date: {
      fontSize: theme.typography.h4,
      fontWeight: 'bold',
    },
    status: {
      fontSize: theme.typography.caption,
      fontWeight: 'bold',
    },
    doctor: {
      fontSize: theme.typography.body,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    unit: {
      fontSize: theme.typography.body,
      marginBottom: theme.spacing.xs,
    },
    type: {
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
          placeholder="Buscar consultas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
      </View>

      {filteredConsultas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Nenhuma consulta encontrada' : 'Você não tem consultas agendadas'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConsultas}
          renderItem={renderConsulta}
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
        label="Nova Consulta"
        onPress={() => {
          // TODO: Navigate to new consulta screen
          console.log('Navigate to new consulta');
        }}
      />
    </View>
  );
}

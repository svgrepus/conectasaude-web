import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { DashboardCard } from '../components/DashboardCard';
import { AlertCard } from '../components/AlertCard';
import { ChartComponent } from '../components/ChartComponent';
import { theme } from '../constants/theme';

interface DashboardData {
  totalMedicamentos: number;
  estoqueBaixo: number;
  proximoVencimento: number;
  medicamentosVencidos: number;
}

interface AlertItem {
  id: string;
  type: 'warning' | 'expiry' | 'low-stock';
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface MedicamentoVencimento {
  id: string;
  nome: string;
  unidade: string;
  dataVencimento: string;
  lote: string;
}

export const DashboardScreen: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalMedicamentos: 0,
    estoqueBaixo: 0,
    proximoVencimento: 0,
    medicamentosVencidos: 0,
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [medicamentosVencimento, setMedicamentosVencimento] = useState<MedicamentoVencimento[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega dados do dashboard
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simular dados do dashboard baseados na API
      const totalMedicamentos = 1250;
      const estoqueBaixo = 23;
      const proximoVencimento = 12;
      const medicamentosVencidos = 5;

      setDashboardData({
        totalMedicamentos,
        estoqueBaixo,
        proximoVencimento,
        medicamentosVencidos,
      });

      // Carregar alertas
      loadAlerts();
      
      // Carregar medicamentos próximos do vencimento
      loadMedicamentosVencimento();

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = () => {
    const alertsData: AlertItem[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Estoque Baixo: Paracetamol',
        description: 'Unidade A - Apenas 15 unidades restantes.',
        icon: 'warning',
        color: '#f59e0b',
      },
      {
        id: '2',
        type: 'expiry',
        title: 'Vencimento Próximo: Dipirona',
        description: 'Unidade A - Vence em 15/08/2024.',
        icon: 'time',
        color: '#eab308',
      },
      {
        id: '3',
        type: 'low-stock',
        title: 'Estoque Baixo: Ibuprofeno',
        description: 'Unidade B - Apenas 8 unidades restantes.',
        icon: 'warning',
        color: '#f59e0b',
      },
    ];
    setAlerts(alertsData);
  };

  const loadMedicamentosVencimento = () => {
    const medicamentosData: MedicamentoVencimento[] = [
      {
        id: '1',
        nome: 'Dipirona',
        unidade: 'Unidade A',
        dataVencimento: '15/08/2024',
        lote: '12345',
      },
      {
        id: '2',
        nome: 'Cefalexina',
        unidade: 'Unidade B',
        dataVencimento: '20/09/2024',
        lote: '67890',
      },
      {
        id: '3',
        nome: 'Diclofenaco',
        unidade: 'Unidade C',
        dataVencimento: '10/10/2024',
        lote: '11223',
      },
    ];
    setMedicamentosVencimento(medicamentosData);
  };

  const exportCSV = () => {
    Alert.alert(
      'Exportar CSV',
      'Relatório de alertas será exportado para CSV.',
      [{ text: 'OK' }]
    );
  };

  const renderMedicamentoVencimento = ({ item }: { item: MedicamentoVencimento }) => (
    <View style={[styles.tableRow, isDarkMode && styles.tableRowDark]}>
      <Text style={[styles.tableCell, styles.tableCellMedicamento, isDarkMode && styles.textDark]}>
        {item.nome}
      </Text>
      <Text style={[styles.tableCell, isDarkMode && styles.textMutedDark]}>
        {item.unidade}
      </Text>
      <Text style={[styles.tableCell, styles.tableCellVencimento]}>
        {item.dataVencimento}
      </Text>
      <Text style={[styles.tableCell, isDarkMode && styles.textMutedDark]}>
        {item.lote}
      </Text>
    </View>
  );

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cards de Estatísticas */}
        <View style={styles.statsGrid}>
          <DashboardCard
            title="Total de Medicamentos"
            value={dashboardData.totalMedicamentos.toLocaleString()}
            isDarkMode={isDarkMode}
            type="default"
          />
          <DashboardCard
            title="Estoque Baixo"
            value={dashboardData.estoqueBaixo.toString()}
            isDarkMode={isDarkMode}
            type="warning"
          />
          <DashboardCard
            title="Próximo ao Vencimento"
            value={dashboardData.proximoVencimento.toString()}
            isDarkMode={isDarkMode}
            type="alert"
          />
          <DashboardCard
            title="Medicamentos Vencidos"
            value={dashboardData.medicamentosVencidos.toString()}
            isDarkMode={isDarkMode}
            type="danger"
          />
        </View>

        {/* Seção Principal - Gráfico e Alertas */}
        <View style={styles.mainSection}>
          {/* Gráfico de Estoque por Unidade */}
          <View style={[styles.chartContainer, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: currentTheme.text }]}>Estoque por Unidade</Text>
              <View style={[styles.periodSelector, { backgroundColor: currentTheme.muted, borderColor: currentTheme.border }]}>
                <Text style={[styles.periodText, { color: currentTheme.text }]}>Últimos 30 dias</Text>
              </View>
            </View>
            <ChartComponent isDarkMode={isDarkMode} />
          </View>

          {/* Alertas */}
          <View style={[styles.alertsContainer, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
            <View style={styles.alertsHeader}>
              <Text style={[styles.alertsTitle, { color: currentTheme.text }]}>Alertas</Text>
              <TouchableOpacity style={styles.exportButton} onPress={exportCSV}>
                <Ionicons name="download" size={14} color="#fff" />
                <Text style={styles.exportButtonText}>Exportar CSV</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.alertsList}>
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} isDarkMode={isDarkMode} />
              ))}
            </View>
          </View>
        </View>

        {/* Tabela de Medicamentos Próximos do Vencimento */}
        <View style={[styles.tableContainer, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <Text style={[styles.tableTitle, { color: currentTheme.text }]}>
            Medicamentos Próximos do Vencimento
          </Text>
          
          {/* Header da Tabela */}
          <View style={[styles.tableHeader, { backgroundColor: currentTheme.muted }]}>
            <Text style={[styles.tableHeaderCell, { color: currentTheme.mutedForeground }]}>MEDICAMENTO</Text>
            <Text style={[styles.tableHeaderCell, { color: currentTheme.mutedForeground }]}>UNIDADE</Text>
            <Text style={[styles.tableHeaderCell, { color: currentTheme.mutedForeground }]}>DATA DE VENCIMENTO</Text>
            <Text style={[styles.tableHeaderCell, { color: currentTheme.mutedForeground }]}>LOTE</Text>
          </View>
          
          {/* Dados da Tabela */}
          <FlatList
            data={medicamentosVencimento}
            renderItem={renderMedicamentoVencimento}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
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
    paddingTop: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  mainSection: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  chartContainer: {
    flex: 2,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  periodSelector: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  periodText: {
    fontSize: 14,
  },
  alertsContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A9E8E', // Verde institucional da Prefeitura de Jambeiro
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  alertsList: {
    gap: 16,
  },
  tableContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  tableRowDark: {
    borderBottomColor: '#27272a',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#71717a',
  },
  tableCellMedicamento: {
    fontWeight: '500',
    color: '#18181b',
  },
  tableCellVencimento: {
    color: '#eab308',
  },
  textDark: {
    color: '#f4f4f5',
  },
  textMutedDark: {
    color: '#a1a1aa',
  },
});

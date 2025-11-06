import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { 
  motoristasService, 
  type MotoristaCompleto,
  DIAS_SEMANA,
  PERIODOS_TRABALHO,
  ESTADO_CIVIL_OPTIONS
} from "../../services/motoristasService";
import { formatCPF, formatRG, formatPhone, formatCEP } from "../../utils";

interface DetalhesMotoristaScreenProps {
  navigation: any;
  route: {
    params: {
      motoristaId: string;
    };
  };
}

const DetalhesMotoristaScreen: React.FC<DetalhesMotoristaScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const currentTheme = theme.light;
  const { motoristaId } = route.params;

  const [motoristaCompleto, setMotoristaCompleto] = useState<MotoristaCompleto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDetalhes();
  }, [motoristaId]);

  const carregarDetalhes = async () => {
    try {
      setLoading(true);
      const dados = await motoristasService.buscarMotoristaCompleto(motoristaId);
      setMotoristaCompleto(dados);
    } catch (error) {
      console.error('Erro ao carregar detalhes do motorista:', error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes do motorista");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = () => {
    navigation.navigate('CadastroMotorista', {
      motoristaToEdit: motoristaCompleto,
      isEdit: true
    });
  };

  const confirmarExclusao = () => {
    Alert.alert(
      "Confirmar Exclusão",
      `Deseja realmente excluir o motorista ${motoristaCompleto?.motorista.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: handleExcluir
        }
      ]
    );
  };

  const handleExcluir = async () => {
    try {
      await motoristasService.excluirMotorista(motoristaId, "Exclusão via aplicativo");
      Alert.alert("Sucesso", "Motorista excluído com sucesso");
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
      Alert.alert("Erro", "Não foi possível excluir o motorista");
    }
  };

  const renderDadosPessoais = () => {
    const { motorista, endereco } = motoristaCompleto!;
    const estadoCivilLabel = ESTADO_CIVIL_OPTIONS.find(
      option => option.value === motorista.estado_civil
    )?.label;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color={currentTheme.primary} />
          <Text style={[styles.sectionTitle, { color: currentTheme.foreground }]}>
            Dados Pessoais
          </Text>
        </View>

        {/* Foto */}
        {motorista.foto_url && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: motorista.foto_url }} style={styles.photo} />
          </View>
        )}

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
              Nome Completo
            </Text>
            <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
              {motorista.nome}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoItem, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                CPF
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                {formatCPF(motorista.cpf)}
              </Text>
            </View>

            <View style={[styles.infoItem, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                RG
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                {formatRG(motorista.rg)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoItem, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                Data de Nascimento
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                {new Date(motorista.data_nascimento).toLocaleDateString('pt-BR')}
              </Text>
            </View>

            <View style={[styles.infoItem, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                Sexo
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                {motorista.sexo === 'M' ? 'Masculino' : 'Feminino'}
              </Text>
            </View>
          </View>

          {estadoCivilLabel && (
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                Estado Civil
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                {estadoCivilLabel}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            {motorista.email && (
              <View style={[styles.infoItem, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                  Email
                </Text>
                <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                  {motorista.email}
                </Text>
              </View>
            )}

            <View style={[styles.infoItem, { flex: 1, marginLeft: motorista.email ? 8 : 0 }]}>
              <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                Telefone
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                {formatPhone(motorista.telefone)}
              </Text>
            </View>
          </View>

          {motorista.observacoes && (
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                Observações
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                {motorista.observacoes}
              </Text>
            </View>
          )}
        </View>

        {/* Endereço */}
        {endereco && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Ionicons name="location-outline" size={20} color={currentTheme.primary} />
              <Text style={[styles.sectionTitle, { color: currentTheme.foreground }]}>
                Endereço
              </Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                  CEP
                </Text>
                <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                  {formatCEP(endereco.cep)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={[styles.infoItem, { flex: 2, marginRight: 8 }]}>
                  <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                    Logradouro
                  </Text>
                  <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                    {endereco.logradouro}
                  </Text>
                </View>

                {endereco.numero && (
                  <View style={[styles.infoItem, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                      Número
                    </Text>
                    <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                      {endereco.numero}
                    </Text>
                  </View>
                )}
              </View>

              {endereco.complemento && (
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                    Complemento
                  </Text>
                  <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                    {endereco.complemento}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <View style={[styles.infoItem, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                    Bairro
                  </Text>
                  <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                    {endereco.bairro}
                  </Text>
                </View>

                <View style={[styles.infoItem, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                    Cidade
                  </Text>
                  <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                    {endereco.cidade}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                  UF
                </Text>
                <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                  {endereco.uf}
                </Text>
              </View>

              {endereco.zona_rural && endereco.ref_zona_rural && (
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: currentTheme.mutedForeground }]}>
                    Referência Zona Rural
                  </Text>
                  <Text style={[styles.infoValue, { color: currentTheme.foreground }]}>
                    {endereco.ref_zona_rural}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    );
  };

  const renderEscalaTrabalho = () => {
    const { escalas } = motoristaCompleto!;

    if (!escalas || escalas.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.foreground }]}>
              Escala de Trabalho
            </Text>
          </View>
          <Text style={[styles.emptyText, { color: currentTheme.mutedForeground }]}>
            Nenhuma escala de trabalho cadastrada
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={20} color={currentTheme.primary} />
          <Text style={[styles.sectionTitle, { color: currentTheme.foreground }]}>
            Escala de Trabalho
          </Text>
        </View>

        {escalas.map((escala) => {
          const diaNome = DIAS_SEMANA.find(d => d.value === escala.dia_semana)?.label;
          const periodosNomes = escala.periodos.map(p => 
            PERIODOS_TRABALHO.find(pt => pt.value === p)?.label
          ).join(", ");

          return (
            <View key={escala.dia_semana} style={[styles.escalaCard, { 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border 
            }]}>
              <View style={styles.escalaHeader}>
                <Text style={[styles.escalaDia, { color: currentTheme.foreground }]}>
                  {diaNome}
                </Text>
              </View>
              
              <Text style={[styles.escalaPeriodos, { color: currentTheme.mutedForeground }]}>
                {periodosNomes}
              </Text>
              
              {escala.observacoes && (
                <Text style={[styles.escalaObservacoes, { color: currentTheme.mutedForeground }]}>
                  {escala.observacoes}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.foreground }]}>
            Carregando detalhes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!motoristaCompleto) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={currentTheme.mutedForeground} />
          <Text style={[styles.errorText, { color: currentTheme.foreground }]}>
            Motorista não encontrado
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={currentTheme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.foreground }]}>
          Detalhes do Motorista
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: currentTheme.primary }]}
            onPress={handleEditar}
          >
            <Ionicons name="pencil-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: "#ef4444", marginLeft: 8 }]}
            onPress={confirmarExclusao}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderDadosPessoais()}
        {renderEscalaTrabalho()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
  },
  infoItem: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 16,
  },
  escalaCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  escalaHeader: {
    marginBottom: 8,
  },
  escalaDia: {
    fontSize: 16,
    fontWeight: "600",
  },
  escalaPeriodos: {
    fontSize: 14,
    marginBottom: 4,
  },
  escalaObservacoes: {
    fontSize: 12,
    fontStyle: "italic",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default DetalhesMotoristaScreen;
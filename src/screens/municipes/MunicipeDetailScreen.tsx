import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks";
import { CadastroMunicipeScreen } from "./CadastroMunicipeScreen";
import { Municipe } from "../../types";
import { municipeService } from "../../services/municipeService";
import { navigate } from "../../navigation/navigationService";

interface MunicipeDetailScreenProps {
  route: {
    params: {
      id: string;
      mode?: "view" | "edit";
    };
  };
}

export const MunicipeDetailScreen: React.FC<MunicipeDetailScreenProps> = ({
  route,
}) => {
  const { theme } = useTheme();
  const { id, mode = "view" } = route.params;
  const [municipe, setMunicipe] = useState<Municipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMunicipe();
  }, [id]);

  const loadMunicipe = async () => {
    try {
      setLoading(true);
      const result = await municipeService.getMunicipeById(id);
      setMunicipe(result);
    } catch (error) {
      console.error("Erro ao carregar munícipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    navigate("Municipes");
  };

  // If in edit mode and we have the municipe data, show the edit form
  if (mode === "edit" && municipe) {
    return (
      <CadastroMunicipeScreen
        onBack={handleBackToList}
        municipeToEdit={municipe}
      />
    );
  }

  // Loading state
  if (loading) {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
        padding: 20,
      },
      text: {
        color: theme.colors.text,
        fontSize: 16,
      },
    });

    return (
      <View style={styles.container}>
        <Text style={styles.text}>Carregando munícipe...</Text>
      </View>
    );
  }

  // Error or not found state
  if (!municipe) {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
        padding: 20,
      },
      text: {
        color: theme.colors.text,
        fontSize: 16,
        textAlign: "center",
      },
    });

    return (
      <View style={styles.container}>
        <Text style={styles.text}>Munícipe não encontrado</Text>
      </View>
    );
  }

  // View mode - show municipe details
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    detail: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Munícipe</Text>
      <Text style={styles.subtitle}>ID: {id}</Text>
      <Text style={styles.detail}>Nome: {municipe.nome_completo}</Text>
      <Text style={styles.detail}>CPF: {municipe.cpf}</Text>
      {municipe.data_nascimento && (
        <Text style={styles.detail}>
          Data de Nascimento:{" "}
          {new Date(municipe.data_nascimento).toLocaleDateString("pt-BR")}
        </Text>
      )}
      {municipe.telefone && (
        <Text style={styles.detail}>Telefone: {municipe.telefone}</Text>
      )}
      {municipe.email && (
        <Text style={styles.detail}>Email: {municipe.email}</Text>
      )}
    </View>
  );
};

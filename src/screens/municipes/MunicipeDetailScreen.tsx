import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks';

interface MunicipeDetailScreenProps {
  route: {
    params: {
      id: string;
    };
  };
}

export const MunicipeDetailScreen: React.FC<MunicipeDetailScreenProps> = ({ route }) => {
  const { theme } = useTheme();
  const { id } = route.params;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Munícipe</Text>
      <Text style={styles.subtitle}>ID: {id}</Text>
      <Text style={styles.subtitle}>
        Esta tela mostrará os detalhes completos do munícipe
      </Text>
    </View>
  );
};
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../../constants/theme';

export const EstoqueMedicamentosScreen: React.FC = () => {
  const currentTheme = theme.light;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    header: {
      backgroundColor: currentTheme.primary,
      paddingVertical: 20,
      paddingHorizontal: 16,
      paddingTop: 40,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 18,
      color: currentTheme.text,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estoque de Medicamentos</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Medicamentos</Text>
        <Text style={styles.subtitle}>Tela em desenvolvimento</Text>
      </View>
    </SafeAreaView>
  );
};
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../constants/theme';
import { MotoristasContainer } from './motoristas';

export const MedicamentosScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Medicamentos</Text>
        <Text style={styles.subtitle}>Tela em desenvolvimento</Text>
      </View>
    </SafeAreaView>
  );
};

export const MotoristasScreen: React.FC = () => {
  return <MotoristasContainer />;
};

export const VeiculosScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Veículos</Text>
        <Text style={styles.subtitle}>Tela em desenvolvimento</Text>
      </View>
    </SafeAreaView>
  );
};

export const MunicipesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Munícipes</Text>
        <Text style={styles.subtitle}>Tela em desenvolvimento</Text>
      </View>
    </SafeAreaView>
  );
};

export const CadastrosBasicosScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cadastros Básicos</Text>
        <Text style={styles.subtitle}>Tela em desenvolvimento</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.light.mutedForeground,
  },
});

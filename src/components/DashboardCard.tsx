import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface DashboardCardProps {
  title: string;
  value: string;
  isDarkMode: boolean;
  type: 'default' | 'warning' | 'alert' | 'danger';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  isDarkMode,
  type,
}) => {
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const getValueColor = () => {
    switch (type) {
      case 'warning':
        return '#f59e0b';
      case 'alert':
        return '#eab308';
      case 'danger':
        return '#B8860B'; // Cor de alerta para casos críticos
      default:
        return currentTheme.text;
    }
  };

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: currentTheme.surface,
        borderColor: currentTheme.border,
      }
    ]}>
      <Text style={[styles.title, { color: currentTheme.mutedForeground }]}>
        {title}
      </Text>
      <Text style={[
        styles.value,
        {
          color: getValueColor(),
        }
      ]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
});

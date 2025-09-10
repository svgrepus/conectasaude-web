import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface AlertItem {
  id: string;
  type: 'warning' | 'expiry' | 'low-stock';
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface AlertCardProps {
  alert: AlertItem;
  isDarkMode: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, isDarkMode }) => {
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const getBackgroundColor = () => {
    switch (alert.type) {
      case 'warning':
      case 'low-stock':
        return isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)';
      case 'expiry':
        return isDarkMode ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)';
      default:
        return currentTheme.muted;
    }
  };

  const getIconName = () => {
    switch (alert.icon) {
      case 'warning':
        return 'warning';
      case 'time':
        return 'time';
      default:
        return 'alert-circle';
    }
  };

  return (
    <View style={[
      styles.alertCard,
      {
        backgroundColor: getBackgroundColor(),
      }
    ]}>
      <View style={styles.alertIcon}>
        <Ionicons
          name={getIconName() as any}
          size={20}
          color={alert.color}
        />
      </View>
      <View style={styles.alertContent}>
        <Text style={[styles.alertTitle, { color: currentTheme.text }]}>
          {alert.title}
        </Text>
        <Text style={[styles.alertDescription, { color: currentTheme.mutedForeground }]}>
          {alert.description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  alertIcon: {
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});

import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { theme } from '../constants/theme';

interface ChartComponentProps {
  isDarkMode: boolean;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({ isDarkMode }) => {
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const data = [
    { label: 'Unidade A', value: 450 },
    { label: 'Unidade B', value: 320 },
    { label: 'Unidade C', value: 180 },
    { label: 'Unidade D', value: 280 },
    { label: 'Unidade E', value: 520 },
  ];

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <View style={styles.container}>
      <View style={styles.chartArea}>
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 200; // Altura máxima de 200px
          return (
            <View key={index} style={styles.barContainer}>
              <Text style={[styles.barValue, { color: currentTheme.text }]}>
                {item.value}
              </Text>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: '#dc2626',
                  },
                ]}
              />
              <Text style={[styles.barLabel, { color: currentTheme.mutedForeground }]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 240,
    width: '100%',
    paddingHorizontal: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  bar: {
    width: 32,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    textAlign: 'center',
    maxWidth: 50,
  },
});

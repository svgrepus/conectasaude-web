import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  value?: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  maxDate?: Date;
  minDate?: Date;
}

// Função para formatar data DD/MM/AAAA
const formatDateInput = (value: string): string => {
  // Remove tudo que não é número
  const cleanValue = value.replace(/[^\d]/g, '');
  
  // Limita a 8 dígitos
  const limitedValue = cleanValue.substring(0, 8);
  
  // Aplica máscara gradualmente
  if (limitedValue.length <= 2) {
    return limitedValue;
  } else if (limitedValue.length <= 4) {
    return limitedValue.replace(/(\d{2})(\d{0,2})/, '$1/$2');
  } else {
    return limitedValue.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
  }
};

// Função para converter DD/MM/AAAA para YYYY-MM-DD
const convertToISOFormat = (dateStr: string): string => {
  if (dateStr.length !== 10) return '';
  
  const [day, month, year] = dateStr.split('/');
  
  // Validação básica
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (dayNum < 1 || dayNum > 31) return '';
  if (monthNum < 1 || monthNum > 12) return '';
  if (yearNum < 1900 || yearNum > new Date().getFullYear()) return '';
  
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const DatePicker = ({
  value,
  onDateChange,
  placeholder = "DD/MM/AAAA",
  label,
  error,
}: DatePickerProps) => {
  // Converter valor ISO para formato brasileiro se necessário
  const displayValue = value && value.includes('-') 
    ? value.split('-').reverse().join('/') 
    : value || '';

  const handleTextChange = (text: string) => {
    const formattedText = formatDateInput(text);
    
    // Se a data estiver completa (DD/MM/AAAA), converter para ISO
    if (formattedText.length === 10) {
      const isoDate = convertToISOFormat(formattedText);
      if (isoDate) {
        onDateChange(isoDate);
        return;
      }
    }
    
    // Caso contrário, manter o valor formatado
    onDateChange(formattedText);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          keyboardType="numeric"
          maxLength={10} // DD/MM/AAAA = 10 caracteres
        />
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  iconButton: {
    padding: 12,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 4,
  },
});

export default DatePicker;

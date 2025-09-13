import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { combosService, ComboOption } from '../services/combosService';

interface ComboPickerProps {
  context: string;
  subcontext: string;
  fieldKey: string;
  label: string;
  value?: string;
  onValueChange: (value: string, label: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isDarkMode?: boolean;
  required?: boolean;
}

export const ComboPicker: React.FC<ComboPickerProps> = ({
  context,
  subcontext,
  fieldKey,
  label,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  disabled = false,
  isDarkMode = false,
  required = false,
}) => {
  const [options, setOptions] = useState<ComboOption[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ComboOption | null>(null);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    loadOptions();
  }, [context, subcontext, fieldKey]);

  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find(opt => opt.option_value === value);
      setSelectedOption(option || null);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const data = await combosService.getComboOptions(context, subcontext, fieldKey);
      setOptions(data);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
      Alert.alert('Erro', 'Não foi possível carregar as opções');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option: ComboOption) => {
    setSelectedOption(option);
    onValueChange(option.option_value, option.option_label);
    setIsModalVisible(false);
  };

  const renderOption = ({ item }: { item: ComboOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        {
          backgroundColor: currentTheme.surface,
          borderBottomColor: currentTheme.border,
        },
        selectedOption?.option_value === item.option_value && {
          backgroundColor: currentTheme.primary + '20',
        }
      ]}
      onPress={() => handleSelectOption(item)}
    >
      <Text style={[
        styles.optionText,
        { color: currentTheme.text },
        selectedOption?.option_value === item.option_value && {
          color: currentTheme.primary,
          fontWeight: '600',
        }
      ]}>
        {item.option_label}
      </Text>
      {selectedOption?.option_value === item.option_value && (
        <Ionicons name="checkmark" size={20} color={currentTheme.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: currentTheme.text }]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>

      {/* Picker Button */}
      <TouchableOpacity
        style={[
          styles.pickerButton,
          {
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.border,
          },
          disabled && {
            opacity: 0.6,
            backgroundColor: currentTheme.muted,
          }
        ]}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled || loading}
      >
        <Text style={[
          styles.pickerText,
          {
            color: selectedOption ? currentTheme.text : currentTheme.mutedForeground,
          }
        ]}>
          {selectedOption ? selectedOption.option_label : placeholder}
        </Text>
        
        <View style={styles.pickerIcon}>
          {loading ? (
            <ActivityIndicator size="small" color={currentTheme.mutedForeground} />
          ) : (
            <Ionicons
              name="chevron-down"
              size={20}
              color={currentTheme.mutedForeground}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Modal com opções */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: currentTheme.surface }
          ]}>
            {/* Header do Modal */}
            <View style={[
              styles.modalHeader,
              { borderBottomColor: currentTheme.border }
            ]}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                {label}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={currentTheme.text} />
              </TouchableOpacity>
            </View>

            {/* Lista de opções */}
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.option_value}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    color: '#B8860B', // Cor de destaque para campos obrigatórios
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
  },
  pickerIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
});

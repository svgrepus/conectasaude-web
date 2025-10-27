import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ComboItem {
  label: string;
  value: string;
}

interface SimpleComboPickerProps {
  items: ComboItem[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  required?: boolean;
}

export const SimpleComboPicker: React.FC<SimpleComboPickerProps> = ({
  items,
  selectedValue,
  onValueChange,
  placeholder = 'Selecione...',
  disabled = false,
  loading = false,
  label,
  required = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);

  const handleSelectItem = (value: string) => {
    onValueChange(value);
    setIsModalVisible(false);
  };

  const renderItem = ({ item }: { item: ComboItem }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        selectedValue === item.value && styles.selectedOption
      ]}
      onPress={() => handleSelectItem(item.value)}
    >
      <Text style={[
        styles.optionText,
        selectedValue === item.value && styles.selectedOptionText
      ]}>
        {item.label}
      </Text>
      {selectedValue === item.value && (
        <Ionicons name="checkmark" size={20} color="#8A9E8E" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.pickerButton,
          disabled && styles.disabledButton
        ]}
        onPress={() => !disabled && !loading && setIsModalVisible(true)}
        disabled={disabled || loading}
      >
        <Text style={[
          styles.pickerText,
          !selectedItem && styles.placeholderText
        ]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        
        <View style={styles.pickerIcon}>
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Ionicons name="chevron-down" size={20} color="#666" />
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {label || 'Selecione uma opção'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
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
    backgroundColor: '#ffffff',
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
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#8A9E8E',
    fontWeight: '600',
  },
});
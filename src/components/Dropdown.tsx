import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownProps {
  items: DropdownItem[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  selectedValue,
  onValueChange,
  placeholder = 'Selecione...',
  disabled = false,
  loading = false,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);

  const toggleDropdown = () => {
    if (disabled || loading) return;
    setIsOpen(!isOpen);
  };

  const selectItem = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.disabledButton,
          isOpen && styles.openButton,
        ]}
        onPress={toggleDropdown}
        disabled={disabled || loading}
      >
        <Text
          style={[
            styles.buttonText,
            !selectedItem && styles.placeholderText,
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#666"
        />
      </TouchableOpacity>

      {/* Modal para garantir que apareça por cima */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.dropdownItem,
                    selectedValue === item.value && styles.selectedItem,
                  ]}
                  onPress={() => selectItem(item.value)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedValue === item.value && styles.selectedItemText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
                    <Ionicons name="checkmark" size={16} color="#8A9E8E" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
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
  openButton: {
    borderColor: '#8A9E8E',
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    maxHeight: 300,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollView: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedItem: {
    backgroundColor: '#f0f9ff',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectedItemText: {
    color: '#8A9E8E',
    fontWeight: '500',
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks';

interface Option {
  id: string | number;
  label: string;
}

interface SimpleComboProps {
  label: string;
  placeholder: string;
  value?: string | number;
  options: Option[];
  onSelect: (value: string | number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const SimpleCombo: React.FC<SimpleComboProps> = ({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
  required = false,
  disabled = false,
  style,
}) => {
  const { theme: currentTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const handleSelectOption = (optionValue: string | number) => {
    onSelect(optionValue);
    setShowModal(false);
  };

  const selectedOption = options.find(opt => opt.id === value);

  const inputStyle = {
    backgroundColor: disabled ? '#f3f4f6' : currentTheme.colors.surface,
    borderColor: error ? '#ef4444' : currentTheme.colors.border,
    color: disabled ? currentTheme.colors.textSecondary : currentTheme.colors.text,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 16,
    ...style,
  };

  const labelStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: currentTheme.colors.text,
  };

  const selectContainerStyle: ViewStyle = {
    ...inputStyle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const selectTextStyle: TextStyle = {
    flex: 1,
    color: selectedOption ? currentTheme.colors.text : currentTheme.colors.textSecondary,
    fontSize: 16,
  };

  if (Platform.OS === 'web') {
    return (
      <View>
        <Text style={labelStyle}>
          {label}{required && ' *'}
        </Text>
        <select
          value={value || ''}
          onChange={(e: any) => onSelect(e.target.value)}
          disabled={disabled}
          style={{
            ...inputStyle,
            cursor: disabled ? 'not-allowed' : 'pointer',
          } as any}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
            {error}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View>
      <Text style={labelStyle}>
        {label}{required && ' *'}
      </Text>
      <TouchableOpacity
        style={selectContainerStyle}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
        <Text style={selectTextStyle}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={currentTheme.colors.textSecondary}
        />
      </TouchableOpacity>
      {error && (
        <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}

      {/* Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderRadius: 12,
              padding: 20,
              width: '80%',
              maxWidth: 400,
              maxHeight: '70%',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 16,
                color: currentTheme.colors.text,
                textAlign: 'center',
              }}
            >
              {label}
            </Text>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: currentTheme.colors.border,
                }}
                onPress={() => handleSelectOption(option.id)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: currentTheme.colors.text,
                    textAlign: 'center',
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SimpleCombo;
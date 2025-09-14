import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

interface PhotoUploadProps {
  onPhotoSelected: (uri: string, file?: any) => void;
  currentPhoto?: string;
  label?: string;
}

export const PhotoUpload = ({
  onPhotoSelected,
  currentPhoto,
  label = "Foto do Munícipe",
}: PhotoUploadProps) => {

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos.'
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    console.log('🖼️ Iniciando seleção de imagem...');

    try {
      if (Platform.OS === 'web') {
        console.log('🌐 Modo web - usando DocumentPicker');
        // Para web, usar DocumentPicker
        const result = await DocumentPicker.getDocumentAsync({
          type: 'image/*',
          copyToCacheDirectory: true,
          multiple: false,
        });

        console.log('🔄 Resultado DocumentPicker:', result);

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          console.log('✅ Imagem selecionada:', asset.name, asset.uri);
          onPhotoSelected(asset.uri, asset);
        } else {
          console.log('❌ Seleção cancelada ou sem resultados');
        }
      } else {
        console.log('📱 Modo mobile - usando ImagePicker');
        // Para mobile, usar ImagePicker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1], // Foto quadrada
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          onPhotoSelected(asset.uri, asset);
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Não disponível', 'Câmera não disponível na versão web.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        onPhotoSelected(asset.uri, asset);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const showOptions = () => {
    const options = Platform.OS === 'web' 
      ? [
          {
            text: 'Selecionar do Computador',
            onPress: pickImage,
          },
          {
            text: 'Cancelar',
            style: 'cancel' as const,
          },
        ]
      : [
          {
            text: 'Galeria',
            onPress: pickImage,
          },
          {
            text: 'Câmera',
            onPress: takePhoto,
          },
          {
            text: 'Cancelar',
            style: 'cancel' as const,
          },
        ];

    Alert.alert(
      'Selecionar Foto',
      Platform.OS === 'web' 
        ? 'Selecione uma imagem do seu computador:'
        : 'Escolha como deseja adicionar a foto:',
      options
    );
  };

  const removePhoto = () => {
    Alert.alert(
      'Remover Foto',
      'Tem certeza que deseja remover a foto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel' as const,
        },
        {
          text: 'Remover',
          style: 'destructive' as const,
          onPress: () => onPhotoSelected(''),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.photoContainer}>
        {currentPhoto ? (
          <View style={styles.photoWrapper}>
            <Image source={{ uri: currentPhoto }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removePhoto}
            >
              <Ionicons name="close-circle" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={showOptions}
          >
            <Ionicons 
              name="camera-outline" 
              size={32} 
              color="#666" 
            />
            <Text style={styles.uploadText}>
              Adicionar Foto
            </Text>
            <Text style={styles.uploadSubText}>
              {Platform.OS === 'web' 
                ? 'Clique para selecionar do computador'
                : 'Toque para selecionar do arquivo'
              }
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {currentPhoto && (
        <TouchableOpacity
          style={styles.changeButton}
          onPress={showOptions}
        >
          <Ionicons name="camera-outline" size={16} color="#007AFF" />
          <Text style={styles.changeButtonText}>Alterar Foto</Text>
        </TouchableOpacity>
      )}
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  uploadButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  uploadText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  uploadSubText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  changeButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 4,
  },
});

export default PhotoUpload;

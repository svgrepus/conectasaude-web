import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface BrasaoJambeiroProps {
  size?: number;
  style?: any;
}

export const BrasaoJambeiro: React.FC<BrasaoJambeiroProps> = ({ 
  size = 48, 
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <Image 
        source={require('../../assets/brasao-jambeiro.png')}
        style={[
          styles.brasao,
          {
            width: size,
            height: size,
          }
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brasao: {
    // Mantém a proporção da imagem
  },
});

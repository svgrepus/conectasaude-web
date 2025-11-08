import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks";
import { BrasaoJambeiro } from "../components/BrasaoJambeiro";

const { width, height } = Dimensions.get("window");

interface ResetPasswordSuccessScreenProps {
  onGoToLogin: () => void;
}

export const ResetPasswordSuccessScreen: React.FC<ResetPasswordSuccessScreenProps> = ({
  onGoToLogin,
}) => {
  const { theme, isDark } = useTheme();

  // Fix document title for web
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Senha Atualizada - ConectaSaúde - Jambeiro";
    }
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    card: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: isDark ? "#2a2a2a" : "#E6EAE7",
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    logo: {
      width: 48,
      height: 48,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#333333",
      textAlign: "center",
      marginBottom: 8,
      fontFamily: "Arial Black, Helvetica, sans-serif",
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? "#B6B9B7" : "#B6B9B7",
      textAlign: "center",
      marginBottom: 32,
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#22c55e",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#FFFFFF" : "#333333",
      textAlign: "center",
      marginBottom: 12,
    },
    successMessage: {
      fontSize: 16,
      color: isDark ? "#B6B9B7" : "#666666",
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 24,
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    loginButton: {
      backgroundColor: "#8A9E8E",
      height: 48,
      borderRadius: 6,
      justifyContent: "center",
      width: "100%",
      marginBottom: 16,
    },
    loginButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "Arial, Helvetica, sans-serif",
      textTransform: "uppercase",
    },
    infoBox: {
      backgroundColor: isDark ? "#3a3a3a" : "#f8f9fa",
      padding: 16,
      borderRadius: 8,
      width: "100%",
      marginTop: 16,
    },
    infoText: {
      fontSize: 14,
      color: isDark ? "#B6B9B7" : "#666666",
      textAlign: "center",
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Logo and Title */}
        <View style={styles.logoContainer}>
          <BrasaoJambeiro size={48} />
          <Text style={styles.title}>ConectaSaúde</Text>
          <Text style={styles.subtitle}>Prefeitura de Jambeiro</Text>
        </View>

        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="checkmark"
            size={40}
            color="#ffffff"
          />
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Senha Atualizada!</Text>
        <Text style={styles.successMessage}>
          Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
        </Text>

        {/* Login Button */}
        <Button
          mode="contained"
          onPress={onGoToLogin}
          style={styles.loginButton}
          labelStyle={styles.loginButtonText}
          buttonColor="#8A9E8E"
        >
          FAZER LOGIN
        </Button>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Por segurança, você precisará fazer login novamente com sua nova senha.
          </Text>
        </View>
      </View>
    </View>
  );
};
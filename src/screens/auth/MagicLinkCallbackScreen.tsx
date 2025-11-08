import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { magicLinkService } from "../../services/magicLinkService";
import { authService } from "../../services/auth-simple";
import SetPasswordScreen from "./SetPasswordScreen";

interface MagicLinkCallbackScreenProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const MagicLinkCallbackScreen: React.FC<MagicLinkCallbackScreenProps> = ({
  onSuccess,
  onError,
}) => {
  const currentTheme = theme.light;
  
  const [status, setStatus] = useState<'loading' | 'first_access' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log("🔗 MagicLinkCallbackScreen: Processando callback...");
      setStatus('loading');
      setMessage('Processando seu acesso...');

      const result = await magicLinkService.handleMagicLinkCallback();

      if (result.success && result.user) {
        setUser(result.user);

        // Verificar se é primeiro acesso
        if (result.isFirstAccess || result.user.user_metadata?.is_first_access) {
          console.log("🆕 Primeiro acesso detectado");
          setStatus('first_access');
          setMessage('Primeiro acesso detectado. Defina sua senha.');
        } else {
          console.log("✅ Login realizado com sucesso");
          setStatus('success');
          setMessage('Login realizado com sucesso!');
          
          // Redirecionar após um breve delay
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            }
          }, 2000);
        }
      } else {
        console.error("❌ Erro no callback:", result.error);
        setStatus('error');
        setMessage(result.error?.message || 'Erro ao processar acesso');
        
        if (onError) {
          onError(result.error);
        }
      }
    } catch (error) {
      console.error("❌ Erro inesperado no callback:", error);
      setStatus('error');
      setMessage('Erro inesperado ao processar acesso');
      
      if (onError) {
        onError(error);
      }
    }
  };

  const handlePasswordSet = async () => {
    console.log("✅ Senha definida com sucesso - iniciando logout");
    setStatus('success');
    setMessage('Senha definida com sucesso! Redirecionando para login...');
    
    // Fazer logout imediatamente e redirecionar para login após definir senha
    setTimeout(async () => {
      try {
        console.log("🚪 Fazendo logout após definir senha...");
        await authService.signOut();
        
        // Limpar URL e redirecionar para login
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log("✅ Logout concluído - redirecionando para login");
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("❌ Erro ao fazer logout após definir senha:", error);
        // Mesmo com erro, tentar redirecionar
        if (onSuccess) {
          onSuccess();
        }
      }
    }, 1500); // Reduzido para 1.5s
  };

  // Se é primeiro acesso, mostrar tela de definir senha
  if (status === 'first_access') {
    return (
      <SetPasswordScreen
        onPasswordSet={handlePasswordSet}
        userEmail={user?.email}
        userName={user?.user_metadata?.full_name || user?.user_metadata?.name}
      />
    );
  }

  // Estados de loading, success ou error
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          {/* Ícone baseado no status */}
          <View style={[
            styles.iconContainer, 
            { 
              backgroundColor: 
                status === 'loading' ? currentTheme.muted :
                status === 'success' ? '#d4edda' :
                '#f8d7da'
            }
          ]}>
            {status === 'loading' && (
              <ActivityIndicator size="large" color={currentTheme.primary} />
            )}
            {status === 'success' && (
              <Ionicons name="checkmark-circle" size={64} color="#28a745" />
            )}
            {status === 'error' && (
              <Ionicons name="alert-circle" size={64} color="#dc3545" />
            )}
          </View>

          {/* Título */}
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {status === 'loading' && 'Processando...'}
            {status === 'success' && 'Sucesso!'}
            {status === 'error' && 'Erro'}
          </Text>

          {/* Mensagem */}
          <Text style={[styles.message, { color: currentTheme.mutedForeground }]}>
            {message}
          </Text>

          {/* Loading adicional para success */}
          {status === 'success' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={currentTheme.primary} />
              <Text style={[styles.loadingText, { color: currentTheme.mutedForeground }]}>
                Redirecionando...
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default MagicLinkCallbackScreen;
import { supabase } from './supabase';
import { Alert } from 'react-native';

export interface SessionManager {
  checkAuthAndRedirect: () => Promise<boolean>;
  handleAuthError: (error: any) => void;
  isSessionExpired: (error: any) => boolean;
}

class SessionManagerService implements SessionManager {
  private navigationRef: any = null;

  // Configurar referência de navegação para redirecionamentos
  setNavigationRef(ref: any) {
    this.navigationRef = ref;
  }

  // Verificar se usuário está autenticado
  async checkAuthAndRedirect(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('🚪 Usuário não autenticado, redirecionando para login...');
        this.redirectToLogin();
        return false;
      }
      
      console.log('✅ Usuário autenticado:', user.email);
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      this.redirectToLogin();
      return false;
    }
  }

  // Verificar se erro é de sessão expirada
  isSessionExpired(error: any): boolean {
    if (!error) return false;
    
    const sessionErrors = [
      'JWT expired',
      'Invalid JWT',
      'User not authenticated',
      'Usuário não autenticado',
      'Session expired',
      'Token expired'
    ];
    
    const errorMessage = error.message || error.toString();
    return sessionErrors.some(msg => errorMessage.includes(msg));
  }

  // Tratar erros de autenticação
  handleAuthError(error: any) {
    console.error('🔒 Erro de autenticação:', error);
    
    if (this.isSessionExpired(error)) {
      Alert.alert(
        'Sessão Expirada',
        'Sua sessão expirou. Por favor, faça login novamente.',
        [
          {
            text: 'OK',
            onPress: () => this.redirectToLogin()
          }
        ]
      );
    } else {
      // Erro genérico de autenticação
      Alert.alert(
        'Acesso Negado',
        'Você precisa estar logado para realizar esta ação.',
        [
          {
            text: 'Fazer Login',
            onPress: () => this.redirectToLogin()
          }
        ]
      );
    }
  }

  // Redirecionar para tela de login
  private redirectToLogin() {
    // Limpar sessão local
    supabase.auth.signOut();
    
    // Redirecionar para login (se navegação estiver configurada)
    if (this.navigationRef?.current) {
      try {
        this.navigationRef.current.navigate('Login');
      } catch (navError) {
        console.warn('⚠️ Erro ao navegar para login:', navError);
        // Fallback: recarregar página (para web)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } else {
      console.warn('⚠️ Navegação não configurada');
      // Fallback: recarregar página (para web)
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }

  // Fazer logout e redirecionar
  async logout() {
    try {
      await supabase.auth.signOut();
      this.redirectToLogin();
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      this.redirectToLogin();
    }
  }

  // Interceptar chamadas de API para verificar autenticação
  async withAuthCheck<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      // Verificar autenticação antes da chamada
      const isAuthenticated = await this.checkAuthAndRedirect();
      if (!isAuthenticated) {
        throw new Error('Usuário não autenticado');
      }
      
      // Executar chamada da API
      return await apiCall();
    } catch (error) {
      // Se erro é de autenticação, tratar especificamente
      if (this.isSessionExpired(error)) {
        this.handleAuthError(error);
        throw new Error('Sessão expirada');
      }
      
      // Re-lançar outros erros
      throw error;
    }
  }
}

export const sessionManager = new SessionManagerService();
export default sessionManager;
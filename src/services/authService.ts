import supabase from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName?: string;
}

class AuthService {
  // Chave para armazenar a role no localStorage
  private readonly ADMIN_ROLE_KEY = 'conectasaude_is_admin';

  async signIn({ email, password }: LoginCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Após login bem-sucedido, verificar e salvar se é admin
      if (data.user) {
        await this.checkAndSaveAdminRole(data.user);
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  // Verifica se o usuário é admin e salva na sessão
  private async checkAndSaveAdminRole(user: any) {
    try {
      const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';
      console.log('🔍 Verificando role do usuário:', {
        email: user?.email,
        appMetadataRole: user?.app_metadata?.role,
        userMetadataRole: user?.user_metadata?.role,
        isAdmin
      });
      
      // Salva no localStorage
      localStorage.setItem(this.ADMIN_ROLE_KEY, isAdmin.toString());
    } catch (error) {
      console.error('Erro ao verificar role de admin:', error);
      localStorage.setItem(this.ADMIN_ROLE_KEY, 'false');
    }
  }

  // Verifica se o usuário atual é admin (da sessão)
  public isAdmin(): boolean {
    const adminRole = localStorage.getItem(this.ADMIN_ROLE_KEY);
    return adminRole === 'true';
  }

  async signUp({ email, password, fullName }: SignUpCredentials) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      // Limpar dados da sessão local
      localStorage.removeItem(this.ADMIN_ROLE_KEY);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      // Se temos um usuário e ainda não verificamos a role, verificar agora
      if (user && !localStorage.getItem(this.ADMIN_ROLE_KEY)) {
        await this.checkAndSaveAdminRole(user);
      }
      
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      throw error;
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Erro ao obter token de acesso:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      // Verificar role quando há mudanças na autenticação
      if (event === 'SIGNED_IN' && session?.user) {
        await this.checkAndSaveAdminRole(session.user);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(this.ADMIN_ROLE_KEY);
      }
      
      // Chamar callback original
      callback(event, session);
    });
  }
}

export const authService = new AuthService();

export const getErrorMessage = (error: any): string => {
  if (error?.message) {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Email ou senha incorretos';
      case 'Email not confirmed':
        return 'Email não confirmado. Verifique sua caixa de entrada';
      case 'Password should be at least 6 characters':
        return 'A senha deve ter pelo menos 6 caracteres';
      case 'User already registered':
        return 'Usuário já cadastrado';
      case 'Invalid email':
        return 'Email inválido';
      default:
        return error.message;
    }
  }
  return 'Erro desconhecido';
};

import { User } from '../types';

// Direct Supabase API authentication service
class AuthService {
  private currentUser: User | null = null;
  private accessToken: string | null = null;
  private listeners: Array<(user: User | null) => void> = [];
  private readonly supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
  private readonly apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

  constructor() {
    // Recuperar token da sessão ao inicializar
    this.loadFromSession();
  }

  private saveToSession(user: User, token: string): void {
    try {
      sessionStorage.setItem('auth_user', JSON.stringify(user));
      sessionStorage.setItem('access_token', token);
      this.currentUser = user;
      this.accessToken = token;
    } catch (error) {
      console.error('❌ Erro ao salvar na sessão:', error);
    }
  }

  private loadFromSession(): void {
    try {
      const storedUser = sessionStorage.getItem('auth_user');
      const storedToken = sessionStorage.getItem('access_token');
      
      if (storedUser && storedToken) {
        this.currentUser = JSON.parse(storedUser);
        this.accessToken = storedToken;
        console.log('✅ AuthService: Usuário recuperado da sessão:', this.currentUser);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar da sessão:', error);
      this.clearSession();
    }
  }

  private clearSession(): void {
    try {
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('access_token');
      this.currentUser = null;
      this.accessToken = null;
    } catch (error) {
      console.error('❌ Erro ao limpar sessão:', error);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async signIn(email: string, password: string): Promise<User> {
    console.log('🔐 AuthService: Tentativa de login para:', email);
    
    try {
      // Fazer a requisição exata que funciona no Postman
      const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('❌ AuthService: Erro na autenticação:', data);
        throw new Error('Credenciais inválidas');
      }

      console.log('✅ AuthService: Resposta da API:', data);

      // Verificar se temos o access_token na resposta
      if (!data.access_token) {
        throw new Error('Token de acesso não recebido');
      }

      // Determinar role baseado no email ou resposta da API
      let role: 'admin' | 'funcionario' | 'municipe' = 'municipe';
      if (email.includes('admin') || email === 'abilio.constantinoo@gmail.com') {
        role = 'admin';
      } else if (email.includes('funcionario') || email.includes('medico') || email.includes('enferm')) {
        role = 'funcionario';
      }

      // Criar objeto de usuário a partir da resposta
      const user: User = {
        id: data.user?.id || `user_${Date.now()}`,
        email: data.user?.email || email,
        name: data.user?.user_metadata?.name || email.split('@')[0],
        role,
        created_at: data.user?.created_at || new Date().toISOString(),
      };

      console.log('✅ AuthService: Usuário autenticado:', user);
      console.log('✅ AuthService: Token de acesso:', data.access_token);

      // Salvar na sessão
      this.saveToSession(user, data.access_token);
      this.notifyListeners();
      return user;

    } catch (error) {
      console.error('❌ AuthService: Erro na requisição:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro na autenticação';
      throw new Error(errorMessage);
    }
  }

  async signUp(email: string, password: string, userData: any): Promise<User> {
    try {
      console.log('🔐 AuthService: Tentativa de registro para:', email);

      // Fazer registro via API do Supabase
      const response = await fetch(`${this.supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            nome: userData.nome,
            cpf: userData.cpf,
            telefone: userData.telefone
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('❌ AuthService: Erro no registro:', data);
        throw new Error(data.error_description || data.msg || 'Erro ao criar conta');
      }

      console.log('✅ AuthService: Registro realizado:', data);

      const user: User = {
        id: data.user?.id || `user_${Date.now()}`,
        email: data.user?.email || email,
        name: userData.nome || email.split('@')[0],
        role: 'municipe',
        created_at: data.user?.created_at || new Date().toISOString(),
      };

      // Salvar na sessão com o token se disponível
      if (data.access_token) {
        this.saveToSession(user, data.access_token);
      } else {
        this.currentUser = user;
      }
      
      this.notifyListeners();
      return user;
    } catch (error) {
      console.error('❌ AuthService: Erro no registro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta';
      throw new Error(errorMessage);
    }
  }

  async signOut(): Promise<void> {
    try {
      // Fazer logout via API do Supabase se temos token
      if (this.accessToken) {
        const response = await fetch(`${this.supabaseUrl}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': this.apiKey,
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('✅ AuthService: Logout realizado');
    } catch (error) {
      console.error('❌ AuthService: Erro no logout:', error);
    } finally {
      // Sempre limpar a sessão
      this.clearSession();
      this.notifyListeners();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    // Add callback to listeners
    this.listeners.push(callback);
    
    // Call immediately with current user
    callback(this.currentUser);

    // Return cleanup function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      callback(this.currentUser);
    });
  }
}

export const authService = new AuthService();

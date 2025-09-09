import { User } from '../types';

// Mock authentication service that doesn't depend on external libraries
class AuthService {
  private currentUser: User | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  async signIn(email: string, password: string): Promise<User> {
    console.log('🔐 AuthService: Tentativa de login para:', email);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials with more specific error messages
    if (!email || !password) {
      console.log('❌ AuthService: Campos obrigatórios não preenchidos');
      throw new Error('Email e senha são obrigatórios');
    }

    if (password !== 'admin123') {
      console.log('❌ AuthService: Senha incorreta para:', email);
      throw new Error('Senha incorreta. Tente novamente.');
    }

    console.log('✅ AuthService: Credenciais válidas para:', email);

    // Determine role based on email
    let role: 'admin' | 'funcionario' | 'municipe' = 'municipe';
    if (email.includes('admin')) {
      role = 'admin';
    } else if (email.includes('funcionario') || email.includes('medico') || email.includes('enferm')) {
      role = 'funcionario';
    }

    // Create user object
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      role,
      created_at: new Date().toISOString(),
    };

    console.log('✅ AuthService: Usuário criado:', user);
    this.currentUser = user;
    this.notifyListeners();
    return user;
  }

  async signUp(email: string, password: string, userData: any): Promise<User> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user: User = {
        id: `user_${Date.now()}`,
        email,
        name: userData.name || email.split('@')[0],
        role: 'municipe',
        created_at: new Date().toISOString(),
      };

      this.currentUser = user;
      this.notifyListeners();
      return user;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw new Error('Falha ao criar conta');
    }
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.notifyListeners();
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

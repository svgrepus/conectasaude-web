import type { User, LoginForm, RegisterForm } from '../types';

// Simplified auth service for development without Supabase
export class AuthService {
  private static currentUser: User | null = null;
  private static listeners: ((user: User | null) => void)[] = [];

  static async signIn({ email, password }: LoginForm) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser: User = {
        id: 'dev-user-' + Date.now(),
        email: email,
        role: 'municipe',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.currentUser = mockUser;
      this.notifyListeners(mockUser);

      return {
        data: {
          user: mockUser,
          session: { access_token: 'mock-dev-token' }
        },
        error: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { data: null, error: errorMessage };
    }
  }

  static async signUp({ email, password, nome, cpf, telefone }: RegisterForm) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: 'dev-user-' + Date.now(),
        email: email,
        role: 'municipe',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.currentUser = mockUser;
      this.notifyListeners(mockUser);

      return {
        data: {
          user: mockUser,
          session: { access_token: 'mock-dev-token' }
        },
        error: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { data: null, error: errorMessage };
    }
  }

  static async signOut() {
    try {
      this.currentUser = null;
      this.notifyListeners(null);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { error: errorMessage };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  static async resetPassword(email: string) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { error: errorMessage };
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { error: errorMessage };
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    
    // Immediately call with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          }
        }
      }
    };
  }

  private static notifyListeners(user: User | null) {
    this.listeners.forEach(listener => listener(user));
  }
}

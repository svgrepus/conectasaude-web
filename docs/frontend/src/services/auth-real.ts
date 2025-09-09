import { supabase } from './supabase';
import type { User, LoginForm, RegisterForm } from '../types';

export class AuthService {
  static async signIn({ email, password }: LoginForm) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { data: null, error: errorMessage };
    }
  }

  static async signUp({ email, password, nome, cpf, telefone }: RegisterForm) {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            cpf,
            telefone,
          }
        }
      });

      if (authError) throw authError;

      // If auth user was created, create the municipe record
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('municipes')
          .insert({
            id: authData.user.id,
            nome,
            cpf,
            telefone,
            email,
          });

        if (profileError) {
          console.warn('Profile creation failed:', profileError);
          // Don't throw here as the auth user was created successfully
        }
      }

      return { data: authData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { data: null, error: errorMessage };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { error: errorMessage };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      // Get additional user info based on role
      let userData: User = {
        id: user.id,
        email: user.email!,
        role: 'municipe', // default
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      // Check if user is a funcionario
      try {
        const { data: funcionario } = await supabase
          .from('funcionarios')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (funcionario) {
          userData.role = 'funcionario';
        }
      } catch (error) {
        // Ignore error, user might not be a funcionario
      }

      // Check if user is admin (from user metadata or admin table)
      if (user.user_metadata?.role === 'admin' || user.email === 'abilio.constantino@gmail.com') {
        userData.role = 'admin';
      }

      return userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { error: errorMessage };
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { error: errorMessage };
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

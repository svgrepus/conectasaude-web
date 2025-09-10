import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      setUser(user);
      return { data: user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: { 
    email: string; 
    password: string; 
    confirmPassword: string;
    nome: string; 
    cpf: string; 
    telefone?: string; 
  }) => {
    setLoading(true);
    try {
      const user = await authService.signUp(data.email, data.password, data);
      setUser(user);
      return { data: user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no registro';
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao sair';
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Para reset de senha via Supabase API
      console.log('Password reset requested for:', email);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao resetar senha';
      return { error: errorMessage };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFuncionario: user?.role === 'funcionario',
    isMunicipe: user?.role === 'municipe',
  };
};

/**
 * Utilitários de autenticação para o ConectaSaúde
 * 
 * Fornece funções auxiliares para validação de sessão,
 * formatação de erros de auth e helpers para componentes
 */

import { sessionManager } from '../services/sessionManager';

export interface AuthError {
  isAuthError: boolean;
  isSessionExpired: boolean;
  message: string;
  originalError?: any;
}

/**
 * Analisa um erro para determinar se é relacionado à autenticação
 */
export function analyzeError(error: any): AuthError {
  const errorMessage = error?.message || error?.toString() || '';
  
  const authKeywords = [
    'não autenticado',
    'not authenticated', 
    'unauthenticated',
    'unauthorized',
    'access denied',
    'invalid token',
    'token expired',
    'jwt expired',
    'session expired',
    'session invalid'
  ];

  const isAuthError = authKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );

  const sessionKeywords = [
    'jwt expired',
    'token expired', 
    'session expired',
    'session invalid'
  ];

  const isSessionExpired = sessionKeywords.some(keyword =>
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );

  return {
    isAuthError,
    isSessionExpired,
    message: errorMessage,
    originalError: error
  };
}

/**
 * Wrapper para executar operações que requerem autenticação
 * Automaticamente trata erros de sessão
 */
export async function withAuth<T>(
  operation: () => Promise<T>,
  options?: {
    showAuthError?: boolean;
    onAuthError?: () => void;
  }
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const authError = analyzeError(error);
    
    if (authError.isAuthError) {
      console.error('🔒 Erro de autenticação detectado:', authError.message);
      
      if (options?.showAuthError !== false) {
        sessionManager.handleAuthError(error);
      }
      
      if (options?.onAuthError) {
        options.onAuthError();
      }
      
      return null;
    }
    
    // Re-lança erros que não são de autenticação
    throw error;
  }
}

/**
 * Hook para verificar autenticação antes de operações críticas
 */
export async function ensureAuthenticated(): Promise<boolean> {
  try {
    return await sessionManager.checkAuthAndRedirect();
  } catch (error) {
    console.error('🔒 Erro ao verificar autenticação:', error);
    sessionManager.handleAuthError(error);
    return false;
  }
}

/**
 * Utilitário para formatação de mensagens de erro de auth
 */
export function formatAuthErrorMessage(error: any): string {
  const authError = analyzeError(error);
  
  if (authError.isSessionExpired) {
    return 'Sua sessão expirou. Faça login novamente.';
  }
  
  if (authError.isAuthError) {
    return 'Você precisa estar logado para realizar esta ação.';
  }
  
  return authError.message || 'Erro desconhecido';
}

/**
 * Constantes para tipos comuns de erro de auth
 */
export const AUTH_ERROR_TYPES = {
  SESSION_EXPIRED: 'session_expired',
  INVALID_TOKEN: 'invalid_token',
  UNAUTHORIZED: 'unauthorized',
  NOT_AUTHENTICATED: 'not_authenticated'
} as const;

/**
 * Identifica o tipo específico de erro de auth
 */
export function getAuthErrorType(error: any): keyof typeof AUTH_ERROR_TYPES | null {
  const authError = analyzeError(error);
  
  if (!authError.isAuthError) return null;
  
  const message = authError.message.toLowerCase();
  
  if (message.includes('expired')) return 'SESSION_EXPIRED';
  if (message.includes('invalid')) return 'INVALID_TOKEN';
  if (message.includes('unauthorized') || message.includes('denied')) return 'UNAUTHORIZED';
  if (message.includes('not authenticated') || message.includes('não autenticado')) return 'NOT_AUTHENTICATED';
  
  return 'UNAUTHORIZED'; // fallback
}
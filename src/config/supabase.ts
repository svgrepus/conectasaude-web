import Constants from 'expo-constants';
import { SUPABASE_MASTER_CONFIG } from '../../supabase.master.config.js';

/**
 * Configuração centralizada e segura do Supabase
 * 
 * Implementa as melhores práticas de segurança para React Native:
 * 1. Prioriza variáveis de ambiente
 * 2. Fallback para configuração do Expo
 * 3. Usa MASTER CONFIG como último recurso (nunca hardcode)
 * 4. Validação de configurações obrigatórias
 */

// Função para validar e obter configurações
const getSupabaseUrl = (): string => {
  const url = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
              process.env.EXPO_PUBLIC_SUPABASE_URL ||
              process.env.REACT_APP_SUPABASE_URL ||
              SUPABASE_MASTER_CONFIG.URL; // ← USA MASTER CONFIG, NÃO HARDCODE
  
  if (!url || !url.includes('.supabase.co')) {
    console.warn('⚠️ URL do Supabase pode estar incorreta:', url);
  }
  
  return url;
};

const getSupabaseAnonKey = (): string => {
  const key = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
              process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
              process.env.REACT_APP_SUPABASE_ANON_KEY ||
              SUPABASE_MASTER_CONFIG.ANON_KEY; // ← USA MASTER CONFIG, NÃO HARDCODE
  
  if (!key || !key.startsWith('eyJ')) {
    console.warn('⚠️ Chave do Supabase pode estar incorreta');
  }
  
  return key;
};

// Configurações centralizadas do Supabase - ÚNICA FONTE DA VERDADE
export const SUPABASE_CONFIG = {
  url: getSupabaseUrl(),
  anonKey: getSupabaseAnonKey(),
  // Configurações adicionais para diferentes ambientes
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Headers padrão para todas as requisições REST
export const getSupabaseHeaders = (accessToken?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Content-Type': 'application/json'
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
};

// URLs base para diferentes endpoints - CENTRALIZADO
export const SUPABASE_ENDPOINTS = {
  rest: `${SUPABASE_CONFIG.url}/rest/v1`,
  auth: `${SUPABASE_CONFIG.url}/auth/v1`,
  storage: `${SUPABASE_CONFIG.url}/storage/v1`,
  realtime: `${SUPABASE_CONFIG.url}/realtime/v1`
} as const;

// Função de validação para debug
export const validateSupabaseConfig = (): void => {
  console.log('🔧 Configuração do Supabase:', {
    url: SUPABASE_CONFIG.url,
    hasValidKey: SUPABASE_CONFIG.anonKey.length > 100,
    environment: SUPABASE_CONFIG.isDevelopment ? 'development' : 'production',
    endpoints: SUPABASE_ENDPOINTS
  });
};

// Log de configuração apenas em desenvolvimento
if (SUPABASE_CONFIG.isDevelopment) {
  validateSupabaseConfig();
}

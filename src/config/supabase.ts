import Constants from 'expo-constants';

/**
 * Configuração centralizada e segura do Supabase
 * 
 * Implementa as melhores práticas de segurança para React Native:
 * 1. Prioriza variáveis de ambiente
 * 2. Fallback para configuração do Expo
 * 3. Usa configuração padrão como último recurso
 * 4. Validação de configurações obrigatórias
 */

// Configuração padrão (fallback)
const DEFAULT_SUPABASE_CONFIG = {
  URL: 'https://neqkqjpynrinlsodfrkf.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM'
};

// Função para validar e obter configurações
const getSupabaseUrl = (): string => {
  const url = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
              process.env.EXPO_PUBLIC_SUPABASE_URL ||
              process.env.REACT_APP_SUPABASE_URL ||
              DEFAULT_SUPABASE_CONFIG.URL;
  
  if (!url || !url.includes('.supabase.co')) {
    console.warn('⚠️ URL do Supabase pode estar incorreta:', url);
  }
  
  return url;
};

const getSupabaseAnonKey = (): string => {
  const key = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
              process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
              process.env.REACT_APP_SUPABASE_ANON_KEY ||
              DEFAULT_SUPABASE_CONFIG.ANON_KEY;
  
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

// Headers padrão para todas as requisições REST Foto
export const getSupabaseHeadersFoto = (accessToken?: string, mimeType?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'apikey': SUPABASE_CONFIG.anonKey,
    'x-upsert': 'true',
    'Content-Type': mimeType || 'image/jpeg'
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

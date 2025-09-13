/**
 * 🔧 CONFIGURAÇÃO ÚNICA DO SUPABASE - ARQUITETURA SEGURA
 * 
 * Este é o ÚNICO local onde as configurações do Supabase devem ser alteradas.
 * Todos os serviços da aplicação devem importar deste arquivo.
 * 
 * ⚠️ IMPORTANTE: Nunca coloque credenciais sensíveis diretamente no código!
 * Use sempre variáveis de ambiente para produção.
 * 
 * 📋 Como usar:
 * 1. Para desenvolvimento: Copie .env.example para .env.local
 * 2. Para produção: Configure as variáveis no seu provedor de deploy
 * 3. Para Expo: Configure no app.json na seção "extra"
 * 4. Para alterar configuração: Edite supabase.master.config.js e execute npm run update-all-configs
 */

import Constants from 'expo-constants';

/**
 * 🔄 Sincronizado automaticamente em: 2025-09-13T17:42:46.587Z
 * 📥 Fonte: supabase.master.config.js
 */
import { SUPABASE_MASTER_CONFIG } from '../../supabase.master.config.js';

/**
 * 🔄 NUNCA MAIS HARDCODE - USA MASTER CONFIG COMO FALLBACK
 * 📥 Fonte: supabase.master.config.js
 */

// 🌍 Configurações de ambiente
const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// 🔑 Função para obter a URL do Supabase de forma segura
const getSupabaseUrl = (): string => {
  // Ordem de prioridade:
  // 1. Expo Constants (app.json)
  // 2. Variáveis de ambiente Expo
  // 3. Variáveis de ambiente React
  // 4. Fallback para desenvolvimento (apenas)
  
  const url = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
              process.env.EXPO_PUBLIC_SUPABASE_URL ||
              process.env.REACT_APP_SUPABASE_URL ||
              SUPABASE_MASTER_CONFIG.URL; // ← USA MASTER CONFIG, NÃO HARDCODE
  
  if (!url) {
    throw new Error('🚨 URL do Supabase não configurada! Verifique suas variáveis de ambiente.');
  }
  
  if (!url.includes('.supabase.co')) {
    console.warn('⚠️ URL do Supabase pode estar incorreta:', url);
  }
  
  return url;
};

// 🔑 Função para obter a chave anônima do Supabase de forma segura
const getSupabaseAnonKey = (): string => {
  const key = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
              process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
              process.env.REACT_APP_SUPABASE_ANON_KEY ||
              SUPABASE_MASTER_CONFIG.ANON_KEY; // ← USA MASTER CONFIG, NÃO HARDCODE
  
  if (!key) {
    throw new Error('🚨 Chave do Supabase não configurada! Verifique suas variáveis de ambiente.');
  }
  
  if (!key.startsWith('eyJ')) {
    console.warn('⚠️ Chave do Supabase pode estar incorreta');
  }
  
  return key;
};

/**
 * 🏠 CONFIGURAÇÃO CENTRAL DO SUPABASE
 * 
 * Esta é a ÚNICA fonte da verdade para todas as configurações do Supabase.
 * Todos os serviços devem usar essas configurações.
 */
export const SUPABASE_CONFIG = {
  // URLs e chaves obtidas de forma segura
  url: getSupabaseUrl(),
  anonKey: getSupabaseAnonKey(),
  
  // Configurações de ambiente
  env: ENV,
  
  // Configurações adicionais do cliente
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'conecta-saude-web',
      },
    },
  },
} as const;

/**
 * 📡 ENDPOINTS CENTRALIZADOS
 * 
 * Todos os endpoints do Supabase organizados por categoria.
 */
export const SUPABASE_ENDPOINTS = {
  // API REST para operações CRUD
  rest: `${SUPABASE_CONFIG.url}/rest/v1`,
  
  // Autenticação
  auth: `${SUPABASE_CONFIG.url}/auth/v1`,
  
  // Storage para arquivos
  storage: `${SUPABASE_CONFIG.url}/storage/v1`,
  
  // Real-time para subscriptions
  realtime: `${SUPABASE_CONFIG.url}/realtime/v1`,
  
  // Edge Functions
  functions: `${SUPABASE_CONFIG.url}/functions/v1`,
} as const;

/**
 * 🔧 GERADOR DE HEADERS PADRONIZADOS
 * 
 * Todos os serviços devem usar esta função para gerar headers consistentes.
 * 
 * @param accessToken Token de acesso do usuário (opcional)
 * @returns Headers padronizados para requisições
 */
export const getSupabaseHeaders = (accessToken?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    'X-Client-Info': 'conecta-saude-web',
  };

  // Adicionar token de autorização se fornecido
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
};

/**
 * 🧪 VALIDAÇÃO DE CONFIGURAÇÃO
 * 
 * Função para validar se todas as configurações estão corretas.
 * Útil para debug e troubleshooting.
 */
export const validateSupabaseConfig = (): {
  isValid: boolean;
  errors: string[];
  config: object;
} => {
  const errors: string[] = [];
  
  // Validar URL
  if (!SUPABASE_CONFIG.url) {
    errors.push('URL do Supabase não configurada');
  } else if (!SUPABASE_CONFIG.url.includes('.supabase.co')) {
    errors.push('URL do Supabase parece estar incorreta');
  }
  
  // Validar chave
  if (!SUPABASE_CONFIG.anonKey) {
    errors.push('Chave anônima do Supabase não configurada');
  } else if (!SUPABASE_CONFIG.anonKey.startsWith('eyJ')) {
    errors.push('Chave anônima do Supabase parece estar incorreta');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    config: {
      url: SUPABASE_CONFIG.url,
      hasValidKey: SUPABASE_CONFIG.anonKey.length > 100,
      environment: SUPABASE_CONFIG.env.isDevelopment ? 'development' : 'production',
      endpoints: SUPABASE_ENDPOINTS,
    },
  };
};

// 📊 Log de configuração apenas em desenvolvimento
if (SUPABASE_CONFIG.env.isDevelopment) {
  const validation = validateSupabaseConfig();
  
  if (validation.isValid) {
    console.log('✅ Configuração do Supabase validada:', validation.config);
  } else {
    console.error('❌ Problemas na configuração do Supabase:', validation.errors);
  }
}

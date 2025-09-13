/**
 * 🔧 Configurações centralizadas da aplicação
 * 
 * Este arquivo exporta todas as configurações centralizadas do projeto,
 * seguindo as melhores práticas do React Native/Expo para arquitetura segura.
 * 
 * 🆕 NOVA VERSÃO SEGURA: Todas as configurações agora usam supabase-secure.ts
 */

// Configuração principal (nova e segura)
export * from './supabase-secure';

// Configuração legada (manter para compatibilidade)
export * from './supabase';

// Exportações organizadas para facilitar o uso (RECOMENDADO)
export { 
  SUPABASE_CONFIG, 
  getSupabaseHeaders, 
  SUPABASE_ENDPOINTS,
  validateSupabaseConfig
} from './supabase-secure';

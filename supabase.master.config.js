/**
 * 🔑 CONFIGURAÇÃO MASTER DO SUPABASE
 * 
 * ⚠️ ESTE É O ÚNICO LUGAR PARA ALTERAR URL E API KEY!
 * 
 * Todos os outros arquivos devem importar deste arquivo.
 * Se você precisar alterar a URL ou API Key, altere APENAS AQUI.
 * 
 * 📍 COMO ALTERAR:
 * 1. Altere as constantes abaixo
 * 2. Execute: npm run update-all-configs
 * 3. Pronto! Todos os arquivos serão atualizados automaticamente
 */

// 🔑 CONFIGURAÇÃO MASTER - ALTERE APENAS AQUI!
const SUPABASE_MASTER_CONFIG = {
  // 🌐 URL do projeto Supabase
  URL: 'https://neqkqjpynrinlsodfrkf.supabase.com',
  
  // 🔐 Chave anônima do Supabase
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM',
  
  // 📊 Metadados
  PROJECT_REF: 'neqkqjpynrinlsodfrkf',
  REGION: 'sa-east-1',
  LAST_UPDATED: '2025-09-13',
  UPDATED_BY: 'sistema-automatico'
};

// 🔗 URLs derivadas automaticamente
const SUPABASE_ENDPOINTS_MASTER = {
  REST: `${SUPABASE_MASTER_CONFIG.URL}/rest/v1`,
  AUTH: `${SUPABASE_MASTER_CONFIG.URL}/auth/v1`,
  STORAGE: `${SUPABASE_MASTER_CONFIG.URL}/storage/v1`,
  REALTIME: `${SUPABASE_MASTER_CONFIG.URL}/realtime/v1`,
  FUNCTIONS: `${SUPABASE_MASTER_CONFIG.URL}/functions/v1`
};

// 🛡️ Validação automática
const validateConfig = () => {
  const { URL, ANON_KEY } = SUPABASE_MASTER_CONFIG;
  
  if (!URL.includes('.supabase.co')) {
    throw new Error('❌ URL do Supabase inválida!');
  }
  
  if (!ANON_KEY.startsWith('eyJ')) {
    throw new Error('❌ Chave do Supabase inválida!');
  }
  
  console.log('✅ Configuração master validada:', {
    url: URL,
    hasValidKey: ANON_KEY.length > 100,
    project: SUPABASE_MASTER_CONFIG.PROJECT_REF
  });
};

// Validar apenas em desenvolvimento
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  validateConfig();
}

// Para compatibilidade com scripts Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPABASE_MASTER_CONFIG,
    SUPABASE_ENDPOINTS_MASTER
  };
}

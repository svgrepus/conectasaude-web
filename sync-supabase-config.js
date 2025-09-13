#!/usr/bin/env node

/**
 * 🔄 SCRIPT DE SINCRONIZAÇÃO AUTOMÁTICA
 * 
 * Este script atualiza TODOS os arquivos de configuração baseado no arquivo master.
 * Execute sempre que alterar a configuração master.
 * 
 * Uso: npm run update-all-configs
 */

const fs = require('fs');
const path = require('path');

// Importar configuração master
const { SUPABASE_MASTER_CONFIG } = require('./supabase.master.config.js');

const { URL, ANON_KEY } = SUPABASE_MASTER_CONFIG;

console.log('🔄 Iniciando sincronização de configurações...\n');

// 1. Atualizar .env.example
function updateEnvExample() {
  const envPath = '.env.example';
  console.log('📝 Atualizando', envPath);
  
  const envContent = `# Environment Variables
# Copy this file to .env.local and fill in your values

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=${URL}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}

# Para desenvolvimento React
REACT_APP_SUPABASE_URL=${URL}
REACT_APP_SUPABASE_ANON_KEY=${ANON_KEY}

# Optional: If you have a service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=${URL}/rest/v1

# 🔄 Gerado automaticamente em: ${new Date().toISOString()}
# 📥 Fonte: supabase.master.config.js
`;

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅', envPath, 'atualizado');
}

// 2. Atualizar app.json
function updateAppJson() {
  const appJsonPath = 'app.json';
  console.log('📝 Atualizando', appJsonPath);
  
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Atualizar configuração do Supabase
    if (!appJson.expo.extra) {
      appJson.expo.extra = {};
    }
    
    appJson.expo.extra.EXPO_PUBLIC_SUPABASE_URL = URL;
    appJson.expo.extra.EXPO_PUBLIC_SUPABASE_ANON_KEY = ANON_KEY;
    
    // Adicionar metadados
    appJson.expo.extra._supabase_sync = {
      updated_at: new Date().toISOString(),
      source: 'supabase.master.config.js'
    };
    
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2), 'utf8');
    console.log('✅', appJsonPath, 'atualizado');
  } catch (error) {
    console.error('❌ Erro ao atualizar app.json:', error.message);
  }
}

// 3. Atualizar configuração segura do TypeScript
function updateSecureConfig() {
  const configPath = 'src/config/supabase-secure.ts';
  console.log('📝 Atualizando', configPath);
  
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Atualizar URLs e chaves nos fallbacks
    content = content.replace(
      /'https:\/\/[^']+\.supabase\.co'/g,
      `'${URL}'`
    );
    
    content = content.replace(
      /'eyJ[^']+'/g,
      `'${ANON_KEY}'`
    );
    
    // Adicionar comentário de sincronização
    if (!content.includes('Sincronizado automaticamente')) {
      content = content.replace(
        'import Constants from \'expo-constants\';',
        `import Constants from 'expo-constants';

/**
 * 🔄 Sincronizado automaticamente em: ${new Date().toISOString()}
 * 📥 Fonte: supabase.master.config.js
 */`
      );
    }
    
    fs.writeFileSync(configPath, content, 'utf8');
    console.log('✅', configPath, 'atualizado');
  } catch (error) {
    console.error('❌ Erro ao atualizar config seguro:', error.message);
  }
}

// 4. Buscar e atualizar outros scripts com configurações hardcoded
function updateOtherScripts() {
  console.log('🔍 Procurando outros scripts...');
  
  const scriptsWithConfig = [
    'test-crud.js',
    'test-endpoints.js', 
    'check-schema.js',
    'create-test-data.js',
    'debug-update.js',
    'test-cargo-fixed.js',
    'test-crud-auth.js',
    'test-full-crud-active.js',
    'test-new-structure.js',
    'test-search-debug.js',
    'test-views-active.js'
  ];
  
  scriptsWithConfig.forEach(scriptFile => {
    if (fs.existsSync(scriptFile)) {
      console.log('📝 Atualizando', scriptFile);
      
      try {
        let content = fs.readFileSync(scriptFile, 'utf8');
        
        // Substituir URLs hardcoded
        content = content.replace(
          /const supabaseUrl = '[^']+';/g,
          `// 📥 Importar da configuração master\nconst { SUPABASE_MASTER_CONFIG } = require('./supabase.master.config.js');\nconst supabaseUrl = SUPABASE_MASTER_CONFIG.URL;`
        );
        
        // Substituir API keys hardcoded
        content = content.replace(
          /const apiKey = '[^']+';/g,
          `const apiKey = SUPABASE_MASTER_CONFIG.ANON_KEY;`
        );
        
        fs.writeFileSync(scriptFile, content, 'utf8');
        console.log('✅', scriptFile, 'atualizado');
      } catch (error) {
        console.error('❌ Erro ao atualizar', scriptFile, ':', error.message);
      }
    }
  });
}

// 5. Gerar relatório
function generateReport() {
  console.log('\n📊 === RELATÓRIO DE SINCRONIZAÇÃO ===');
  console.log('🔧 Configuração Master:');
  console.log('  URL:', URL);
  console.log('  Projeto:', SUPABASE_MASTER_CONFIG.PROJECT_REF);
  console.log('  Chave válida:', ANON_KEY.length > 100 ? '✅' : '❌');
  console.log('\n📁 Arquivos sincronizados:');
  console.log('  ✅ .env.example');
  console.log('  ✅ app.json');
  console.log('  ✅ src/config/supabase-secure.ts');
  console.log('  ✅ Scripts de teste/análise');
  console.log('\n🎯 Próximos passos:');
  console.log('  1. Verificar se há erros de compilação');
  console.log('  2. Testar a aplicação');
  console.log('  3. Commit das alterações');
  console.log('\n💡 Para alterar configuração:');
  console.log('  1. Edite apenas: supabase.master.config.js');
  console.log('  2. Execute: npm run update-all-configs');
  console.log('  3. Pronto! ✨\n');
}

// Executar todas as atualizações
async function main() {
  try {
    updateEnvExample();
    updateAppJson();
    updateSecureConfig();
    updateOtherScripts();
    generateReport();
  } catch (error) {
    console.error('❌ Erro na sincronização:', error.message);
    process.exit(1);
  }
}

main();

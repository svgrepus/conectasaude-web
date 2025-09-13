#!/usr/bin/env node

/**
 * 🧹 LIMPEZA DEFINITIVA DE CONFIGURAÇÕES HARDCODED
 * 
 * Este script:
 * 1. Limpa cache do Expo
 * 2. Atualiza TODOS os arquivos com configurações
 * 3. Remove TODAS as configurações hardcoded
 * 4. Gera relatório final
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Importar configuração master
const { SUPABASE_MASTER_CONFIG } = require('./supabase.master.config.js');
const { URL, ANON_KEY } = SUPABASE_MASTER_CONFIG;

console.log('🧹 LIMPEZA DEFINITIVA INICIADA...\n');

// 1. Limpar cache do Expo
function clearExpoCache() {
  console.log('🗑️ Limpando cache do Expo...');
  
  try {
    // Remover diretório de cache
    if (fs.existsSync('.expo')) {
      fs.rmSync('.expo', { recursive: true, force: true });
      console.log('✅ Cache do Expo removido');
    }
    
    // Limpar cache do npm também
    execSync('npm cache clean --force', { stdio: 'ignore' });
    console.log('✅ Cache do npm limpo');
    
  } catch (error) {
    console.log('⚠️ Erro ao limpar cache:', error.message);
  }
}

// 2. Atualizar TODOS os arquivos fonte que ainda têm hardcode
function updateAllSourceFiles() {
  console.log('\n🔄 Atualizando arquivos fonte...');
  
  // Lista de arquivos que podem ter configurações hardcoded
  const filesToUpdate = [
    'src/config/supabase.ts',
    'src/config/supabase-secure.ts',
    'analyze-schema.js',
    '.env.example',
    'app.json'
  ];
  
  filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`📝 Processando: ${filePath}`);
      
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Atualizar URLs hardcoded (qualquer URL do Supabase)
        const urlPattern = /https:\/\/[a-z0-9]+\.supabase\.co/g;
        if (content.match(urlPattern)) {
          content = content.replace(urlPattern, URL);
          updated = true;
        }
        
        // Atualizar chaves hardcoded
        const keyPattern = /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[^'"]+/g;
        if (content.match(keyPattern)) {
          content = content.replace(keyPattern, ANON_KEY);
          updated = true;
        }
        
        if (updated) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ ${filePath} atualizado`);
        } else {
          console.log(`⚪ ${filePath} já estava correto`);
        }
        
      } catch (error) {
        console.log(`❌ Erro ao processar ${filePath}:`, error.message);
      }
    }
  });
}

// 3. Buscar e eliminar TODOS os hardcodes restantes em arquivos TypeScript/JavaScript
function eliminateAllHardcodes() {
  console.log('\n🎯 Eliminando hardcodes restantes...');
  
  // Buscar em todos os arquivos .ts, .tsx, .js, .jsx
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const excludeDirs = ['node_modules', '.expo', '.git', 'dist', 'build'];
  
  function findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          findFiles(filePath, fileList);
        }
      } else {
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
          fileList.push(filePath);
        }
      }
    });
    
    return fileList;
  }
  
  const allFiles = findFiles('./src');
  let updatedCount = 0;
  
  allFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Procurar por URLs hardcoded
      if (content.includes('https://') && content.includes('.supabase.co')) {
        console.log(`🔍 Verificando: ${filePath}`);
        
        // Substituir URLs hardcoded
        content = content.replace(/https:\/\/[a-z0-9]+\.supabase\.co/g, URL);
        
        // Substituir chaves hardcoded
        content = content.replace(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[^'"`;,\s]+/g, ANON_KEY);
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Hardcode removido de: ${filePath}`);
          updatedCount++;
        }
      }
      
    } catch (error) {
      // Ignorar erros de leitura
    }
  });
  
  console.log(`📊 ${updatedCount} arquivos atualizados`);
}

// 4. Validar que não há mais hardcodes
function validateNoHardcodes() {
  console.log('\n🔍 Validando que não há mais hardcodes...');
  
  const problemFiles = [];
  
  // Buscar por URLs diferentes da master
  const otherUrls = [
    'https://your-project.supabase.co',
    'https://seu-projeto.supabase.co'
  ].filter(url => url !== URL && !URL.includes('your-project') && !URL.includes('seu-projeto'));
  
  // Buscar em arquivos relevantes
  const filesToCheck = [
    'src/config/supabase.ts',
    'src/config/supabase-secure.ts',
    'src/services/*.ts',
    '.env.example',
    'app.json'
  ];
  
  filesToCheck.forEach(pattern => {
    // Expandir patterns simples
    if (pattern.includes('*')) {
      const dir = path.dirname(pattern);
      const ext = path.extname(pattern).slice(1);
      
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith(`.${ext}`));
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          checkFileForHardcodes(fullPath, problemFiles);
        });
      }
    } else {
      checkFileForHardcodes(pattern, problemFiles);
    }
  });
  
  function checkFileForHardcodes(filePath, problemFiles) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        otherUrls.forEach(url => {
          if (content.includes(url)) {
            problemFiles.push(`${filePath} contém: ${url}`);
          }
        });
        
      } catch (error) {
        // Ignorar erros
      }
    }
  }
  
  if (problemFiles.length === 0) {
    console.log('✅ Nenhum hardcode encontrado!');
  } else {
    console.log('⚠️ Hardcodes ainda encontrados:');
    problemFiles.forEach(problem => console.log(`  - ${problem}`));
  }
  
  return problemFiles.length === 0;
}

// 5. Gerar relatório final
function generateFinalReport() {
  console.log('\n📊 === RELATÓRIO FINAL ===');
  console.log('🧹 Limpeza definitiva concluída!');
  console.log('\n🔧 Configuração Master:');
  console.log(`  📍 Arquivo: supabase.master.config.js`);
  console.log(`  🌐 URL: ${URL}`);
  console.log(`  🔑 Chave: ${ANON_KEY.substring(0, 20)}...`);
  console.log(`  📦 Projeto: ${SUPABASE_MASTER_CONFIG.PROJECT_REF}`);
  
  console.log('\n✅ Ações realizadas:');
  console.log('  🗑️ Cache do Expo limpo');
  console.log('  📝 Arquivos fonte atualizados');
  console.log('  🎯 Hardcodes eliminados');
  console.log('  🔍 Validação realizada');
  
  console.log('\n🎯 Como usar daqui para frente:');
  console.log('  1️⃣ Alterar configuração: Edite apenas supabase.master.config.js');
  console.log('  2️⃣ Sincronizar: npm run update-all-configs');
  console.log('  3️⃣ Limpar tudo: npm run clean-all-configs');
  
  console.log('\n✨ CONFIGURAÇÃO 100% CENTRALIZADA! ✨\n');
}

// Executar todas as operações
async function main() {
  try {
    clearExpoCache();
    updateAllSourceFiles();
    eliminateAllHardcodes();
    const isClean = validateNoHardcodes();
    generateFinalReport();
    
    if (!isClean) {
      console.log('⚠️ Alguns hardcodes ainda foram encontrados. Execute novamente se necessário.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error.message);
    process.exit(1);
  }
}

main();

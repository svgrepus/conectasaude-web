// 📥 IMPORTAR DA CONFIGURAÇÃO MASTER (ÚNICA FONTE DA VERDADE)
const { SUPABASE_MASTER_CONFIG, SUPABASE_ENDPOINTS_MASTER } = require('./supabase.master.config.js');

// ✅ Usar configuração centralizada
const supabaseUrl = SUPABASE_MASTER_CONFIG.URL;
const apiKey = SUPABASE_MASTER_CONFIG.ANON_KEY;

let accessToken = null;

async function authenticate() {
  console.log('\n🔐 === FAZENDO LOGIN ===');
  
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'abilio.constantino@gmail.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.access_token) {
      accessToken = data.access_token;
      console.log('✅ Login realizado com sucesso!');
      return true;
    } else {
      console.log('❌ Falha no login:', data.error || data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na autenticação:', error.message);
    return false;
  }
}

function getHeaders() {
  const headers = {
    'apikey': apiKey,
    'Content-Type': 'application/json'
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
}

async function checkCurrentSchema() {
  console.log('\n📊 === VERIFICANDO SCHEMA ATUAL ===');
  
  try {
    // Buscar alguns registros para ver a estrutura atual
    const response = await fetch(`${supabaseUrl}/rest/v1/basic_roles?limit=3`, {
      headers: getHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📋 Estrutura atual da tabela basic_roles:');
      if (data.length > 0) {
        console.log('📝 Exemplo de registro:', JSON.stringify(data[0], null, 2));
        console.log('🔑 Campos disponíveis:', Object.keys(data[0]));
        console.log('📊 Tipo do ID:', typeof data[0].id, '| Valor:', data[0].id);
      } else {
        console.log('⚠️ Tabela vazia');
      }
    } else {
      const error = await response.text();
      console.log('❌ Erro ao buscar schema:', error);
    }
    
  } catch (error) {
    console.log('❌ Erro na verificação do schema:', error.message);
  }
}

async function testStandardPattern() {
  console.log('\n🧪 === TESTANDO PADRÃO PADRONIZADO ===');
  console.log('Vamos simular como seria se a tabela seguisse o padrão:');
  console.log('- ID: integer auto-increment');
  console.log('- Campo: name (não nome)');
  console.log('- Estrutura igual às outras tabelas');
  
  // Vamos testar com as outras tabelas que funcionam para comparar
  const workingTables = [
    { name: 'Tipos de Doença', table: 'basic_health_disease_types' },
    { name: 'Tipos de Veículo', table: 'basic_vehicle_types' }
  ];

  for (const tableInfo of workingTables) {
    console.log(`\n📝 Estrutura de ${tableInfo.name} (${tableInfo.table}):`);
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${tableInfo.table}?limit=1`, {
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          console.log('📊 Campos:', Object.keys(data[0]));
          console.log('🔑 Tipo do ID:', typeof data[0].id);
          console.log('📝 Campos de nome:', data[0].name ? 'name ✅' : 'sem name ❌');
        }
      }
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }
  }
}

async function proposeNewStructure() {
  console.log('\n💡 === ESTRUTURA PROPOSTA PARA basic_roles ===');
  console.log(`
Nova estrutura sugerida:
{
  "id": number,           // Integer auto-increment (igual às outras)
  "name": string,         // Padronizar para 'name' (não 'nome')
  "description": string,  // Opcional, para consistência 
  "created_at": string,   // Timestamp
  "updated_at": string,   // Timestamp  
  "deleted_at": string|null // Soft delete
}

Benefícios:
✅ ID numérico funciona melhor com React Native
✅ Campo 'name' igual às outras tabelas
✅ Mesmo padrão de CRUD que já funciona
✅ Códigos existentes precisam de menos ajustes
✅ Facilita manutenção e compreensão

SQL para atualizar (sugestão):
-- Backup dos dados existentes
CREATE TABLE basic_roles_backup AS SELECT * FROM basic_roles;

-- Recriar tabela com nova estrutura
DROP TABLE basic_roles;
CREATE TABLE basic_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Migrar dados (exemplo)
INSERT INTO basic_roles (name, created_at, updated_at, deleted_at)
SELECT nome, created_at, updated_at, deleted_at 
FROM basic_roles_backup;
  `);
}

async function main() {
  const authenticated = await authenticate();
  
  if (authenticated) {
    await checkCurrentSchema();
    await testStandardPattern();
    await proposeNewStructure();
  } else {
    console.log('\n❌ Não foi possível autenticar. Abortando análise.');
  }
}

main().catch(console.error);

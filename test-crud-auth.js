const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

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
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.access_token) {
      accessToken = data.access_token;
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Usuário:', data.user?.email);
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

async function testCrudOperations() {
  console.log('\n🧪 === TESTANDO OPERAÇÕES CRUD AUTENTICADAS ===');
  
  const endpoints = [
    {
      name: 'Tipos de Doença',
      table: 'basic_health_disease_types',
      testData: { name: 'Teste Tipo Doença', description: 'Teste de criação autenticada' }
    },
    {
      name: 'Tipos de Veículo', 
      table: 'basic_vehicle_types',
      testData: { name: 'Teste Tipo Veículo', description: 'Teste de criação autenticada' }
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📝 Testando ${endpoint.name} (${endpoint.table}):`);
    
    try {
      // Testar CREATE
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint.table}`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(endpoint.testData)
      });

      if (createResponse.ok) {
        const created = await createResponse.json();
        console.log(`✅ CREATE funcionou:`, created[0]);
        
        // Testar UPDATE
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint.table}?id=eq.${created[0].id}`, {
          method: 'PATCH',
          headers: { ...getHeaders(), 'Prefer': 'return=representation' },
          body: JSON.stringify({ name: endpoint.testData.name + ' (Atualizado)' })
        });

        if (updateResponse.ok) {
          const updated = await updateResponse.json();
          console.log(`✅ UPDATE funcionou:`, updated[0]);
        } else {
          console.log(`❌ UPDATE falhou:`, await updateResponse.text());
        }
        
        // Testar DELETE (soft delete)
        const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint.table}?id=eq.${created[0].id}`, {
          method: 'PATCH',
          headers: { ...getHeaders(), 'Prefer': 'return=representation' },
          body: JSON.stringify({ deleted_at: new Date().toISOString() })
        });

        if (deleteResponse.ok) {
          const deleted = await deleteResponse.json();
          console.log(`✅ DELETE funcionou:`, deleted[0]);
        } else {
          console.log(`❌ DELETE falhou:`, await deleteResponse.text());
        }
        
      } else {
        const error = await createResponse.text();
        console.log(`❌ CREATE falhou:`, error);
      }
      
    } catch (error) {
      console.log(`❌ Erro geral para ${endpoint.name}:`, error.message);
    }
  }
  
  // Testar basic_roles separadamente (schema diferente)
  console.log(`\n📝 Testando Cargos (basic_roles):`);
  
  // Primeiro vamos ver o schema real da tabela
  try {
    const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?limit=1`, {
      headers: getHeaders()
    });

    if (schemaResponse.ok) {
      const sample = await schemaResponse.json();
      console.log('📊 Schema da tabela basic_roles (sample):', sample[0] || 'Tabela vazia');
    }
    
    // Testar com diferentes combinações de campos
    const testFields = [
      { title: 'Teste Cargo 1' }, // título
      { name: 'Teste Cargo 2' },  // nome
      { role_name: 'Teste Cargo 3' }, // nome do cargo
      { description: 'Apenas descrição' }
    ];
    
    for (const [index, testData] of testFields.entries()) {
      console.log(`\n🧪 Tentativa ${index + 1} com campos:`, Object.keys(testData));
      
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(testData)
      });

      if (createResponse.ok) {
        const created = await createResponse.json();
        console.log(`✅ CREATE funcionou com:`, testData, '→', created[0]);
        break; // Se funcionou, sair do loop
      } else {
        const error = await createResponse.text();
        console.log(`❌ CREATE falhou com ${Object.keys(testData)}:`, error);
      }
    }
    
  } catch (error) {
    console.log(`❌ Erro geral para basic_roles:`, error.message);
  }
}

async function main() {
  const authenticated = await authenticate();
  
  if (authenticated) {
    await testCrudOperations();
  } else {
    console.log('\n❌ Não foi possível autenticar. Abortando testes.');
  }
}

main().catch(console.error);

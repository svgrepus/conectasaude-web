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

async function testFullCRUDWithActiveViews() {
  console.log('\n🚀 === TESTANDO CRUD COMPLETO COM VIEWS _ACTIVE ===');
  
  const endpoints = [
    { 
      name: 'Cargos', 
      view: 'basic_roles_active',
      createData: { name: 'Teste Cargo View Active' },
      updateData: { name: 'Teste Cargo UPDATED via View' }
    },
    { 
      name: 'Tipos de Doença', 
      view: 'basic_health_disease_types_active',
      createData: { name: 'Teste Tipo Doença View', description: 'Teste via view active' },
      updateData: { name: 'Teste Tipo Doença UPDATED', description: 'Atualizado via view' }
    },
    { 
      name: 'Tipos de Veículo', 
      view: 'basic_vehicle_types_active',
      createData: { name: 'Teste Tipo Veículo View', description: 'Teste via view active' },
      updateData: { name: 'Teste Tipo Veículo UPDATED', description: 'Atualizado via view' }
    },
    { 
      name: 'Doenças Crônicas', 
      view: 'basic_health_chronic_diseases_active',
      createData: { name: 'Teste Doença Crônica View', description: 'Teste via view active' },
      updateData: { name: 'Teste Doença Crônica UPDATED', description: 'Atualizado via view' }
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📝 === TESTANDO ${endpoint.name.toUpperCase()} ===`);
    
    try {
      // 1. CREATE
      console.log(`\n1️⃣ CREATE ${endpoint.name}:`);
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint.view}`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(endpoint.createData)
      });

      console.log(`📊 CREATE Status: ${createResponse.status}`);
      
      if (createResponse.ok) {
        const created = await createResponse.json();
        console.log(`✅ CREATE funcionou:`, created[0]);
        
        const itemId = created[0].id;
        
        // 2. READ (verificar se aparece na view)
        console.log(`\n2️⃣ READ ${endpoint.name} (verificando na view):`);
        const readResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint.view}?id=eq.${itemId}`, {
          headers: getHeaders()
        });

        if (readResponse.ok) {
          const read = await readResponse.json();
          if (read.length > 0) {
            console.log(`✅ READ funcionou:`, read[0].name);
          } else {
            console.log(`❌ Item não encontrado na view`);
          }
        } else {
          console.log(`❌ READ falhou:`, await readResponse.text());
        }
        
        // 3. UPDATE
        console.log(`\n3️⃣ UPDATE ${endpoint.name}:`);
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint.view}?id=eq.${itemId}`, {
          method: 'PATCH',
          headers: { ...getHeaders(), 'Prefer': 'return=representation' },
          body: JSON.stringify(endpoint.updateData)
        });

        console.log(`📊 UPDATE Status: ${updateResponse.status}`);
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.text();
          console.log(`✅ UPDATE funcionou`);
          
          // Verificar se UPDATE foi aplicado
          const verifyUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint.view}?id=eq.${itemId}`, {
            headers: getHeaders()
          });
          
          if (verifyUpdateResponse.ok) {
            const verifyUpdate = await verifyUpdateResponse.json();
            if (verifyUpdate.length > 0) {
              const wasUpdated = verifyUpdate[0].name === endpoint.updateData.name;
              console.log(`📋 Nome atualizado?`, wasUpdated ? '✅' : '❌');
              console.log(`📋 Nome atual:`, verifyUpdate[0].name);
            }
          }
          
        } else {
          const updateError = await updateResponse.text();
          console.log(`❌ UPDATE falhou:`, updateError);
        }
        
        // 4. DELETE (soft delete)
        console.log(`\n4️⃣ DELETE ${endpoint.name} (soft delete):`);
        const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint.view}?id=eq.${itemId}`, {
          method: 'PATCH',
          headers: { ...getHeaders(), 'Prefer': 'return=representation' },
          body: JSON.stringify({ deleted_at: new Date().toISOString() })
        });

        console.log(`📊 DELETE Status: ${deleteResponse.status}`);
        
        if (deleteResponse.ok) {
          console.log(`✅ DELETE funcionou`);
          
          // Verificar se sumiu da view
          const verifyDeleteResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint.view}?id=eq.${itemId}`, {
            headers: getHeaders()
          });
          
          if (verifyDeleteResponse.ok) {
            const verifyDelete = await verifyDeleteResponse.json();
            if (verifyDelete.length === 0) {
              console.log(`✅ Item removido da view após soft delete`);
            } else {
              console.log(`⚠️ Item ainda aparece na view`);
            }
          }
          
        } else {
          const deleteError = await deleteResponse.text();
          console.log(`❌ DELETE falhou:`, deleteError);
        }
        
        console.log(`\n✨ ${endpoint.name} - CRUD COMPLETO! ✨`);
        
      } else {
        const createError = await createResponse.text();
        console.log(`❌ CREATE falhou:`, createError);
      }
      
    } catch (error) {
      console.log(`❌ Erro geral para ${endpoint.name}:`, error.message);
    }
  }
  
  console.log(`\n🎉 === TESTE COMPLETO FINALIZADO ===`);
}

async function main() {
  const authenticated = await authenticate();
  
  if (authenticated) {
    await testFullCRUDWithActiveViews();
  } else {
    console.log('\n❌ Não foi possível autenticar. Abortando testes.');
  }
}

main().catch(console.error);

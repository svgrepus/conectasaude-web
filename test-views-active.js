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

async function testActiveViews() {
  console.log('\n🧪 === TESTANDO VIEWS _ACTIVE ===');
  
  const views = [
    { name: 'Cargos', view: 'basic_roles_active', table: 'basic_roles' },
    { name: 'Tipos de Doença', view: 'basic_health_disease_types_active', table: 'basic_health_disease_types' },
    { name: 'Tipos de Veículo', view: 'basic_vehicle_types_active', table: 'basic_vehicle_types' },
    { name: 'Doenças Crônicas', view: 'basic_health_chronic_diseases_active', table: 'basic_health_chronic_diseases' }
  ];

  for (const viewInfo of views) {
    console.log(`\n📝 Testando ${viewInfo.name}:`);
    
    try {
      // Testar leitura da VIEW
      console.log(`📖 Lendo view ${viewInfo.view}:`);
      const viewResponse = await fetch(`${supabaseUrl}/rest/v1/${viewInfo.view}?limit=3`, {
        headers: getHeaders()
      });

      console.log(`📊 Status view: ${viewResponse.status}`);
      
      if (viewResponse.ok) {
        const viewData = await viewResponse.json();
        console.log(`✅ View funcionou - ${viewData.length} registros`);
        if (viewData.length > 0) {
          console.log(`📋 Campos da view:`, Object.keys(viewData[0]));
          console.log(`📝 Exemplo:`, viewData[0]);
        }
      } else {
        const error = await viewResponse.text();
        console.log(`❌ View falhou:`, error);
      }
      
      // Testar CRUD na TABELA (para comparar)
      if (viewInfo.name === 'Cargos') {
        console.log(`\n📝 Testando CRUD na tabela ${viewInfo.table}:`);
        
        // CREATE
        const createData = { name: `Teste ${viewInfo.name} View` };
        const createResponse = await fetch(`${supabaseUrl}/rest/v1/${viewInfo.table}`, {
          method: 'POST',
          headers: { ...getHeaders(), 'Prefer': 'return=representation' },
          body: JSON.stringify(createData)
        });

        console.log(`📊 CREATE Status: ${createResponse.status}`);
        
        if (createResponse.ok) {
          const created = await createResponse.json();
          console.log(`✅ CREATE funcionou:`, created[0]);
          
          const itemId = created[0].id;
          
          // Verificar se aparece na VIEW
          console.log(`\n🔍 Verificando se aparece na view:`);
          const checkViewResponse = await fetch(`${supabaseUrl}/rest/v1/${viewInfo.view}?id=eq.${itemId}`, {
            headers: getHeaders()
          });
          
          if (checkViewResponse.ok) {
            const checkView = await checkViewResponse.json();
            if (checkView.length > 0) {
              console.log(`✅ Item aparece na view:`, checkView[0]);
            } else {
              console.log(`⚠️ Item NÃO aparece na view`);
            }
          }
          
          // UPDATE
          console.log(`\n📝 Testando UPDATE:`);
          const updateData = { name: `${createData.name} ATUALIZADO` };
          const updateResponse = await fetch(`${supabaseUrl}/rest/v1/${viewInfo.table}?id=eq.${itemId}`, {
            method: 'PATCH',
            headers: { ...getHeaders(), 'Prefer': 'return=representation' },
            body: JSON.stringify(updateData)
          });

          console.log(`📊 UPDATE Status: ${updateResponse.status}`);
          
          if (updateResponse.ok) {
            console.log(`✅ UPDATE funcionou`);
            
            // Verificar na view novamente
            const checkUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/${viewInfo.view}?id=eq.${itemId}`, {
              headers: getHeaders()
            });
            
            if (checkUpdateResponse.ok) {
              const checkUpdate = await checkUpdateResponse.json();
              if (checkUpdate.length > 0) {
                console.log(`✅ UPDATE refletido na view:`, checkUpdate[0].name);
              }
            }
          } else {
            const updateError = await updateResponse.text();
            console.log(`❌ UPDATE falhou:`, updateError);
          }
          
          // DELETE (soft delete)
          console.log(`\n🗑️ Testando DELETE (soft delete):`);
          const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/${viewInfo.table}?id=eq.${itemId}`, {
            method: 'PATCH',
            headers: { ...getHeaders(), 'Prefer': 'return=representation' },
            body: JSON.stringify({ deleted_at: new Date().toISOString() })
          });

          console.log(`📊 DELETE Status: ${deleteResponse.status}`);
          
          if (deleteResponse.ok) {
            console.log(`✅ DELETE funcionou`);
            
            // Verificar se sumiu da view
            const checkDeleteResponse = await fetch(`${supabaseUrl}/rest/v1/${viewInfo.view}?id=eq.${itemId}`, {
              headers: getHeaders()
            });
            
            if (checkDeleteResponse.ok) {
              const checkDelete = await checkDeleteResponse.json();
              if (checkDelete.length === 0) {
                console.log(`✅ Item removido da view após soft delete`);
              } else {
                console.log(`⚠️ Item ainda aparece na view:`, checkDelete[0]);
              }
            }
          } else {
            const deleteError = await deleteResponse.text();
            console.log(`❌ DELETE falhou:`, deleteError);
          }
          
        } else {
          const createError = await createResponse.text();
          console.log(`❌ CREATE falhou:`, createError);
        }
      }
      
    } catch (error) {
      console.log(`❌ Erro para ${viewInfo.name}:`, error.message);
    }
  }
}

async function main() {
  const authenticated = await authenticate();
  
  if (authenticated) {
    await testActiveViews();
  } else {
    console.log('\n❌ Não foi possível autenticar. Abortando testes.');
  }
}

main().catch(console.error);

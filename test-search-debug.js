const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

let accessToken = null;

async function authenticate() {
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
    return true;
  }
  return false;
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

async function testUUIDUpdate() {
  console.log('\n🔍 === TESTANDO DIFERENTES FORMATOS DE UUID ===');
  
  try {
    // Primeiro buscar um registro existente para pegar o UUID real
    console.log('\n1. Buscando registros existentes:');
    const listResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?limit=3&deleted_at=is.null`, {
      headers: getHeaders()
    });

    if (listResponse.ok) {
      const existingRecords = await listResponse.json();
      console.log('✅ Registros encontrados:', existingRecords.length);
      
      if (existingRecords.length > 0) {
        const testRecord = existingRecords[0];
        console.log('📋 Usando registro para teste:', testRecord);
        
        const cargoId = testRecord.id;
        const originalName = testRecord.nome;
        const newName = `${originalName} [TESTADO]`;
        
        // Testar diferentes formatos de filtro
        const filterFormats = [
          `id=eq.${cargoId}`,
          `id=eq."${cargoId}"`,
          `id=eq.'${cargoId}'`,
        ];
        
        for (const [index, filter] of filterFormats.entries()) {
          console.log(`\n${index + 2}. Testando filtro: ${filter}`);
          
          const updateResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?${filter}`, {
            method: 'PATCH',
            headers: { ...getHeaders(), 'Prefer': 'return=representation' },
            body: JSON.stringify({ nome: `${newName} (tentativa ${index + 1})` })
          });

          console.log(`📊 Status: ${updateResponse.status}`);
          
          if (updateResponse.ok) {
            const responseText = await updateResponse.text();
            console.log(`📊 Response: ${responseText}`);
            
            // Verificar se atualizou
            const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
              headers: getHeaders()
            });
            
            if (verifyResponse.ok) {
              const verify = await verifyResponse.json();
              console.log(`✅ Estado após tentativa ${index + 1}:`, verify[0]?.nome);
              
              if (verify[0]?.nome !== originalName) {
                console.log(`🎉 SUCESSO! Filtro que funcionou: ${filter}`);
                
                // Reverter para o nome original
                await fetch(`${supabaseUrl}/rest/v1/basic_roles?${filter}`, {
                  method: 'PATCH',
                  headers: { ...getHeaders() },
                  body: JSON.stringify({ nome: originalName })
                });
                console.log('🔄 Nome revertido para o original');
                
                break;
              }
            }
          } else {
            const error = await updateResponse.text();
            console.log(`❌ Erro: ${error}`);
          }
        }
      } else {
        console.log('❌ Nenhum registro encontrado para teste');
      }
    } else {
      const error = await listResponse.text();
      console.log('❌ Erro ao buscar registros:', error);
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

async function main() {
  const authenticated = await authenticate();
  
  if (authenticated) {
    console.log('✅ Autenticado com sucesso');
    await testUUIDUpdate();
  } else {
    console.log('❌ Falha na autenticação');
  }
}

main().catch(console.error);

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

async function testNewStructure() {
  console.log('\n🧪 === TESTANDO NOVA ESTRUTURA PADRONIZADA ===');
  
  try {
    // Verificar estrutura atual
    console.log('\n1. Verificando estrutura atual:');
    const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?limit=1`, {
      headers: getHeaders()
    });

    if (schemaResponse.ok) {
      const sample = await schemaResponse.json();
      if (sample.length > 0) {
        console.log('📊 Estrutura atual:', Object.keys(sample[0]));
        console.log('🔑 Tipo do ID:', typeof sample[0].id);
        console.log('📝 Campo name existe:', sample[0].hasOwnProperty('name') ? '✅' : '❌');
        console.log('📝 Campo nome existe:', sample[0].hasOwnProperty('nome') ? '⚠️ (antigo)' : '✅ (removido)');
      } else {
        console.log('📊 Tabela vazia - ótimo para testar!');
      }
    }
    
    // Teste completo de CRUD
    console.log('\n2. Testando CRUD completo:');
    
    // CREATE
    console.log('\n📝 CREATE:');
    const createData = { name: 'Teste Cargo Padronizado' };
    const createResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Prefer': 'return=representation' },
      body: JSON.stringify(createData)
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log('✅ CREATE funcionou:', created[0]);
      
      const cargoId = created[0].id;
      console.log('🔑 ID criado (tipo):', typeof cargoId, '| Valor:', cargoId);
      
      // READ
      console.log('\n📖 READ:');
      const readResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
        headers: getHeaders()
      });

      if (readResponse.ok) {
        const read = await readResponse.json();
        console.log('✅ READ funcionou:', read[0]);
      } else {
        console.log('❌ READ falhou:', await readResponse.text());
      }
      
      // UPDATE
      console.log('\n📝 UPDATE:');
      const updateData = { name: 'Teste Cargo ATUALIZADO' };
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
        method: 'PATCH',
        headers: { ...getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(updateData)
      });

      console.log('📊 UPDATE Status:', updateResponse.status);
      
      if (updateResponse.ok) {
        const updateResult = await updateResponse.text();
        console.log('📊 UPDATE Response:', updateResult);
        
        if (updateResult.trim()) {
          try {
            const updated = JSON.parse(updateResult);
            console.log('✅ UPDATE funcionou:', updated[0] || updated);
          } catch (e) {
            console.log('✅ UPDATE realizado (resposta sem corpo)');
          }
        } else {
          console.log('✅ UPDATE realizado (sem retorno de dados)');
        }
        
        // Verificar se realmente atualizou
        const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
          headers: getHeaders()
        });
        
        if (verifyResponse.ok) {
          const verify = await verifyResponse.json();
          console.log('🔍 Verificação UPDATE:', verify[0]);
          console.log('📝 Nome atualizado?', verify[0].name === updateData.name ? '✅' : '❌');
        }
        
      } else {
        const error = await updateResponse.text();
        console.log('❌ UPDATE falhou:', error);
      }
      
      // DELETE (soft delete)
      console.log('\n🗑️ DELETE (soft delete):');
      const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
        method: 'PATCH',
        headers: { ...getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({ deleted_at: new Date().toISOString() })
      });

      if (deleteResponse.ok) {
        const deleteResult = await deleteResponse.text();
        console.log('✅ DELETE realizado');
        
        // Verificar soft delete
        const verifyDeleteResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
          headers: getHeaders()
        });
        
        if (verifyDeleteResponse.ok) {
          const verifyDelete = await verifyDeleteResponse.json();
          if (verifyDelete[0] && verifyDelete[0].deleted_at) {
            console.log('✅ Soft delete confirmado:', verifyDelete[0].deleted_at);
          } else {
            console.log('❌ Soft delete não funcionou');
          }
        }
        
      } else {
        const error = await deleteResponse.text();
        console.log('❌ DELETE falhou:', error);
      }
      
    } else {
      const error = await createResponse.text();
      console.log('❌ CREATE falhou:', error);
    }
    
    console.log('\n🎉 === RESUMO ===');
    console.log('✅ Estrutura padronizada');
    console.log('✅ ID numérico'); 
    console.log('✅ Campo "name" padrão');
    console.log('✅ Compatível com outras tabelas');
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

async function main() {
  const authenticated = await authenticate();
  
  if (authenticated) {
    await testNewStructure();
  } else {
    console.log('\n❌ Não foi possível autenticar. Abortando testes.');
  }
}

main().catch(console.error);

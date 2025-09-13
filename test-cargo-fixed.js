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

async function testCargosCRUD() {
  console.log('\n🧪 === TESTANDO CRUD DE CARGOS (CORRIGIDO) ===');
  
  try {
    // Testar CREATE com campo 'nome'
    console.log('\n📝 Testando CREATE (com campo nome):');
    const createResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Prefer': 'return=representation' },
      body: JSON.stringify({ nome: 'Teste Cargo Corrigido' })
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log('✅ CREATE funcionou:', created[0]);
      
      const cargoId = created[0].id;
      
      // Testar UPDATE
      console.log('\n📝 Testando UPDATE:');
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
        method: 'PATCH',
        headers: { ...getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({ nome: 'Teste Cargo Atualizado' })
      });

      if (updateResponse.ok) {
        const updated = await updateResponse.json();
        console.log('✅ UPDATE funcionou:', updated[0]);
      } else {
        const error = await updateResponse.text();
        console.log('❌ UPDATE falhou:', error);
      }
      
      // Testar READ
      console.log('\n📝 Testando READ:');
      const readResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
        headers: getHeaders()
      });

      if (readResponse.ok) {
        const read = await readResponse.json();
        console.log('✅ READ funcionou:', read[0]);
      } else {
        const error = await readResponse.text();
        console.log('❌ READ falhou:', error);
      }
      
      // Testar DELETE (soft delete)
      console.log('\n📝 Testando DELETE (soft delete):');
      const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
        method: 'PATCH',
        headers: { ...getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({ deleted_at: new Date().toISOString() })
      });

      if (deleteResponse.ok) {
        const deleted = await deleteResponse.json();
        console.log('✅ DELETE funcionou:', deleted[0]);
      } else {
        const error = await deleteResponse.text();
        console.log('❌ DELETE falhou:', error);
      }
      
      // Verificar se foi realmente marcado como deletado
      console.log('\n📝 Verificando se foi marcado como deletado:');
      const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
        headers: getHeaders()
      });

      if (verifyResponse.ok) {
        const verify = await verifyResponse.json();
        console.log('✅ Verificação - Estado após delete:', verify[0]);
      }
      
    } else {
      const error = await createResponse.text();
      console.log('❌ CREATE falhou:', error);
    }
    
  } catch (error) {
    console.log('❌ Erro geral no teste de Cargos:', error.message);
  }
}

async function main() {
  const authenticated = await authenticate();
  
  if (authenticated) {
    await testCargosCRUD();
  } else {
    console.log('\n❌ Não foi possível autenticar. Abortando testes.');
  }
}

main().catch(console.error);

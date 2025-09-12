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

async function debugUpdate() {
  console.log('\n🔍 === DEBUG DO UPDATE ===');
  
  try {
    // Primeiro criar um registro
    console.log('\n1. Criando registro para teste:');
    const createResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Prefer': 'return=representation' },
      body: JSON.stringify({ nome: `Debug Test Cargo ${Date.now()}` })
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log('✅ Registro criado:', created[0]);
      
      const cargoId = created[0].id;
      
      // Agora tentar atualizar com mais debug
      console.log(`\n2. Tentando atualizar registro ${cargoId}:`);
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
        method: 'PATCH',
        headers: { ...getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({ nome: `Debug Test Cargo ATUALIZADO ${Date.now()}` })
      });

      console.log('📊 Status da resposta UPDATE:', updateResponse.status);
      console.log('📊 Headers da resposta UPDATE:', Object.fromEntries(updateResponse.headers.entries()));
      
      if (updateResponse.ok) {
        const responseText = await updateResponse.text();
        console.log('📊 Response text UPDATE:', responseText);
        
        try {
          const parsed = JSON.parse(responseText);
          console.log('✅ UPDATE parsed:', parsed);
        } catch (e) {
          console.log('⚠️ Não conseguiu fazer parse da resposta como JSON');
        }
        
        // Verificar se realmente atualizou
        console.log('\n3. Verificando se atualizou:');
        const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/basic_roles?id=eq.${cargoId}`, {
          headers: getHeaders()
        });
        
        if (verifyResponse.ok) {
          const verify = await verifyResponse.json();
          console.log('✅ Estado atual do registro:', verify[0]);
        }
        
      } else {
        const error = await updateResponse.text();
        console.log('❌ UPDATE falhou:', error);
      }
      
    } else {
      const error = await createResponse.text();
      console.log('❌ CREATE falhou:', error);
    }
    
  } catch (error) {
    console.log('❌ Erro no debug:', error.message);
  }
}

async function main() {
  const authenticated = await authenticate();
  
  if (authenticated) {
    await debugUpdate();
  } else {
    console.log('\n❌ Não foi possível autenticar. Abortando debug.');
  }
}

main().catch(console.error);

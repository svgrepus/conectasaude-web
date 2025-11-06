/**
 * Teste do serviço de motoristas usando fetch direto
 */

const SUPABASE_CONFIG = {
  url: 'https://neqkqjpynrinlsodfrkf.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM'
};

async function testListarMotoristas() {
  console.log('\n🧪 === TESTANDO LISTAR MOTORISTAS COM FETCH ===');
  
  try {
    console.log('📞 Chamando RPC rpc_buscar_motorista_completo...');
    
    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/rpc_buscar_motorista_completo`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
      },
      body: JSON.stringify({
        p_motorista_id: null
      })
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers da resposta:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro HTTP:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('📦 Resposta completa:', JSON.stringify(result, null, 2));

    if (result && result.success && Array.isArray(result.data)) {
      console.log('✅ Motoristas encontrados:', result.data.length);
      
      if (result.data.length > 0) {
        console.log('👤 Primeiro motorista:');
        console.log('- Nome:', result.data[0].motorista.nome);
        console.log('- CPF:', result.data[0].motorista.cpf);
        console.log('- Endereço:', result.data[0].endereco.logradouro);
        console.log('- Escalas:', result.data[0].escalas.length);
      }
      
      return true;
    } else {
      console.log('⚠️ Estrutura de resposta inesperada');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    return false;
  }
}

testListarMotoristas().then(success => {
  console.log('\n📊 === RESULTADO FINAL ===');
  console.log('Teste de listagem:', success ? '✅ SUCESSO' : '❌ FALHOU');
});
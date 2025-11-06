const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBuscarMotoristaCompleto() {
  try {
    console.log('🔍 Testando buscar motorista completo...');
    
    const motoristaId = '9a05ee7e-be9b-4cc8-b2e7-47d96dd2a544';
    
    const { data: result, error } = await supabase
      .rpc('rpc_buscar_motorista_completo', {
        p_motorista_id: motoristaId
      });

    if (error) {
      console.error('❌ Erro:', error);
      return;
    }

    console.log('📦 Resultado completo:', JSON.stringify(result, null, 2));
    
    // Verificar estrutura
    if (result && result.success) {
      console.log('✅ Success:', result.success);
      console.log('📊 Data:', result.data);
      
      if (result.data) {
        console.log('👤 Motorista:', result.data.motorista);
        console.log('🏠 Endereço:', result.data.endereco);
        console.log('⏰ Escalas:', result.data.escalas);
      }
    } else {
      console.log('❌ Não tem success ou é false');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testBuscarMotoristaCompleto();
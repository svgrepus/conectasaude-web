const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testListarMotoristas() {
  try {
    console.log('🔍 Testando listar motoristas...');
    
    const { data: result, error } = await supabase
      .rpc('rpc_buscar_motorista_completo', {
        p_motorista_id: null
      });

    if (error) {
      console.error('❌ Erro:', error);
      return;
    }

    console.log('📦 Resultado completo:', JSON.stringify(result, null, 2));
    
    if (result && result.success && result.data.length > 0) {
      console.log(`✅ Encontrados ${result.data.length} motoristas`);
      
      // Testar com o primeiro motorista
      const primeiro = result.data[0];
      console.log('👤 Primeiro motorista:', primeiro);
      
      if (primeiro.motorista && primeiro.motorista.id) {
        console.log(`🔍 Testando buscar motorista específico: ${primeiro.motorista.id}`);
        
        const { data: resultEspecifico, error: errorEspecifico } = await supabase
          .rpc('rpc_buscar_motorista_completo', {
            p_motorista_id: primeiro.motorista.id
          });

        if (errorEspecifico) {
          console.error('❌ Erro busca específica:', errorEspecifico);
        } else {
          console.log('📦 Resultado específico:', JSON.stringify(resultEspecifico, null, 2));
        }
      }
    } else {
      console.log('❌ Nenhum motorista encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testListarMotoristas();
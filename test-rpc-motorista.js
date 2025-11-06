// Teste simples para verificar a função RPC de buscar motorista completo
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpcBuscarMotoristaCompleto() {
  try {
    console.log('🧪 Testando rpc_buscar_motorista_completo...');
    
    // Testar com um UUID fictício para ver se a função existe
    const uuidTeste = '00000000-0000-0000-0000-000000000000';
    console.log('🎯 Testando com UUID fictício:', uuidTeste);
    
    // Testar a função RPC
    const { data: result, error } = await supabase
      .rpc('rpc_buscar_motorista_completo', {
        p_motorista_id: uuidTeste
      });

    if (error) {
      console.error('❌ Erro na função RPC:', error);
      console.log('📝 Detalhes do erro:', error.message);
      console.log('📝 Código do erro:', error.code);
      return;
    }

    console.log('✅ Resultado da função RPC:', JSON.stringify(result, null, 2));
    
    // Verificar se a função retorna o formato esperado
    if (result && result.success === false) {
      console.log('✅ Função RPC funcionando - retornou erro esperado para UUID inexistente');
      console.log('📊 Erro esperado:', result.error);
    } else if (result && result.success === true) {
      console.log('✅ Função RPC funcionando - dados encontrados');
      console.log('📊 Dados retornados:', result.data);
    } else {
      console.log('⚠️ Resultado inesperado:', result);
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testRpcBuscarMotoristaCompleto();
// Teste para verificar erro na view vw_estoque_medicamentos
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase - usar as mesmas configurações do projeto
const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testView() {
  console.log('🔍 Testando acesso à view vw_estoque_medicamentos...');
  
  try {
    const { data, error } = await supabase
      .from('vw_estoque_medicamentos')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar view:', error);
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ View acessada com sucesso:', data);
    }
  } catch (err) {
    console.error('💥 Erro na execução:', err);
  }
}

testView();
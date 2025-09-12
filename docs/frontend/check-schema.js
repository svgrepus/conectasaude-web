// Verificar schema das tabelas
const checkSchema = async () => {
  const endpoints = ['basic_health_disease_types', 'basic_vehicle_types', 'basic_roles'];
  const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0bCQM';

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Verificando schema: ${endpoint}`);
      
      // Fazer uma query com select * para ver todas as colunas disponíveis
      const url = `${supabaseUrl}/rest/v1/${endpoint}?select=*&limit=0`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.pgrst.object+json'
        }
      });

      console.log(`📊 Status: ${response.status}`);
      
      if (response.ok) {
        const headers = response.headers;
        console.log(`✅ Endpoint existe e está acessível`);
        
        // Tentar INSERT vazio para ver as colunas necessárias
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
          method: 'POST',
          headers: {
            'apikey': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        const insertError = await insertResponse.text();
        console.log(`📋 Info sobre campos obrigatórios: ${insertError}`);
        
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Erro de conexão: ${error.message}`);
    }
  }
};

checkSchema();

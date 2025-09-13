// Teste simples de conectividade com os endpoints
const testEndpoints = async () => {
  const endpoints = [
    'basic_health_disease_types',
    'basic_vehicle_types', 
    'basic_roles'
  ];

  const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testando endpoint: ${endpoint}`);
      
      const url = `${supabaseUrl}/rest/v1/${endpoint}?select=*&limit=5&deleted_at=is.null`;
      console.log(`📡 URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📊 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Dados recebidos: ${data.length} registros`);
        console.log(`📋 Primeiro registro:`, data[0] || 'Nenhum registro');
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Erro de conexão: ${error.message}`);
    }
  }
};

testEndpoints();

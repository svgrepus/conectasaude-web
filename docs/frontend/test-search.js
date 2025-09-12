// Teste da API de pesquisa
const testSearch = async () => {
  const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';
  
  // Teste sem pesquisa
  console.log('=== Teste 1: Buscar todas as doenças ===');
  try {
    const response1 = await fetch(`${supabaseUrl}/rest/v1/basic_health_chronic_diseases?select=*&deleted_at=is.null&order=name.asc`, {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Todas as doenças:', data1.length, 'registros');
      console.log('Primeiras 3:', data1.slice(0, 3).map(d => ({ name: d.name, description: d.description })));
    } else {
      console.error('❌ Erro:', response1.status);
    }
  } catch (error) {
    console.error('❌ Erro na requisição 1:', error);
  }

  // Teste com pesquisa
  console.log('\n=== Teste 2: Buscar com filtro "diabetes" ===');
  try {
    const searchTerm = 'diabetes';
    const params = new URLSearchParams({
      'select': '*',
      'deleted_at': 'is.null',
      'or': `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
      'order': 'name.asc'
    });
    
    const response2 = await fetch(`${supabaseUrl}/rest/v1/basic_health_chronic_diseases?${params.toString()}`, {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Filtrado:', data2.length, 'registros');
      console.log('Resultados:', data2.map(d => ({ name: d.name, description: d.description })));
    } else {
      console.error('❌ Erro:', response2.status);
    }
  } catch (error) {
    console.error('❌ Erro na requisição 2:', error);
  }
};

testSearch();

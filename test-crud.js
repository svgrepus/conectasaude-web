// Teste de autenticação e operações CRUD
const testCrudOperations = async () => {
  const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';
  
  // Simular token de autenticação (você precisa fazer login primeiro)
  const authToken = null; // Aqui deveria ter o token real

  const headers = {
    'apikey': apiKey,
    'Content-Type': 'application/json'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const endpoints = [
    'basic_health_disease_types',
    'basic_vehicle_types', 
    'basic_roles'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testando operações CRUD para: ${endpoint}`);
    
    // 1. Teste de CREATE
    try {
      console.log(`📤 Testando CREATE...`);
      const createData = endpoint === 'basic_roles' 
        ? { name: `Teste ${Date.now()}` }
        : { name: `Teste ${Date.now()}`, description: 'Descrição teste' };
      
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(createData)
      });

      if (createResponse.ok) {
        const created = await createResponse.json();
        console.log(`✅ CREATE funcionou: ID ${created[0]?.id}`);
        
        const itemId = created[0]?.id;
        
        // 2. Teste de READ
        console.log(`📋 Testando READ...`);
        const readResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint}?id=eq.${itemId}`, {
          method: 'GET',
          headers
        });
        
        if (readResponse.ok) {
          const readData = await readResponse.json();
          console.log(`✅ READ funcionou: ${readData.length} registros`);
        } else {
          console.log(`❌ READ falhou: ${await readResponse.text()}`);
        }
        
        // 3. Teste de UPDATE
        console.log(`📝 Testando UPDATE...`);
        const updateData = endpoint === 'basic_roles'
          ? { name: `Teste Atualizado ${Date.now()}` }
          : { name: `Teste Atualizado ${Date.now()}`, description: 'Descrição atualizada' };
        
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint}?id=eq.${itemId}`, {
          method: 'PATCH',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify(updateData)
        });
        
        if (updateResponse.ok) {
          const updated = await updateResponse.json();
          console.log(`✅ UPDATE funcionou: ${updated[0]?.name}`);
        } else {
          console.log(`❌ UPDATE falhou: ${await updateResponse.text()}`);
        }
        
        // 4. Teste de DELETE (soft delete)
        console.log(`🗑️ Testando SOFT DELETE...`);
        const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/${endpoint}?id=eq.${itemId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ deleted_at: new Date().toISOString() })
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ SOFT DELETE funcionou`);
        } else {
          console.log(`❌ SOFT DELETE falhou: ${await deleteResponse.text()}`);
        }
        
      } else {
        const error = await createResponse.text();
        console.log(`❌ CREATE falhou: ${error}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro geral: ${error.message}`);
    }
  }
};

testCrudOperations();

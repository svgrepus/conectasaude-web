// Teste de criação de dados nas tabelas
const createTestData = async () => {
  const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

  const testData = [
    {
      endpoint: 'basic_health_disease_types',
      records: [
        { name: 'Diabetes Tipo 1', description: 'Diabetes mellitus insulino-dependente' },
        { name: 'Hipertensão', description: 'Pressão arterial elevada' },
        { name: 'Asma', description: 'Doença respiratória inflamatória' }
      ]
    },
    {
      endpoint: 'basic_vehicle_types',
      records: [
        { name: 'Ambulância', description: 'Veículo de emergência médica' },
        { name: 'Van', description: 'Veículo para transporte de pacientes' },
        { name: 'Motocicleta', description: 'Veículo ágil para urgências' }
      ]
    },
    {
      endpoint: 'basic_roles',
      records: [
        { name: 'Médico', description: 'Profissional de medicina' },
        { name: 'Enfermeiro', description: 'Profissional de enfermagem' },
        { name: 'Técnico em Enfermagem', description: 'Auxiliar de enfermagem' }
      ]
    }
  ];

  for (const table of testData) {
    console.log(`\n🆕 Criando dados para: ${table.endpoint}`);
    
    for (const record of table.records) {
      try {
        const url = `${supabaseUrl}/rest/v1/${table.endpoint}`;
        console.log(`📤 Criando: ${record.name}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'apikey': apiKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(record)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Criado com sucesso: ID ${result[0]?.id}`);
        } else {
          const errorText = await response.text();
          console.log(`❌ Erro ao criar: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Erro de conexão: ${error.message}`);
      }
    }
  }
  
  console.log('\n🔍 Verificando dados criados...');
  
  // Verificar se os dados foram criados
  for (const table of testData) {
    try {
      const url = `${supabaseUrl}/rest/v1/${table.endpoint}?select=*&deleted_at=is.null`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📊 ${table.endpoint}: ${data.length} registros`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar ${table.endpoint}: ${error.message}`);
    }
  }
};

createTestData();

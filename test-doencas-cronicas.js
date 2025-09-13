// Teste para verificar a consulta de doenças crônicas
const { SUPABASE_MASTER_CONFIG } = require('./supabase.master.config.js');

async function testDoencasCronicasQuery() {
    console.log('🩺 Testando consulta de doenças crônicas...\n');
    
    // Teste da URL exata fornecida
    const testUrl = `${SUPABASE_MASTER_CONFIG.URL}/rest/v1/basic_health_chronic_diseases_active?select=id%2Cname&deleted_at=is.null&name=ilike.%25Asma%25&order=name.asc&limit=10`;
    
    console.log('📍 URL de teste:', testUrl);
    console.log('🔑 API Key:', SUPABASE_MASTER_CONFIG.ANON_KEY.substring(0, 20) + '...\n');
    
    try {
        const response = await fetch(testUrl, {
            headers: {
                'apikey': SUPABASE_MASTER_CONFIG.ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_MASTER_CONFIG.ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Consulta executada com sucesso!');
        console.log('📊 Resultados encontrados:', data.length);
        console.log('🔍 Dados retornados:');
        data.forEach((item, index) => {
            console.log(`  ${index + 1}. ID: ${item.id} | Nome: ${item.name}`);
        });
        
        // Teste de busca genérica
        console.log('\n🔍 Testando busca genérica...');
        const genericUrl = `${SUPABASE_MASTER_CONFIG.URL}/rest/v1/basic_health_chronic_diseases_active?select=id%2Cname&deleted_at=is.null&order=name.asc&limit=10`;
        
        const genericResponse = await fetch(genericUrl, {
            headers: {
                'apikey': SUPABASE_MASTER_CONFIG.ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_MASTER_CONFIG.ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (genericResponse.ok) {
            const genericData = await genericResponse.json();
            console.log('✅ Busca genérica executada com sucesso!');
            console.log('📊 Total de doenças crônicas ativas:', genericData.length);
            console.log('🔍 Primeiras 5 doenças:');
            genericData.slice(0, 5).forEach((item, index) => {
                console.log(`  ${index + 1}. ID: ${item.id} | Nome: ${item.name}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro na consulta:', error.message);
        console.error('🔍 Detalhes do erro:', error);
        
        // Teste de conectividade básica
        console.log('\n🔍 Testando conectividade básica...');
        try {
            const basicResponse = await fetch(`${SUPABASE_MASTER_CONFIG.URL}/rest/v1/`, {
                headers: {
                    'apikey': SUPABASE_MASTER_CONFIG.ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_MASTER_CONFIG.ANON_KEY}`
                }
            });
            console.log('📡 Status de conectividade:', basicResponse.status);
        } catch (connectError) {
            console.error('❌ Erro de conectividade:', connectError.message);
        }
    }
}

// Executar teste
testDoencasCronicasQuery()
    .then(() => {
        console.log('\n🎯 Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Erro fatal:', error);
        process.exit(1);
    });

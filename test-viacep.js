// Teste da implementação melhorada do ViaCEP
async function testViaCEP() {
    console.log('🔍 Testando ViaCEP melhorado...\n');
    
    const cepsTest = [
        '01310-100', // CEP válido - Av. Paulista, São Paulo
        '20040-020', // CEP válido - Centro, Rio de Janeiro  
        '70040-010', // CEP válido - Brasília, DF
        '99999-999', // CEP inválido
        '12345678',  // CEP sem máscara
    ];
    
    for (const cep of cepsTest) {
        console.log(`\n📍 Testando CEP: ${cep}`);
        
        // Simular a função de máscara
        const aplicarMascaraCEP = (valor) => {
            const somenteNumeros = valor.replace(/\D/g, '');
            if (somenteNumeros.length <= 5) {
                return somenteNumeros;
            } else {
                return `${somenteNumeros.slice(0, 5)}-${somenteNumeros.slice(5, 8)}`;
            }
        };
        
        const cepComMascara = aplicarMascaraCEP(cep);
        console.log(`🎭 CEP com máscara: ${cepComMascara}`);
        
        const cepSomenteNumeros = cep.replace(/\D/g, '');
        console.log(`🔢 CEP apenas números: ${cepSomenteNumeros}`);
        
        if (cepSomenteNumeros.length === 8) {
            try {
                console.log(`🌐 Consultando: https://viacep.com.br/ws/${cepSomenteNumeros}/json/`);
                
                const response = await fetch(`https://viacep.com.br/ws/${cepSomenteNumeros}/json/`);
                
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.erro) {
                    console.log('❌ CEP não encontrado');
                } else {
                    console.log('✅ CEP encontrado:');
                    console.log(`   📍 Logradouro: ${data.logradouro || 'N/A'}`);
                    console.log(`   🏘️  Bairro: ${data.bairro || 'N/A'}`);
                    console.log(`   🏙️  Cidade: ${data.localidade || 'N/A'}`);
                    console.log(`   🗺️  Estado: ${data.uf || 'N/A'}`);
                    console.log(`   📮 CEP: ${data.cep || 'N/A'}`);
                }
                
            } catch (error) {
                console.log(`❌ Erro: ${error.message}`);
            }
        } else {
            console.log('⚠️ CEP deve ter 8 dígitos');
        }
        
        console.log('─'.repeat(50));
    }
    
    console.log('\n🎯 Teste concluído!');
}

// Executar teste
testViaCEP()
    .then(() => {
        console.log('\n✅ Todos os testes de ViaCEP concluídos!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Erro nos testes:', error);
        process.exit(1);
    });

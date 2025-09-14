// Teste das RPCs de munícipe - Criar e Atualizar (com autenticação correta)
const { SUPABASE_MASTER_CONFIG } = require('./supabase.master.config.js');

async function testMunicipeRPCs() {
    console.log('🧪 Testando RPCs de Munícipe com autenticação...\n');
    
    // Configurar cliente Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
        SUPABASE_MASTER_CONFIG.URL,
        SUPABASE_MASTER_CONFIG.ANON_KEY
    );
    
    // Função para obter headers corretos
    const getSupabaseHeaders = (accessToken) => ({
        'apikey': SUPABASE_MASTER_CONFIG.ANON_KEY,
        'Authorization': `Bearer ${accessToken}`, // Usar access_token, não API key
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    });
    
    // Simular login para obter access_token
    // NOTA: Em um teste real, você precisaria de credenciais válidas
    console.log('🔐 Tentando obter sessão atual...');
    
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.session?.access_token) {
        console.log('⚠️ Nenhuma sessão ativa encontrada.');
        console.log('💡 Para testar as RPCs, você precisa estar logado na aplicação.');
        console.log('📝 Este teste requer um usuário autenticado.');
        return;
    }
    
    console.log('✅ Sessão encontrada!');
    console.log('🔑 Access Token:', session.session.access_token.substring(0, 20) + '...');
    console.log('👤 Usuário:', session.session.user.email);
    
    // Dados de teste para criar munícipe
    const dadosTesteCriacao = {
        p_bairro: 'Centro', 
        p_cartao_sus: '123456789012345', 
        p_cep: '12345678', 
        p_cidade: 'São Paulo', 
        p_complemento: 'Apto 101', 
        p_cpf: '12345678901', 
        p_data_nascimento: '1990-01-15', 
        p_doenca_cronica: 'Diabetes, Hipertensão', 
        p_email: 'teste@email.com', 
        p_estado_civil: 'Solteiro', 
        p_foto_url: '', 
        p_logradouro: 'Rua das Flores', 
        p_necessita_acompanhante: true, 
        p_nome_completo: 'João da Silva Teste', 
        p_nome_mae: 'Maria da Silva', 
        p_numero: '123', 
        p_observacoes: 'Observações gerais', 
        p_observacoes_medicas: 'Alergia a dipirona', 
        p_quais_medicamentos: 'Insulina, Captopril', 
        p_ref_zona_rural: false, 
        p_rg: 'MG1234567', 
        p_sexo: 'M', 
        p_telefone: '11999887766', 
        p_tem_deficiencia_fisica: false, 
        p_tipo_doenca: 'Crônica', 
        p_uf: 'SP', 
        p_uso_continuo_medicamentos: true, 
        p_zona_rural: false
    };
    
    let municipeId = null;
    
    try {
        // Teste 1: Criar novo munícipe usando fetch com access_token
        console.log('\n🆕 Teste 1: Criando novo munícipe...');
        console.log('📋 Dados:', JSON.stringify(dadosTesteCriacao, null, 2));
        
        const responseCreate = await fetch(`${SUPABASE_MASTER_CONFIG.URL}/rest/v1/rpc/rpc_criar_municipe_completo`, {
            method: 'POST',
            headers: getSupabaseHeaders(session.session.access_token),
            body: JSON.stringify(dadosTesteCriacao)
        });
        
        if (!responseCreate.ok) {
            const errorData = await responseCreate.text();
            throw new Error(`HTTP Error ${responseCreate.status}: ${errorData}`);
        }
        
        const dataCriacao = await responseCreate.json();
        
        console.log('✅ Munícipe criado com sucesso!');
        console.log('📊 Resultado:', dataCriacao);
        
        // Extrair ID se retornado
        if (dataCriacao && dataCriacao.length > 0 && dataCriacao[0].id) {
            municipeId = dataCriacao[0].id;
            console.log('🆔 ID do munícipe criado:', municipeId);
        }
        
    } catch (error) {
        console.error('💥 Erro no teste de criação:', error);
    }
    
    // Teste 2: Atualizar munícipe (se conseguiu criar)
    if (municipeId) {
        try {
            console.log('\n🔄 Teste 2: Atualizando munícipe...');
            
            const dadosTesteAtualizacao = {
                ...dadosTesteCriacao,
                p_municipe_id: municipeId,
                p_nome_completo: 'João da Silva Teste - ATUALIZADO',
                p_email: 'teste.atualizado@email.com',
                p_telefone: '11888776655',
                p_observacoes: 'Observações atualizadas'
            };
            
            console.log('📋 Dados de atualização:', JSON.stringify(dadosTesteAtualizacao, null, 2));
            
            const responseUpdate = await fetch(`${SUPABASE_MASTER_CONFIG.URL}/rest/v1/rpc/rpc_atualizar_municipe_completo`, {
                method: 'POST',
                headers: getSupabaseHeaders(session.session.access_token),
                body: JSON.stringify(dadosTesteAtualizacao)
            });
            
            if (!responseUpdate.ok) {
                const errorData = await responseUpdate.text();
                throw new Error(`HTTP Error ${responseUpdate.status}: ${errorData}`);
            }
            
            const dataAtualizacao = await responseUpdate.json();
            
            console.log('✅ Munícipe atualizado com sucesso!');
            console.log('📊 Resultado:', dataAtualizacao);
            
        } catch (error) {
            console.error('💥 Erro no teste de atualização:', error);
        }
    }
    
    // Teste 3: Verificar se o munícipe existe na base
    if (municipeId) {
        try {
            console.log('\n🔍 Teste 3: Verificando munícipe na base...');
            
            const { data: municipeVerificacao, error: errorVerificacao } = await supabase
                .from('vw_municipes_completo')
                .select('*')
                .eq('id', municipeId)
                .single();
            
            if (errorVerificacao) {
                console.error('❌ Erro ao verificar munícipe:', errorVerificacao);
            } else {
                console.log('✅ Munícipe encontrado na base!');
                console.log('📊 Dados do munícipe:');
                console.log(`   👤 Nome: ${municipeVerificacao.nome_completo}`);
                console.log(`   📧 Email: ${municipeVerificacao.email}`);
                console.log(`   📞 Telefone: ${municipeVerificacao.telefone}`);
                console.log(`   🏠 Endereço: ${municipeVerificacao.logradouro}, ${municipeVerificacao.numero}`);
                console.log(`   🏘️ Bairro: ${municipeVerificacao.bairro}`);
                console.log(`   🏙️ Cidade: ${municipeVerificacao.cidade} - ${municipeVerificacao.uf}`);
            }
            
        } catch (error) {
            console.error('💥 Erro na verificação:', error);
        }
    }
    
    console.log('\n🎯 Testes de RPC concluídos!');
    
    if (municipeId) {
        console.log(`\n⚠️  ATENÇÃO: Munícipe de teste criado com ID: ${municipeId}`);
        console.log('💡 Considere remover este registro de teste da base de dados.');
    }
}

// Executar testes
testMunicipeRPCs()
    .then(() => {
        console.log('\n✅ Todos os testes de RPC concluídos!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Erro nos testes:', error);
        process.exit(1);
    });

// Exemplo de como testar as funcionalidades com usuário autenticado
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (usar variáveis de ambiente em produção)
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarComUsuarioLogado() {
    console.log('🔐 Exemplo de teste com usuário autenticado\n');
    
    try {
        // 1. Primeiro fazer login com um usuário válido
        console.log('📝 Passo 1: Fazer login...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'usuario@exemplo.com',
            password: 'senha123'
        });
        
        if (authError) {
            console.error('❌ Erro no login:', authError.message);
            return;
        }
        
        console.log('✅ Login realizado com sucesso!');
        console.log('🎫 Access Token:', authData.session.access_token.substring(0, 20) + '...');
        
        // 2. Agora testar as RPCs com o token válido
        console.log('\n📋 Passo 2: Testando criação de munícipe...');
        
        const dadosTesteMunicipe = {
            p_nome_completo: 'Teste Usuário Autenticado',
            p_cpf: '12345678901',
            p_data_nascimento: '1990-01-01',
            p_sexo: 'M',
            p_telefone: '11999887766',
            p_email: 'teste.auth@exemplo.com',
            // ... outros campos necessários
        };
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rpc_criar_municipe_completo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${authData.session.access_token}`,
                'X-Client-Info': 'supabase-js-web'
            },
            body: JSON.stringify(dadosTesteMunicipe)
        });
        
        if (response.ok) {
            const resultado = await response.json();
            console.log('✅ Munícipe criado com sucesso!');
            console.log('📊 Resultado:', resultado);
        } else {
            const erro = await response.text();
            console.error('❌ Erro na criação:', erro);
        }
        
        // 3. Fazer logout
        await supabase.auth.signOut();
        console.log('\n🚪 Logout realizado.');
        
    } catch (error) {
        console.error('💥 Erro geral:', error);
    }
}

console.log(`
📖 INSTRUÇÕES PARA TESTE:

1. Substitua as constantes SUPABASE_URL e SUPABASE_ANON_KEY pelos valores corretos
2. Use um email/senha de usuário válido no sistema
3. Execute: node test-auth-example.js

🔧 NO APP REACT NATIVE:
- O login é feito através da tela de login
- Os tokens são gerenciados automaticamente pelo hook useAuth
- As RPCs são chamadas nas funções criarMunicipe() e atualizarMunicipe()

✅ CORREÇÃO DA AUTENTICAÇÃO CONCLUÍDA:
- ❌ Antes: Usando API key no Authorization header
- ✅ Agora: Usando access_token do usuário logado
`);

// Descomente para testar (após configurar as credenciais)
// testarComUsuarioLogado();

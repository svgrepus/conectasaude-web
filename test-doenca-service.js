// Teste rápido do doencaCronicaService corrigido
const { doencaCronicaService } = require('./src/services/doencaCronicaService.ts');

async function testeDoencaCronicaService() {
    console.log('🧪 Testando doencaCronicaService corrigido...\n');
    
    try {
        console.log('📋 Testando busca de doenças crônicas...');
        
        // Teste de busca
        const resultado = await doencaCronicaService.getDoencasCronicas(1, 5, 'diabetes');
        
        console.log('✅ Busca realizada com sucesso!');
        console.log('📊 Resultado:', {
            count: resultado.count,
            hasMore: resultado.hasMore,
            dataLength: resultado.data.length
        });
        
        if (resultado.data.length > 0) {
            console.log('📝 Primeiro item:', resultado.data[0]);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        
        if (error.message.includes('Token de acesso não encontrado')) {
            console.log('💡 Isso é esperado: o usuário precisa estar logado para usar o serviço');
        }
    }
}

console.log(`
✅ CORREÇÃO APLICADA NO doencaCronicaService:

🔧 MUDANÇAS:
1. Removido import do authService (descontinuado)
2. Adicionado import direto do supabase
3. Método getHeaders() agora é async e usa:
   - await supabase.auth.getSession()
   - session?.session?.access_token
4. Todas as chamadas para this.getHeaders() agora usam await

🎯 PADRÃO CORRETO:
- Mesmo padrão usado no CadastroMunicipeScreen.tsx
- Obtém sessão diretamente do Supabase
- Usa access_token da sessão ativa
- Headers corretos para autorização

📝 PRÓXIMO: Aplicar mesmo padrão nos outros serviços se necessário
`);

// Descomente para testar (requer usuário logado)
// testeDoencaCronicaService();

/**
 * Teste da funcionalidade de soft delete
 * Para verificar se a RPC está funcionando corretamente
 */

const { supabase } = require('./src/config/supabase.ts');

async function testSoftDeleteRPCExists() {
  console.log('\n🧪 === TESTANDO SE RPC EXISTE ===');
  
  try {
    // Tentar chamar a RPC com parâmetros inválidos para ver se ela existe
    console.log('📋 Testando se RPC soft_delete_record existe...');
    const { data, error } = await supabase.rpc('soft_delete_record', {
      table_name: 'test_table',
      record_id: 'test_id',
      motivo: 'teste'
    });
    
    if (error) {
      console.log('📋 RPC existe mas retornou erro (esperado):', error.message);
      
      // Verificar se é erro de função não encontrada
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('❌ RPC soft_delete_record NÃO EXISTE no Supabase!');
        return false;
      } else {
        console.log('✅ RPC soft_delete_record EXISTE (erro diferente de função não encontrada)');
        return true;
      }
    } else {
      console.log('✅ RPC executada com sucesso (inesperado):', data);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
    return false;
  }
}

async function testSoftDelete() {
  console.log('\n🧪 === TESTANDO SOFT DELETE COMPLETO ===');
  
  try {
    // Primeiro verificar se a RPC existe
    const rpcExists = await testSoftDeleteRPCExists();
    if (!rpcExists) {
      console.log('❌ Teste abortado - RPC não existe');
      return;
    }
    
    // Primeiro, vamos listar alguns registros de estoque
    console.log('📋 Listando registros de estoque...');
    const { data: estoques, error: listError } = await supabase
      .from('medicamentos_estoque')
      .select('id, lote, quantidade_atual')
      .limit(3);
    
    if (listError) {
      console.error('❌ Erro ao listar estoques:', listError);
      return;
    }
    
    console.log('✅ Estoques encontrados:', estoques);
    
    if (estoques && estoques.length > 0) {
      const estoqueTest = estoques[0];
      console.log('\n🎯 Testando soft delete no registro:', estoqueTest);
      
      // Chamar a RPC de soft delete
      const { data, error } = await supabase.rpc('soft_delete_record', {
        table_name: 'medicamentos_estoque',
        record_id: estoqueTest.id,
        motivo: 'Teste de funcionalidade - não excluir realmente'
      });
      
      if (error) {
        console.error('❌ Erro na RPC soft_delete_record:', error);
        console.log('📋 Detalhes do erro:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('✅ RPC executada com sucesso!');
        console.log('📋 Resultado:', data);
      }
    } else {
      console.log('⚠️ Nenhum registro de estoque encontrado para testar');
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar o teste se o arquivo for chamado diretamente
if (require.main === module) {
  testSoftDeleteRPCExists().then(() => {
    console.log('\n' + '='.repeat(50));
    testSoftDelete();
  });
}

module.exports = { testSoftDelete, testSoftDeleteRPCExists };
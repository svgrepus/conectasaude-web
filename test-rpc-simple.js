/**
 * Teste da RPC soft_delete_record com configurações que funcionaram no Postman
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração que funcionou no Postman
const supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPCWithCorrectConfig() {
  console.log('\n🧪 === TESTANDO RPC COM CONFIGURAÇÃO DO POSTMAN ===');
  
  try {
    console.log('📞 Chamando RPC soft_delete_record...');
    console.log('🔧 URL:', supabaseUrl);
    console.log('🔑 Key válida:', supabaseKey.substring(0, 20) + '...');
    
    // Usar o mesmo record_id que funcionou no Postman
    const testRecordId = '770c5897-a94d-406d-8fa5-0ccbfd65f384';
    
    const { data, error } = await supabase.rpc('soft_delete_record', {
      table_name: 'medicamentos_estoque',
      record_id: testRecordId,
      motivo: 'Teste de exclusão via código - ConectaSaúde'
    });
    
    console.log('📋 Resposta da RPC:');
    console.log('- Data:', data);
    console.log('- Error:', error);
    
    if (error) {
      console.log('❌ Erro retornado:', error.message);
      
      // Analisar tipos específicos de erro
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('🚨 RPC soft_delete_record NÃO EXISTE!');
      } else if (error.message.includes('JWT') || error.message.includes('authentication')) {
        console.log('� Erro de autenticação - precisa de token válido');
      } else if (error.message.includes('permission')) {
        console.log('🚫 Erro de permissão - verifique RLS policies');
      } else {
        console.log('⚠️ Outro tipo de erro');
      }
      
      return false;
    } else {
      console.log('✅ RPC executada com SUCESSO!');
      console.log('📊 Resultado:', JSON.stringify(data, null, 2));
      return true;
    }
    
  } catch (error) {
    console.error('❌ Erro de exceção:', error.message);
    return false;
  }
}

async function testListEstoque() {
  console.log('\n� === TESTANDO LISTAGEM DE ESTOQUE ===');
  
  try {
    const { data, error } = await supabase
      .from('medicamentos_estoque')
      .select('id, lote, quantidade_atual')
      .limit(3);
    
    if (error) {
      console.log('❌ Erro ao listar estoque:', error.message);
      return [];
    } else {
      console.log('✅ Estoque listado com sucesso:');
      data.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}, Lote: ${item.lote}, Qtd: ${item.quantidade_atual}`);
      });
      return data;
    }
  } catch (error) {
    console.error('❌ Erro de exceção:', error.message);
    return [];
  }
}

async function runCompleteTest() {
  console.log('🏁 Iniciando teste completo com configuração do Postman...\n');
  
  // Primeiro testar listagem básica
  const estoques = await testListEstoque();
  
  // Depois testar a RPC
  const rpcSuccess = await testRPCWithCorrectConfig();
  
  console.log('\n📊 === RESUMO DOS TESTES ===');
  console.log('Conexão com Supabase:', estoques.length > 0 ? '✅ OK' : '❌ Falhou');
  console.log('RPC soft_delete_record:', rpcSuccess ? '✅ OK' : '❌ Falhou');
  
  if (estoques.length > 0 && rpcSuccess) {
    console.log('\n🎉 TUDO FUNCIONANDO! O problema deve estar na interface.');
  } else if (estoques.length > 0 && !rpcSuccess) {
    console.log('\n🔧 Conexão OK, mas RPC com problema. Verifique se a função existe no Supabase.');
  } else {
    console.log('\n❌ Problema de conexão básica com Supabase.');
  }
}

runCompleteTest().catch(console.error);
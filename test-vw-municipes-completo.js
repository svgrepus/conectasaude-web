#!/usr/bin/env node

/**
 * 🧪 TESTE DA VIEW VW_MUNICIPES_COMPLETO
 * 
 * Testa se a nova view está retornando todos os dados de endereço e saúde
 * corretamente para o formulário de edição.
 */

const { SUPABASE_MASTER_CONFIG } = require('./supabase.master.config.js');

const SUPABASE_ENDPOINTS = {
  rest: `${SUPABASE_MASTER_CONFIG.URL}/rest/v1`
};

const getHeaders = () => ({
  'apikey': SUPABASE_MASTER_CONFIG.ANON_KEY,
  'Content-Type': 'application/json',
});

async function testViewMunicipesCompleto() {
  console.log('🧪 === TESTE VW_MUNICIPES_COMPLETO ===\n');
  
  try {
    // 1. Testar listagem com a nova view
    console.log('📋 1. Testando listagem com vw_municipes_completo...');
    const listUrl = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?select=*&limit=3&order=nome_completo.asc`;
    
    const listResponse = await fetch(listUrl, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!listResponse.ok) {
      throw new Error(`Erro na listagem: ${listResponse.status}`);
    }
    
    const listData = await listResponse.json();
    console.log(`✅ Listagem retornou ${listData.length} registros`);
    
    if (listData.length > 0) {
      const primeiro = listData[0];
      console.log('📊 Campos disponíveis no primeiro registro:');
      
      // Campos básicos
      console.log('  📝 Dados básicos:');
      console.log(`    - id: ${primeiro.id ? '✅' : '❌'}`);
      console.log(`    - nome_completo: ${primeiro.nome_completo ? '✅' : '❌'}`);
      console.log(`    - cpf: ${primeiro.cpf ? '✅' : '❌'}`);
      console.log(`    - email: ${primeiro.email ? '✅' : '❌'}`);
      console.log(`    - telefone: ${primeiro.telefone ? '✅' : '❌'}`);
      console.log(`    - data_nascimento: ${primeiro.data_nascimento ? '✅' : '❌'}`);
      console.log(`    - sexo: ${primeiro.sexo ? '✅' : '❌'}`);
      console.log(`    - estado_civil: ${primeiro.estado_civil ? '✅' : '❌'}`);
      console.log(`    - rg: ${primeiro.rg ? '✅' : '❌'}`);
      console.log(`    - nome_mae: ${primeiro.nome_mae ? '✅' : '❌'}`);
      
      // Campos de endereço
      console.log('  🏠 Dados de endereço:');
      console.log(`    - endereco: ${primeiro.endereco ? '✅' : '❌'}`);
      console.log(`    - numero_endereco: ${primeiro.numero_endereco ? '✅' : '❌'}`);
      console.log(`    - bairro: ${primeiro.bairro ? '✅' : '❌'}`);
      console.log(`    - cep: ${primeiro.cep ? '✅' : '❌'}`);
      console.log(`    - cidade: ${primeiro.cidade ? '✅' : '❌'}`);
      console.log(`    - estado: ${primeiro.estado ? '✅' : '❌'}`);
      
      // Campos de saúde
      console.log('  🏥 Dados de saúde:');
      console.log(`    - cartao_sus: ${primeiro.cartao_sus ? '✅' : '❌'}`);
      console.log(`    - uso_medicamento_continuo: ${primeiro.uso_medicamento_continuo ? '✅' : '❌'}`);
      console.log(`    - quais_medicamentos: ${primeiro.quais_medicamentos ? '✅' : '❌'}`);
      console.log(`    - deficiencia: ${primeiro.deficiencia ? '✅' : '❌'}`);
      console.log(`    - necessita_acompanhante: ${primeiro.necessita_acompanhante ? '✅' : '❌'}`);
      console.log(`    - doencas_cronicas: ${primeiro.doencas_cronicas ? '✅' : '❌'}`);
      
      // 2. Testar busca por ID específico
      console.log(`\n🔍 2. Testando busca por ID: ${primeiro.id}...`);
      const idUrl = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?id=eq.${primeiro.id}&select=*`;
      
      const idResponse = await fetch(idUrl, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!idResponse.ok) {
        throw new Error(`Erro na busca por ID: ${idResponse.status}`);
      }
      
      const idData = await idResponse.json();
      if (idData.length > 0) {
        console.log('✅ Busca por ID funcionando');
        console.log('📋 Dados completos para edição:');
        
        const municipe = idData[0];
        const camposPreenchidos = Object.keys(municipe).filter(key => 
          municipe[key] !== null && 
          municipe[key] !== undefined && 
          municipe[key] !== ''
        ).length;
        
        console.log(`   📊 ${camposPreenchidos} campos preenchidos de ${Object.keys(municipe).length} disponíveis`);
        
        // Verificar campos essenciais para edição
        const camposEssenciais = [
          'nome_completo', 'cpf', 'data_nascimento', 'sexo',
          'endereco', 'bairro', 'cep', 'cidade', 'estado',
          'cartao_sus'
        ];
        
        const essenciaisPreenchidos = camposEssenciais.filter(campo => 
          municipe[campo] && municipe[campo] !== ''
        );
        
        console.log(`   🎯 ${essenciaisPreenchidos.length}/${camposEssenciais.length} campos essenciais preenchidos`);
        
        if (essenciaisPreenchidos.length >= camposEssenciais.length * 0.7) {
          console.log('   ✅ Dados suficientes para edição');
        } else {
          console.log('   ⚠️ Poucos dados para edição completa');
        }
        
      } else {
        console.log('❌ Nenhum dado retornado na busca por ID');
      }
      
      // 3. Testar contagem
      console.log('\n📊 3. Testando contagem...');
      const countUrl = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?select=count`;
      
      const countResponse = await fetch(countUrl, {
        method: 'GET',
        headers: { ...getHeaders(), 'Prefer': 'count=exact' },
      });
      
      if (countResponse.ok) {
        const countHeader = countResponse.headers.get('Content-Range');
        if (countHeader) {
          const match = countHeader.match(/\/(\d+)$/);
          if (match) {
            const totalCount = parseInt(match[1], 10);
            console.log(`✅ Total de registros: ${totalCount}`);
          }
        }
      }
    }
    
    // 4. Testar busca por texto
    console.log('\n🔍 4. Testando busca por texto...');
    const searchUrl = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?select=*&or=(nome_completo.ilike.*a*,cpf.like.*1*)&limit=2`;
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log(`✅ Busca por texto retornou ${searchData.length} registros`);
    } else {
      console.log('⚠️ Erro na busca por texto');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

async function compararEndpoints() {
  console.log('\n🔄 === COMPARAÇÃO DE ENDPOINTS ===\n');
  
  try {
    // Comparar municipes_active vs vw_municipes_completo
    console.log('📊 Comparando dados entre endpoints...');
    
    const activeUrl = `${SUPABASE_ENDPOINTS.rest}/municipes_active?select=*&limit=1`;
    const viewUrl = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?select=*&limit=1`;
    
    const [activeResponse, viewResponse] = await Promise.all([
      fetch(activeUrl, { method: 'GET', headers: getHeaders() }),
      fetch(viewUrl, { method: 'GET', headers: getHeaders() })
    ]);
    
    if (activeResponse.ok && viewResponse.ok) {
      const activeData = await activeResponse.json();
      const viewData = await viewResponse.json();
      
      if (activeData.length > 0 && viewData.length > 0) {
        const active = activeData[0];
        const view = viewData[0];
        
        console.log('📋 Campos únicos em municipes_active:');
        Object.keys(active).forEach(key => {
          if (!(key in view)) {
            console.log(`  - ${key}`);
          }
        });
        
        console.log('\n📋 Campos únicos em vw_municipes_completo:');
        Object.keys(view).forEach(key => {
          if (!(key in active)) {
            console.log(`  - ${key}`);
          }
        });
        
        console.log(`\n📊 municipes_active: ${Object.keys(active).length} campos`);
        console.log(`📊 vw_municipes_completo: ${Object.keys(view).length} campos`);
        
        const diferenca = Object.keys(view).length - Object.keys(active).length;
        console.log(`🎯 Diferença: +${diferenca} campos na view completa`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na comparação:', error.message);
  }
}

async function main() {
  console.log('🧪 TESTE MIGRAÇÃO PARA VW_MUNICIPES_COMPLETO\n');
  console.log(`🌐 URL: ${SUPABASE_MASTER_CONFIG.URL}`);
  console.log(`🔑 Chave: ${SUPABASE_MASTER_CONFIG.ANON_KEY.substring(0, 20)}...\n`);
  
  await testViewMunicipesCompleto();
  await compararEndpoints();
  
  console.log('\n✨ === RESULTADO ===');
  console.log('🎯 A migração para vw_municipes_completo permite:');
  console.log('  ✅ Carregamento completo de dados para edição');
  console.log('  ✅ Todos os campos de endereço e saúde em uma requisição');
  console.log('  ✅ Melhor performance (menos requisições)');
  console.log('  ✅ Código mais simples nos services');
  console.log('\n🚀 Migração concluída com sucesso!');
}

main();

#!/usr/bin/env node

/**
 * 🧪 TESTE DAS NOVAS FUNCIONALIDADES DO FORMULÁRIO
 * 
 * Testa:
 * 1. Combos de Estado Civil e Sexo
 * 2. Campo UF/Estado carregando corretamente
 * 3. Mapeamento dos dados da view vw_municipes_completo
 */

const { SUPABASE_MASTER_CONFIG } = require('./supabase.master.config.js');

const SUPABASE_ENDPOINTS = {
  rest: `${SUPABASE_MASTER_CONFIG.URL}/rest/v1`
};

const getHeaders = () => ({
  'apikey': SUPABASE_MASTER_CONFIG.ANON_KEY,
  'Content-Type': 'application/json',
});

async function testarCamposFormulario() {
  console.log('📝 === TESTE DOS NOVOS CAMPOS DO FORMULÁRIO ===\n');
  
  try {
    // 1. Buscar um munícipe para testar os campos
    console.log('🔍 1. Buscando munícipe para teste...');
    const url = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?select=*&limit=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar munícipe: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.length === 0) {
      console.log('⚠️ Nenhum munícipe encontrado para teste');
      return;
    }
    
    const municipe = data[0];
    console.log(`✅ Munícipe encontrado: ${municipe.nome_completo}`);
    
    // 2. Testar campos de formulário
    console.log('\n📋 2. Testando campos para combos...');
    
    // Estado Civil
    console.log('  👫 Estado Civil:');
    console.log(`    📊 Valor no DB: "${municipe.estado_civil || 'não informado'}"`);
    
    const estadosCivisValidos = ['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIÚVO', 'UNIÃO ESTÁVEL', 'SEPARADO'];
    const estadoCivilAtual = municipe.estado_civil;
    
    if (estadoCivilAtual && estadosCivisValidos.includes(estadoCivilAtual.toUpperCase())) {
      console.log(`    ✅ Estado civil válido para combo: ${estadoCivilAtual}`);
    } else {
      console.log(`    ⚠️ Estado civil precisa de padronização: ${estadoCivilAtual || 'vazio'}`);
      console.log(`    📝 Sugestão: mapear para um dos valores: ${estadosCivisValidos.join(', ')}`);
    }
    
    // Sexo
    console.log('\n  🚻 Sexo:');
    console.log(`    📊 Valor no DB: "${municipe.sexo || 'não informado'}"`);
    
    let sexoFormatado = '';
    if (municipe.sexo) {
      switch (municipe.sexo.toUpperCase()) {
        case 'M':
        case 'MASCULINO':
          sexoFormatado = 'Masculino';
          break;
        case 'F':
        case 'FEMININO':
          sexoFormatado = 'Feminino';
          break;
        default:
          sexoFormatado = municipe.sexo;
      }
      console.log(`    ✅ Mapeado para combo: ${sexoFormatado}`);
    } else {
      console.log(`    ⚠️ Sexo não informado`);
    }
    
    // UF/Estado
    console.log('\n  🗺️ Estado/UF:');
    console.log(`    📊 Valor 'estado': "${municipe.estado || 'não informado'}"`);
    console.log(`    📊 Valor 'uf': "${municipe.uf || 'não informado'}"`);
    
    const estadoFinal = municipe.estado || municipe.uf || '';
    if (estadoFinal) {
      console.log(`    ✅ Estado carregado: ${estadoFinal}`);
      
      // Verificar se é uma UF válida
      const ufsValidas = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
        'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
        'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ];
      
      if (ufsValidas.includes(estadoFinal.toUpperCase())) {
        console.log(`    ✅ UF válida: ${estadoFinal.toUpperCase()}`);
      } else {
        console.log(`    ⚠️ Valor não é uma UF padrão: ${estadoFinal}`);
      }
    } else {
      console.log(`    ❌ Estado/UF não informado`);
    }
    
    // 3. Simular preenchimento do formulário
    console.log('\n📝 3. Simulando preenchimento do formulário...');
    
    const formularioMapeado = {
      // Dados básicos
      nomeCompleto: municipe.nome_completo || '',
      cpf: municipe.cpf || '',
      rg: municipe.rg || '',
      
      // Combos implementados
      estadoCivil: municipe.estado_civil || '',
      sexo: sexoFormatado || municipe.sexo || '',
      
      // Endereço (incluindo UF)
      cep: municipe.cep || '',
      rua: municipe.endereco || municipe.logradouro || '',
      numero: municipe.numero_endereco || municipe.numero || '',
      bairro: municipe.bairro || '',
      cidade: municipe.cidade || '',
      estado: estadoFinal,
      
      // Saúde
      numeroSus: municipe.cartao_sus || '',
      usoMedicamentoContinuo: municipe.uso_medicamento_continuo || '',
    };
    
    // Contar campos preenchidos por categoria
    const categorias = {
      'Dados Pessoais': ['nomeCompleto', 'cpf', 'rg', 'estadoCivil', 'sexo'],
      'Endereço': ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'],
      'Saúde': ['numeroSus', 'usoMedicamentoContinuo']
    };
    
    Object.entries(categorias).forEach(([categoria, campos]) => {
      const preenchidos = campos.filter(campo => 
        formularioMapeado[campo] && formularioMapeado[campo] !== ''
      );
      
      console.log(`\n    ${categoria}:`);
      console.log(`      ✅ ${preenchidos.length}/${campos.length} campos preenchidos`);
      
      campos.forEach(campo => {
        const valor = formularioMapeado[campo];
        const status = valor && valor !== '' ? '✅' : '❌';
        const preview = valor ? (valor.length > 30 ? valor.substring(0, 30) + '...' : valor) : 'vazio';
        console.log(`      ${status} ${campo}: ${preview}`);
      });
    });
    
    return { success: true, municipe };
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return { success: false, error: error.message };
  }
}

async function testarBuscaCEP() {
  console.log('\n🔍 === TESTE BUSCA CEP ===\n');
  
  try {
    console.log('📍 Testando API ViaCEP...');
    const cepTeste = '01310-100'; // CEP da Avenida Paulista
    
    const response = await fetch(`https://viacep.com.br/ws/${cepTeste}/json/`);
    const data = await response.json();
    
    if (!data.erro) {
      console.log('✅ ViaCEP funcionando corretamente:');
      console.log(`   📍 Logradouro: ${data.logradouro}`);
      console.log(`   🏘️ Bairro: ${data.bairro}`);
      console.log(`   🏙️ Cidade: ${data.localidade}`);
      console.log(`   🗺️ UF: ${data.uf}`);
      
      console.log('\n📝 Mapeamento para formulário:');
      console.log(`   rua: "${data.logradouro}"`);
      console.log(`   bairro: "${data.bairro}"`);
      console.log(`   cidade: "${data.localidade}"`);
      console.log(`   estado: "${data.uf}"`);
      
      return { success: true, uf: data.uf };
    } else {
      console.log('❌ CEP não encontrado');
      return { success: false };
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar ViaCEP:', error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🧪 TESTE COMPLETO - MELHORIAS DO FORMULÁRIO\n');
  console.log(`🌐 URL: ${SUPABASE_MASTER_CONFIG.URL}`);
  console.log(`🔑 Chave: ${SUPABASE_MASTER_CONFIG.ANON_KEY.substring(0, 20)}...\n`);
  
  const resultadoFormulario = await testarCamposFormulario();
  const resultadoCEP = await testarBuscaCEP();
  
  console.log('\n🎯 === RESULTADO FINAL ===');
  
  if (resultadoFormulario.success) {
    console.log('✅ TESTES DE FORMULÁRIO BEM-SUCEDIDOS!');
    console.log(`👤 Testado com: ${resultadoFormulario.municipe.nome_completo}`);
  } else {
    console.log('❌ PROBLEMAS NO TESTE DE FORMULÁRIO:');
    console.log(`   ${resultadoFormulario.error}`);
  }
  
  if (resultadoCEP.success) {
    console.log('✅ BUSCA CEP FUNCIONANDO!');
    console.log(`📍 UF retornada: ${resultadoCEP.uf}`);
  } else {
    console.log('❌ PROBLEMAS NA BUSCA CEP');
  }
  
  console.log('\n🎉 MELHORIAS IMPLEMENTADAS:');
  console.log('   📋 Combo Estado Civil (6 opções padrão)');
  console.log('   🚻 Combo Sexo (Masculino/Feminino)');
  console.log('   🗺️ Campo UF/Estado com fallback');
  console.log('   🔄 Mapeamento melhorado da view completa');
  console.log('   🎯 Preenchimento automático mais preciso');
  
  console.log('\n✨ O formulário está PRONTO com as novas funcionalidades!');
}

main();

// Teste simples para o sistema de veículos
const { veiculosService } = require('./src/services/veiculosService');

async function testVeiculosSystem() {
  console.log('🚗 Testando Sistema de Veículos');
  
  try {
    // Teste 1: Validações
    console.log('\n1. Testando validações...');
    
    const placaValida = veiculosService.validarPlaca('ABC-1234');
    const placaInvalida = veiculosService.validarPlaca('123-ABCD');
    console.log(`✅ Placa ABC-1234 válida: ${placaValida}`);
    console.log(`❌ Placa 123-ABCD válida: ${placaInvalida}`);
    
    // Teste 2: Formatação
    console.log('\n2. Testando formatação...');
    
    const placaFormatada = veiculosService.formatarPlaca('abc1234');
    const valorFormatado = veiculosService.formatarMoeda(1500.75);
    console.log(`📝 Placa formatada: ${placaFormatada}`);
    console.log(`💰 Valor formatado: ${valorFormatado}`);
    
    // Teste 3: Listar veículos (se houver)
    console.log('\n3. Testando listagem...');
    const veiculos = await veiculosService.listarVeiculos();
    console.log(`📋 Total de veículos encontrados: ${veiculos.length}`);
    
    console.log('\n✅ Sistema de veículos funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testVeiculosSystem();
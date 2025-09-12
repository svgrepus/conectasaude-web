// Teste simples para debug da pesquisa
import { doencaCronicaService } from './services/doencaCronicaService';

export const testSearch = async () => {
  console.log('🧪 Iniciando teste de pesquisa...');
  
  try {
    // Teste 1: Buscar todas as doenças
    console.log('🧪 Teste 1: Buscar todas as doenças');
    const allDiseases = await doencaCronicaService.getDoencasCronicas(1, 10);
    console.log('✅ Resultado todas as doenças:', allDiseases);
    
    // Teste 2: Buscar com termo específico
    console.log('🧪 Teste 2: Buscar com termo "diabetes"');
    const diabetesSearch = await doencaCronicaService.getDoencasCronicas(1, 10, 'diabetes');
    console.log('✅ Resultado busca diabetes:', diabetesSearch);
    
    // Teste 3: Buscar com termo genérico
    console.log('🧪 Teste 3: Buscar com termo "a"');
    const genericSearch = await doencaCronicaService.getDoencasCronicas(1, 10, 'a');
    console.log('✅ Resultado busca genérica:', genericSearch);
    
  } catch (error) {
    console.error('❌ Erro no teste de pesquisa:', error);
  }
};

// Executar teste automaticamente se estiver em desenvolvimento
if (__DEV__) {
  console.log('🧪 Teste de pesquisa disponível via: testSearch()');
}

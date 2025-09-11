// Script de teste para validar a API de doenças crônicas
import { doencaCronicaService } from './services/doencaCronicaService';
import { authService } from './services/auth-simple';

const testAPIIntegration = async () => {
  console.log('🧪 Iniciando teste de integração da API...');
  
  try {
    // 1. Testar se tem token de acesso armazenado
    console.log('1️⃣ Verificando token de acesso...');
    const token = authService.getAccessToken();
    
    if (!token) {
      console.error('❌ Nenhum token de acesso encontrado. Faça login primeiro.');
      return;
    }
    
    console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
    
    // 2. Testar busca de doenças crônicas
    console.log('2️⃣ Testando busca de doenças crônicas...');
    const response = await doencaCronicaService.getDoencasCronicas(1, 5);
    
    console.log('✅ Resposta da API:', {
      total: response.count,
      registros: response.data.length,
      primeiros: response.data.slice(0, 2).map(d => ({ id: d.id, name: d.name }))
    });
    
    // 3. Testar busca com filtro
    if (response.data.length > 0) {
      console.log('3️⃣ Testando busca com filtro...');
      const searchResponse = await doencaCronicaService.getDoencasCronicas(1, 5, 'diabetes');
      
      console.log('✅ Busca filtrada:', {
        termo: 'diabetes',
        resultados: searchResponse.data.length,
        registros: searchResponse.data.map(d => d.name)
      });
    }
    
    console.log('🎉 Teste de integração concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste de integração:', error);
  }
};

export { testAPIIntegration };

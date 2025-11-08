// Teste manual da detecção de URL
// Cole no console do navegador para testar

console.log('🧪 TESTE DE DETECÇÃO DE URL');

// Simular a URL que você recebeu
const testUrl = 'http://localhost:19006/#access_token=eyJhbGciOiJIUzI1NiIsImtpZCI6ImtNbUxDRDhHb3luQmpNOFQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL25lcWtxanB5bnJpbmxzb2RmcmtmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmNGRiZjk0Ni1mNmZkLTQ1MTktYTE2YS1iNDA0MjZkMzE4ZDUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYyNTYyNzQxLCJpYXQiOjE3NjI1NTkxNDEsImVtYWlsIjoiYWJpbGlvLmNvbnN0YW50aW5vQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJhYmlsaW8uY29uc3RhbnRpbm9AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicm9sZSI6ImFkbWluIiwic3ViIjoiZjRkYmY5NDYtZjZmZC00NTE5LWExNmEtYjQwNDI2ZDMxOGQ1In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib3RwIiwidGltZXN0YW1wIjoxNzYyNTU5MTQxfV0sInNlc3Npb25faWQiOiIwODM4N2EwMy04YTU5LTQ1YjYtYTYwNS0yZTRkOWIwNjI1ZTYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.fn8-MuF0V-mRjT1dJyg9eKSywHvKoWNjlZ9wwAL6NSE&expires_at=1762562741&expires_in=3600&refresh_token=ntv27p7zzdrw&token_type=bearer&type=recovery';

// Extrair hash da URL
const url = new URL(testUrl);
console.log('Hash completo:', url.hash);

// Testar extração de parâmetros
const hashParams = new URLSearchParams(url.hash.substring(1));
const access_token = hashParams.get('access_token');
const type = hashParams.get('type');

console.log('Resultados:');
console.log('access_token:', access_token ? 'Encontrado' : 'Não encontrado');
console.log('type:', type);
console.log('Condição (token && type === recovery):', access_token && type === 'recovery');

if (access_token && type === 'recovery') {
    console.log('✅ TESTE PASSOU - URL seria detectada corretamente');
} else {
    console.log('❌ TESTE FALHOU - URL NÃO seria detectada');
}
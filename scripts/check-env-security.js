// Script para verificar segurança das variáveis de ambiente
// Executa: node scripts/check-env-security.js

const fs = require('fs');
const path = require('path');

console.log('🔒 Verificando segurança das variáveis de ambiente...');

const securityChecks = [
    {
        name: 'Arquivo .env não está no Git',
        check: () => {
            const gitignorePath = path.join(process.cwd(), '.gitignore');
            if (!fs.existsSync(gitignorePath)) {
                return { status: 'warning', message: 'Arquivo .gitignore não encontrado' };
            }
            
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            if (!gitignoreContent.includes('.env')) {
                return { status: 'error', message: '.env não está no .gitignore' };
            }
            
            return { status: 'success', message: '.env está protegido no .gitignore' };
        }
    },
    {
        name: 'Variáveis críticas definidas',
        check: () => {
            const criticalVars = [
                'SUPABASE_URL',
                'SUPABASE_SERVICE_KEY',
                'DATABASE_URL'
            ];
            
            const missing = criticalVars.filter(varName => !process.env[varName]);
            
            if (missing.length > 0) {
                return { 
                    status: 'error', 
                    message: `Variáveis faltando: ${missing.join(', ')}` 
                };
            }
            
            return { status: 'success', message: 'Todas as variáveis críticas definidas' };
        }
    },
    {
        name: 'SERVICE_KEY não é a mesma que ANON_KEY',
        check: () => {
            const serviceKey = process.env.SUPABASE_SERVICE_KEY;
            const anonKey = process.env.SUPABASE_ANON_KEY;
            
            if (!serviceKey || !anonKey) {
                return { status: 'warning', message: 'Chaves não definidas para comparação' };
            }
            
            if (serviceKey === anonKey) {
                return { 
                    status: 'error', 
                    message: 'SERVICE_KEY e ANON_KEY são iguais (risco de segurança)' 
                };
            }
            
            return { status: 'success', message: 'Chaves são diferentes (correto)' };
        }
    },
    {
        name: 'URLs HTTPS em produção',
        check: () => {
            const supabaseUrl = process.env.SUPABASE_URL;
            const nodeEnv = process.env.NODE_ENV;
            
            if (!supabaseUrl) {
                return { status: 'warning', message: 'SUPABASE_URL não definida' };
            }
            
            if (nodeEnv === 'production' && !supabaseUrl.startsWith('https://')) {
                return { 
                    status: 'error', 
                    message: 'URL não HTTPS em produção' 
                };
            }
            
            return { status: 'success', message: 'URLs apropriadas para o ambiente' };
        }
    },
    {
        name: 'Senhas seguras',
        check: () => {
            const dbPassword = process.env.DB_PASSWORD;
            const jwtSecret = process.env.JWT_SECRET;
            
            const weakPasswords = ['password', '123456', 'admin', 'postgres'];
            const issues = [];
            
            if (dbPassword && weakPasswords.includes(dbPassword.toLowerCase())) {
                issues.push('DB_PASSWORD é muito fraca');
            }
            
            if (jwtSecret && jwtSecret.length < 32) {
                issues.push('JWT_SECRET é muito curto (mínimo 32 caracteres)');
            }
            
            if (issues.length > 0) {
                return { status: 'error', message: issues.join(', ') };
            }
            
            return { status: 'success', message: 'Senhas aparentam ser seguras' };
        }
    },
    {
        name: 'Arquivo .env.example existe',
        check: () => {
            const examplePath = path.join(process.cwd(), '.env.example');
            if (!fs.existsSync(examplePath)) {
                return { status: 'warning', message: 'Arquivo .env.example não encontrado' };
            }
            
            return { status: 'success', message: 'Arquivo .env.example disponível' };
        }
    }
];

let hasErrors = false;
let hasWarnings = false;

console.log('\n📋 Resultados da verificação:\n');

securityChecks.forEach((check, index) => {
    const result = check.check();
    const icon = result.status === 'success' ? '✅' : 
                result.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${icon} ${check.name}`);
    console.log(`   ${result.message}\n`);
    
    if (result.status === 'error') hasErrors = true;
    if (result.status === 'warning') hasWarnings = true;
});

// Verificações adicionais para arquivos sensíveis
const sensitiveFiles = [
    '.env',
    'private.key',
    'cert.pem',
    'secrets.json'
];

console.log('🔍 Verificando arquivos sensíveis...\n');

sensitiveFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`⚠️  Arquivo sensível encontrado: ${file}`);
        console.log('   Certifique-se de que está no .gitignore\n');
        hasWarnings = true;
    }
});

// Relatório final
console.log('📊 Resumo da verificação:');
if (hasErrors) {
    console.log('❌ ERRO: Problemas críticos de segurança encontrados!');
    console.log('   Corrija os erros antes de fazer deploy em produção.\n');
    process.exit(1);
} else if (hasWarnings) {
    console.log('⚠️  AVISO: Algumas melhorias de segurança recomendadas.');
    console.log('   Revise os avisos para melhor segurança.\n');
} else {
    console.log('✅ SUCESSO: Nenhum problema de segurança detectado!');
    console.log('   Configuração parece segura para produção.\n');
}

// Dicas de segurança
console.log('💡 Dicas de segurança:');
console.log('1. Rotacione chaves de API regularmente');
console.log('2. Use senhas fortes e únicas');
console.log('3. Monitore logs de acesso');
console.log('4. Mantenha dependências atualizadas');
console.log('5. Use HTTPS em produção');
console.log('6. Configure backup seguro');
console.log('7. Implemente rate limiting');
console.log('8. Monitore tentativas de acesso não autorizadas\n');

console.log('🔗 Recursos úteis:');
console.log('- Supabase Security: https://supabase.com/docs/guides/platform/security');
console.log('- OWASP Top 10: https://owasp.org/www-project-top-ten/');
console.log('- Node.js Security: https://nodejs.org/en/security/\n');

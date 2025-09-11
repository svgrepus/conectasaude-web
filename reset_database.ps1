# Script PowerShell para Reset Completo do Supabase
# Execute este script para limpar e recriar todo o banco

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🔥 RESET COMPLETO DO SUPABASE - ConectaSaúde" -ForegroundColor Red
Write-Host "==================================================" -ForegroundColor Cyan

# Verificar se o arquivo existe
if (-not (Test-Path "clean_database.sql")) {
    Write-Host "❌ Arquivo clean_database.sql não encontrado!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "setup_completo.sql")) {
    Write-Host "❌ Arquivo setup_completo.sql não encontrado!" -ForegroundColor Red
    exit 1
}

# Solicitar confirmação
Write-Host "⚠️  ATENÇÃO: Este script irá APAGAR TODOS OS DADOS do banco!" -ForegroundColor Yellow
Write-Host "⚠️  Tem certeza que deseja continuar? (S/N): " -ForegroundColor Yellow -NoNewline
$confirmacao = Read-Host

if ($confirmacao -ne "S" -and $confirmacao -ne "s") {
    Write-Host "❌ Operação cancelada pelo usuário." -ForegroundColor Red
    exit 0
}

# Configurações do banco (ajuste conforme necessário)
$DB_URL = "postgresql://postgres:password@localhost:54322/postgres"

Write-Host "🧹 Passo 1: Limpando banco de dados..." -ForegroundColor Yellow

# Executar limpeza
try {
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        # Se psql estiver disponível
        psql $DB_URL -f clean_database.sql
    } else {
        # Usar Docker se psql não estiver disponível
        Write-Host "📦 Usando Docker para executar comandos SQL..." -ForegroundColor Blue
        
        # Verificar se Docker está rodando
        docker-compose up -d postgres
        Start-Sleep -Seconds 5
        
        # Executar limpeza via Docker
        Get-Content clean_database.sql | docker-compose exec -T postgres psql -U postgres -d postgres
    }
    
    Write-Host "✅ Limpeza concluída com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro durante a limpeza: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Passo 2: Recriando estrutura completa..." -ForegroundColor Yellow

# Executar setup completo
try {
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        psql $DB_URL -f setup_completo.sql
    } else {
        Get-Content setup_completo.sql | docker-compose exec -T postgres psql -U postgres -d postgres
    }
    
    Write-Host "✅ Setup completo executado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro durante o setup: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🎉 RESET COMPLETO FINALIZADO!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ Banco limpo e recriado com sucesso" -ForegroundColor Green
Write-Host "✅ Todas as tabelas, dados e configurações foram restauradas" -ForegroundColor Green
Write-Host "✅ Sistema ConectaSaúde pronto para uso" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

#!/bin/bash

# Script Bash para Reset Completo do Supabase (alternativa para Linux/Mac)

echo "=================================================="
echo "🔥 RESET COMPLETO DO SUPABASE - ConectaSaúde"
echo "=================================================="

# Verificar se os arquivos existem
if [ ! -f "clean_database.sql" ]; then
    echo "❌ Arquivo clean_database.sql não encontrado!"
    exit 1
fi

if [ ! -f "setup_completo.sql" ]; then
    echo "❌ Arquivo setup_completo.sql não encontrado!"
    exit 1
fi

# Solicitar confirmação
echo "⚠️  ATENÇÃO: Este script irá APAGAR TODOS OS DADOS do banco!"
echo "⚠️  Tem certeza que deseja continuar? (s/N): "
read -r confirmacao

if [ "$confirmacao" != "s" ] && [ "$confirmacao" != "S" ]; then
    echo "❌ Operação cancelada pelo usuário."
    exit 0
fi

# Configurações do banco
DB_URL="postgresql://postgres:password@localhost:54322/postgres"

echo "🧹 Passo 1: Limpando banco de dados..."

# Executar limpeza
if command -v psql &> /dev/null; then
    psql "$DB_URL" -f clean_database.sql
else
    echo "📦 Usando Docker para executar comandos SQL..."
    docker-compose up -d postgres
    sleep 5
    cat clean_database.sql | docker-compose exec -T postgres psql -U postgres -d postgres
fi

if [ $? -eq 0 ]; then
    echo "✅ Limpeza concluída com sucesso!"
else
    echo "❌ Erro durante a limpeza!"
    exit 1
fi

echo "🚀 Passo 2: Recriando estrutura completa..."

# Executar setup completo
if command -v psql &> /dev/null; then
    psql "$DB_URL" -f setup_completo.sql
else
    cat setup_completo.sql | docker-compose exec -T postgres psql -U postgres -d postgres
fi

if [ $? -eq 0 ]; then
    echo "✅ Setup completo executado com sucesso!"
else
    echo "❌ Erro durante o setup!"
    exit 1
fi

echo "=================================================="
echo "🎉 RESET COMPLETO FINALIZADO!"
echo "=================================================="
echo "✅ Banco limpo e recriado com sucesso"
echo "✅ Todas as tabelas, dados e configurações foram restauradas"
echo "✅ Sistema ConectaSaúde pronto para uso"
echo "=================================================="

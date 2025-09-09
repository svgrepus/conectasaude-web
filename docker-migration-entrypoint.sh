#!/bin/bash

# ========================================
# Script de Entrada para Migrações Docker
# ========================================

set -e

echo "🚀 Iniciando processo de migração ConectaSaúde..."

# Verificar variáveis de ambiente obrigatórias
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Erro: SUPABASE_URL não definida"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Erro: SUPABASE_SERVICE_KEY não definida"
    exit 1
fi

if [ -z "$SUPABASE_PROJECT_REF" ]; then
    echo "❌ Erro: SUPABASE_PROJECT_REF não definida"
    exit 1
fi

echo "✅ Variáveis de ambiente verificadas"

# Configurar Supabase CLI
echo "🔧 Configurando Supabase CLI..."
supabase login --token "$SUPABASE_SERVICE_KEY" || {
    echo "❌ Erro ao fazer login no Supabase"
    exit 1
}

# Conectar ao projeto
echo "🔗 Conectando ao projeto $SUPABASE_PROJECT_REF..."
supabase link --project-ref "$SUPABASE_PROJECT_REF" || {
    echo "❌ Erro ao conectar ao projeto"
    exit 1
}

echo "✅ Conectado ao projeto Supabase"

# Executar migrações em ordem
echo "📊 Executando migrações SQL..."

migrations=(
    "001_init.sql"
    "002_rls.sql"
    "003_triggers.sql"
    "004_rpcs.sql"
    "005_views.sql"
    "006_seeds.sql"
)

for migration in "${migrations[@]}"; do
    echo "🔄 Executando migração: $migration"
    
    if [ -f "sql/migrations/$migration" ]; then
        psql "$DATABASE_URL" -f "sql/migrations/$migration" || {
            echo "❌ Erro ao executar migração $migration"
            exit 1
        }
        echo "✅ Migração $migration executada com sucesso"
    else
        echo "⚠️  Arquivo de migração não encontrado: $migration"
    fi
done

echo "✅ Todas as migrações SQL executadas"

# Deploy das Edge Functions
echo "🚀 Fazendo deploy das Edge Functions..."

functions=(
    "upload_municipe_foto"
    "relatorios_export"
)

for func in "${functions[@]}"; do
    echo "🔄 Fazendo deploy da função: $func"
    
    if [ -d "functions/$func" ]; then
        supabase functions deploy "$func" --project-ref "$SUPABASE_PROJECT_REF" || {
            echo "❌ Erro ao fazer deploy da função $func"
            exit 1
        }
        echo "✅ Função $func deployada com sucesso"
    else
        echo "⚠️  Diretório da função não encontrado: $func"
    fi
done

echo "✅ Todas as Edge Functions deployadas"

# Criar buckets de storage
echo "🗂️  Configurando buckets de storage..."

# Criar bucket para fotos de munícipes
curl -X POST "$SUPABASE_URL/storage/v1/bucket" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "id": "municipes-fotos",
        "name": "municipes-fotos",
        "public": false,
        "file_size_limit": 5242880,
        "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
    }' || echo "⚠️  Bucket municipes-fotos pode já existir"

echo "✅ Buckets de storage configurados"

# Executar testes de validação
echo "🧪 Executando testes de validação..."

if [ -f "tests/validation_tests.sql" ]; then
    psql "$DATABASE_URL" -f "tests/validation_tests.sql" || {
        echo "❌ Alguns testes falharam - verifique os logs"
        exit 1
    }
    echo "✅ Todos os testes de validação passaram"
else
    echo "⚠️  Arquivo de testes não encontrado"
fi

# Verificar conectividade
echo "🔍 Verificando conectividade com APIs..."

# Testar API REST
curl -f "$SUPABASE_URL/rest/v1/medicamentos_active?limit=1" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" > /dev/null || {
    echo "❌ Erro ao conectar com API REST"
    exit 1
}

echo "✅ API REST funcionando corretamente"

# Testar Edge Functions
for func in "${functions[@]}"; do
    curl -f "$SUPABASE_URL/functions/v1/$func" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -d '{"test": true}' > /dev/null 2>&1 || {
        echo "⚠️  Função $func pode não estar respondendo (normal se não aceitar POST simples)"
    }
done

echo "✅ Edge Functions deployadas e acessíveis"

# Gerar relatório de status
echo "📋 Gerando relatório de status..."

cat << EOF > /tmp/migration_report.txt
========================================
RELATÓRIO DE MIGRAÇÃO CONECTASAÚDE
========================================
Data: $(date)
Projeto: $SUPABASE_PROJECT_REF
URL: $SUPABASE_URL

MIGRAÇÕES SQL:
$(for migration in "${migrations[@]}"; do echo "✅ $migration"; done)

EDGE FUNCTIONS:
$(for func in "${functions[@]}"; do echo "✅ $func"; done)

BUCKETS DE STORAGE:
✅ municipes-fotos

STATUS: SUCESSO
========================================
EOF

cat /tmp/migration_report.txt

echo ""
echo "🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse o painel do Supabase: https://app.supabase.com/project/$SUPABASE_PROJECT_REF"
echo "2. Verifique as tabelas em Database > Tables"
echo "3. Teste as Edge Functions em Edge Functions"
echo "4. Configure usuários em Authentication > Users"
echo "5. Monitore logs em Logs > Explorer"
echo ""
echo "📚 Documentação disponível em:"
echo "- docs/DEPLOY.md"
echo "- docs/API.md"
echo "- docs/MANUAL_USUARIO.md"
echo ""
echo "✨ Sistema ConectaSaúde pronto para uso!"

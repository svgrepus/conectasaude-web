# Configuração do seu projeto "Conecta"
# Preencha as informações do seu projeto Supabase existente

# ========================================
# INFORMAÇÕES DO SEU PROJETO SUPABASE
# ========================================

# 1. Acesse: https://supabase.com/dashboard/projects
# 2. Clique no seu projeto "Conecta"
# 3. Vá em Settings → General → Preencha abaixo:

PROJECT_NAME=Conecta
PROJECT_REF=            # Example: xyzabc123def
SUPABASE_URL=           # Example: https://xyzabc123def.supabase.co

# 4. Vá em Settings → API → Preencha:
SUPABASE_ANON_KEY=      # anon public key
SUPABASE_SERVICE_KEY=   # service_role secret key (MANTENHA SECRETO!)

# 5. Vá em Settings → Database → Connection string → URI:
DATABASE_URL=           # postgresql://postgres:SUA-SENHA@db.projectref.supabase.co:5432/postgres

# ========================================
# COMO USAR ESTAS INFORMAÇÕES
# ========================================

# Opção A: Interface Web do Supabase
# - Vá para: https://supabase.com/dashboard/project/SEU-PROJECT-REF/sql
# - Execute as migrações uma por uma

# Opção B: Via psql (se tiver PostgreSQL instalado)
# psql "postgresql://postgres:SUA-SENHA@db.SEU-PROJECT-REF.supabase.co:5432/postgres"

# Opção C: Via pgAdmin, DBeaver ou outro client PostgreSQL
# Host: db.SEU-PROJECT-REF.supabase.co
# Port: 5432
# Database: postgres
# Username: postgres
# Password: SUA-SENHA

# ========================================
# ORDEM DE EXECUÇÃO DAS MIGRAÇÕES
# ========================================

# Execute EXATAMENTE nesta ordem:
# 1. sql/migrations/001_init.sql       (Tabelas e estrutura)
# 2. sql/migrations/002_rls.sql        (Segurança)
# 3. sql/migrations/003_triggers.sql   (Triggers e funções)
# 4. sql/migrations/004_rpcs.sql       (Procedures)
# 5. sql/migrations/005_views.sql      (Views e relatórios)
# 6. sql/migrations/006_seeds.sql      (Dados iniciais)

# ========================================
# VERIFICAÇÃO FINAL
# ========================================

# Após executar todas as migrações, rode esta query para verificar:

# SELECT 'medicamentos' as tabela, COUNT(*) as total FROM medicamentos
# UNION ALL
# SELECT 'municipes', COUNT(*) FROM municipes  
# UNION ALL
# SELECT 'motoristas', COUNT(*) FROM motoristas
# UNION ALL
# SELECT 'veiculos', COUNT(*) FROM veiculos;

# Resultado esperado:
# medicamentos: 15
# municipes: 3  
# motoristas: 3
# veiculos: 5

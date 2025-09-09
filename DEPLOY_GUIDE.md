# Guia de Deploy para Projeto Supabase "Conecta"

## 🚀 Como subir as migrações para seu projeto Supabase existente

### Opção 1: Via Interface Web do Supabase (Recomendado)

1. **Acesse sua dashboard do Supabase**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login e selecione seu projeto "Conecta"

2. **Vá para o SQL Editor**
   - Na barra lateral, clique em "SQL Editor"
   - Ou acesse: `https://supabase.com/dashboard/project/SEU-PROJECT-ID/sql`

3. **Execute as migrações na ordem**
   Execute os arquivos SQL nesta ordem exata:

   **3.1. Migration 001 - Estrutura inicial**
   ```sql
   -- Copie e cole todo o conteúdo do arquivo: sql/migrations/001_init.sql
   ```

   **3.2. Migration 002 - RLS (Row Level Security)**
   ```sql
   -- Copie e cole todo o conteúdo do arquivo: sql/migrations/002_rls.sql
   ```

   **3.3. Migration 003 - Triggers**
   ```sql
   -- Copie e cole todo o conteúdo do arquivo: sql/migrations/003_triggers.sql
   ```

   **3.4. Migration 004 - RPCs (Stored Procedures)**
   ```sql
   -- Copie e cole todo o conteúdo do arquivo: sql/migrations/004_rpcs.sql
   ```

   **3.5. Migration 005 - Views**
   ```sql
   -- Copie e cole todo o conteúdo do arquivo: sql/migrations/005_views.sql
   ```

   **3.6. Migration 006 - Dados iniciais (Seeds)**
   ```sql
   -- Copie e cole todo o conteúdo do arquivo: sql/migrations/006_seeds.sql
   ```

### Opção 2: Via CLI do Supabase (Se conseguir instalar)

1. **Instalar CLI do Supabase**
   ```bash
   # Windows via PowerShell (como Admin)
   winget install Supabase.CLI
   
   # Ou baixar manualmente:
   # https://github.com/supabase/cli/releases
   ```

2. **Login e conectar ao projeto**
   ```bash
   supabase login
   supabase link --project-ref SEU-PROJECT-REF
   ```

3. **Aplicar migrações**
   ```bash
   supabase db push
   ```

### Opção 3: Via Client PostgreSQL (psql, pgAdmin, DBeaver)

1. **Obter string de conexão**
   - No Supabase Dashboard → Settings → Database → Connection string → URI
   - Formato: `postgresql://postgres:SUA-SENHA@db.seu-projeto.supabase.co:5432/postgres`

2. **Conectar e executar**
   ```bash
   psql "postgresql://postgres:SUA-SENHA@db.seu-projeto.supabase.co:5432/postgres"
   ```

3. **Executar migrações**
   ```sql
   \i sql/migrations/001_init.sql
   \i sql/migrations/002_rls.sql
   \i sql/migrations/003_triggers.sql
   \i sql/migrations/004_rpcs.sql
   \i sql/migrations/005_views.sql
   \i sql/migrations/006_seeds.sql
   ```

## ⚠️ ATENÇÃO: Problemas conhecidos e soluções

### ✅ CPF Validation - RESOLVIDO
Os CPFs no arquivo `006_seeds.sql` foram corrigidos para usar valores válidos:
- Ana Paula: `123.456.789-09` ✅
- Roberto Carlos: `987.654.321-00` ✅  
- Claudia Santos: `012.345.678-90` ✅

### ✅ História de Movimentações - RESOLVIDO
O arquivo `006_seeds.sql` foi atualizado para:
- Desabilitar temporariamente o trigger `trigger_estoque_movimentos_history` durante inserção
- Reabilitar automaticamente após inserção dos dados

### ✅ Trigger Name Fix - RESOLVIDO
Corrigido o nome do trigger de `estoque_movimentos_history_trigger` para `trigger_estoque_movimentos_history`

## 🔧 Configuração das Edge Functions

Após executar as migrações, você precisará fazer upload das Edge Functions:

1. **Upload da função upload_municipe_foto**
   - Via Supabase Dashboard → Edge Functions → New Function
   - Nome: `upload_municipe_foto`
   - Código: copiar de `functions/upload_municipe_foto/index.ts`

2. **Upload da função relatorios_export**
   - Nome: `relatorios_export`
   - Código: copiar de `functions/relatorios_export/index.ts`

## 📦 Configuração do Storage

1. **Criar bucket para fotos**
   - Supabase Dashboard → Storage → New Bucket
   - Nome: `municipes-fotos`
   - Público: false (apenas RLS)

## ✅ Verificação Final

Execute estas consultas para verificar se tudo funcionou:

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar dados inseridos
SELECT 'tipos_veiculos' as tabela, COUNT(*) as registros FROM basic_vehicle_types
UNION ALL
SELECT 'medicamentos', COUNT(*) FROM medicamentos
UNION ALL
SELECT 'motoristas', COUNT(*) FROM motoristas
UNION ALL
SELECT 'municipes', COUNT(*) FROM municipes
UNION ALL
SELECT 'veiculos', COUNT(*) FROM veiculos;

-- Testar CPF validation
SELECT 
    nome_completo,
    cpf,
    validate_cpf(cpf) as cpf_valido
FROM municipes;
```

## 🆘 Em caso de erro

Se alguma migração falhar:

1. **Verificar logs** no Supabase Dashboard → Logs
2. **Executar apenas as partes que falharam**
3. **Contatar suporte** com o erro específico

## 📝 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Configurar variáveis de ambiente (.env)
2. ✅ Testar Edge Functions
3. ✅ Configurar autenticação
4. ✅ Testar aplicação completa

---

**💡 Dica**: Comece sempre pela **Opção 1** (interface web) - é a mais simples e confiável!

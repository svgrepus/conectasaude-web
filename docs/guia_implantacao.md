# Guia de Implantação - ConectaSaúde

Este guia fornece instruções passo a passo para implantar o sistema ConectaSaúde no Supabase.

## 📋 Pré-requisitos

### Contas e Acessos
- [ ] Conta no Supabase (gratuita ou paga)
- [ ] Acesso ao painel administrativo
- [ ] Email para notificações (opcional)

### Conhecimentos Básicos
- [ ] SQL básico
- [ ] Conceitos de API REST
- [ ] JSON (para configurações)

## 🚀 Passo 1: Criação do Projeto no Supabase

### 1.1 Acessar o Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"

### 1.2 Configurar o Projeto
```
Nome do Projeto: ConectaSaude
Organização: Sua Secretaria de Saúde
Região: South America (São Paulo) - recomendado para Brasil
Plano: Free (para testes) ou Pro (para produção)
```

### 1.3 Aguardar Provisioning
- ⏱️ Tempo estimado: 2-5 minutos
- 📧 Você receberá um email quando estiver pronto

## 🗄️ Passo 2: Execução das Migrações SQL

### 2.1 Acessar o SQL Editor
1. No dashboard do projeto, clique em "SQL Editor"
2. Clique em "New query"

### 2.2 Executar Migrações (IMPORTANTE: NA ORDEM!)

#### Migração 1: Estrutura Inicial
1. Copie todo o conteúdo de `sql/migrations/001_init.sql`
2. Cole no SQL Editor
3. Clique em "Run" (ou Ctrl+Enter)
4. ✅ Aguarde confirmação de sucesso

#### Migração 2: Row Level Security
1. **Nova query**: Clique em "New query"
2. Copie todo o conteúdo de `sql/migrations/002_rls.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. ✅ Aguarde confirmação de sucesso

#### Migração 3: Triggers
1. **Nova query**: Clique em "New query"
2. Copie todo o conteúdo de `sql/migrations/003_triggers.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. ✅ Aguarde confirmação de sucesso

#### Migração 4: RPCs
1. **Nova query**: Clique em "New query"
2. Copie todo o conteúdo de `sql/migrations/004_rpcs.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. ✅ Aguarde confirmação de sucesso

#### Migração 5: Views
1. **Nova query**: Clique em "New query"
2. Copie todo o conteúdo de `sql/migrations/005_views.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. ✅ Aguarde confirmação de sucesso

#### Migração 6: Seeds (Dados Iniciais)
1. **Nova query**: Clique em "New query"
2. Copie todo o conteúdo de `sql/migrations/006_seeds.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. ✅ Aguarde confirmação e verifique os NOTICEs com contadores

### 2.3 Verificação das Migrações
Execute esta query para verificar se tudo foi criado:
```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar views criadas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar funções RPC criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name LIKE 'rpc_%'
ORDER BY routine_name;
```

## 🗂️ Passo 3: Configuração do Storage

### 3.1 Criar Bucket para Fotos
1. No dashboard, vá para "Storage"
2. Clique em "Create bucket"
3. Configure:
   ```
   Nome: municipes-fotos
   Público: Não (deixe desmarcado)
   File size limit: 5MB
   Allowed MIME types: image/jpeg, image/jpg, image/png
   ```
4. Clique em "Create bucket"

### 3.2 Configurar Políticas do Storage
1. No bucket `municipes-fotos`, clique em "Policies"
2. Clique em "New policy"
3. Adicione as políticas:

```sql
-- Política para INSERT (upload)
CREATE POLICY "Permitir upload de fotos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'municipes-fotos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para SELECT (visualização)
CREATE POLICY "Permitir visualização de fotos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'municipes-fotos');

-- Política para UPDATE (substituição)
CREATE POLICY "Permitir atualização de fotos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'municipes-fotos')
WITH CHECK (bucket_id = 'municipes-fotos');

-- Política para DELETE (remoção)
CREATE POLICY "Permitir exclusão de fotos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'municipes-fotos');
```

## ⚡ Passo 4: Deploy das Edge Functions

### 4.1 Via Supabase CLI (Recomendado)

#### Instalar CLI
```bash
# NPM
npm install -g supabase

# Ou via package manager do seu sistema
# Windows (Chocolatey)
choco install supabase

# macOS (Homebrew)
brew install supabase/tap/supabase
```

#### Fazer Login
```bash
supabase login
```

#### Deploy das Functions
```bash
# Navegar para a pasta do projeto
cd ConectaSaude

# Deploy função de upload
supabase functions deploy upload_municipe_foto --project-ref SEU-PROJECT-REF

# Deploy função de relatórios
supabase functions deploy relatorios_export --project-ref SEU-PROJECT-REF
```

### 4.2 Via Dashboard (Alternativo)

1. No dashboard, vá para "Edge Functions"
2. Clique em "Create function"
3. Para `upload_municipe_foto`:
   ```
   Nome: upload_municipe_foto
   Código: [cole o conteúdo de functions/upload_municipe_foto/index.ts]
   ```
4. Repita para `relatorios_export`

## 👥 Passo 5: Configuração de Autenticação

### 5.1 Configurar Provedores de Auth
1. No dashboard, vá para "Authentication" → "Providers"
2. Configure:
   ```
   Email: ✅ Habilitado
   Confirm email: ✅ Recomendado
   Phone: ⬜ Opcional
   ```

### 5.2 Configurar Templates de Email
1. Vá para "Authentication" → "Templates"
2. Personalize os templates conforme necessário

### 5.3 Criar Usuários Iniciais
Execute no SQL Editor:
```sql
-- Criar usuário administrador
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@saude.gov.br',
  crypt('senha123', gen_salt('bf')),
  now(),
  '{"role": "admin"}'::jsonb,
  now(),
  now(),
  '',
  ''
);
```

## 🔧 Passo 6: Configuração das APIs

### 6.1 Obter Chaves de API
1. No dashboard, vá para "Settings" → "API"
2. Copie:
   ```
   Project URL: https://seu-projeto.supabase.co
   Anon key: sua-chave-publica
   Service role key: sua-chave-privada
   ```

### 6.2 Configurar CORS (se necessário)
Para aplicações web, configure CORS:
```sql
-- Adicionar domínios permitidos
ALTER FUNCTION get_user_role() SET search_path = public;
```

### 6.3 Testar APIs Básicas
```bash
# Testar conexão
curl "https://seu-projeto.supabase.co/rest/v1/medicamentos_active" \
  -H "apikey: SUA-ANON-KEY" \
  -H "Authorization: Bearer SUA-ANON-KEY"

# Deve retornar lista de medicamentos
```

## 📊 Passo 7: Verificação e Testes

### 7.1 Executar Testes de Validação
1. No SQL Editor, execute:
```sql
-- Cole o conteúdo de tests/validation_tests.sql
```
2. Verifique se todos os testes passam

### 7.2 Testar Funcionalidades Principais

#### Testar Entrada de Estoque
```bash
curl -X POST "https://seu-projeto.supabase.co/rest/v1/rpc/rpc_estoque_entrada" \
  -H "apikey: SUA-ANON-KEY" \
  -H "Authorization: Bearer SUA-ANON-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_medicamento_id": "uuid-de-um-medicamento",
    "p_unidade_destino_id": "uuid-de-uma-unidade",
    "p_quantidade": 10,
    "p_motivo": "Teste de implantação"
  }'
```

#### Testar Relatórios
```bash
curl "https://seu-projeto.supabase.co/rest/v1/vw_dashboard_executivo" \
  -H "apikey: SUA-ANON-KEY" \
  -H "Authorization: Bearer SUA-ANON-KEY"
```

### 7.3 Verificar Dashboard
1. Acesse "Database" → "Tables"
2. Verifique se todas as tabelas estão presentes
3. Clique em algumas tabelas e veja se há dados

## 🔒 Passo 8: Configurações de Segurança

### 8.1 Configurar RLS
1. Verifique se RLS está habilitado:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

### 8.2 Revisar Políticas
```sql
-- Listar todas as políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 8.3 Configurar Rate Limiting (Produção)
1. No dashboard, vá para "Settings" → "API"
2. Configure limites apropriados:
   ```
   Requests per minute: 1000 (ajustar conforme necessário)
   ```

## 📈 Passo 9: Monitoramento

### 9.1 Configurar Logs
1. Vá para "Logs" no dashboard
2. Configure alertas para:
   - Erros críticos
   - Uso excessivo de CPU/memória
   - Falhas de autenticação

### 9.2 Configurar Métricas
1. Vá para "Reports" no dashboard
2. Configure relatórios automáticos

## 🚀 Passo 10: Go Live!

### 10.1 Checklist Final
- [ ] ✅ Todas as migrações executadas
- [ ] ✅ Dados de seed carregados
- [ ] ✅ Storage configurado
- [ ] ✅ Edge Functions deployadas
- [ ] ✅ Usuários criados
- [ ] ✅ Testes passando
- [ ] ✅ APIs funcionando
- [ ] ✅ Documentação revisada

### 10.2 Backup Inicial
```bash
# Fazer backup da estrutura
pg_dump -h db.seu-projeto.supabase.co \
        -U postgres \
        --schema-only \
        postgres > estrutura_inicial.sql

# Fazer backup dos dados
pg_dump -h db.seu-projeto.supabase.co \
        -U postgres \
        --data-only \
        postgres > dados_iniciais.sql
```

### 10.3 Configurar Ambiente de Produção
1. Configure domínio personalizado (se necessário)
2. Configure SSL/TLS
3. Configure backups automáticos
4. Configure monitoramento

## 🎉 Sucesso!

Seu sistema ConectaSaúde está agora implantado e funcionando!

### Próximos Passos:
1. 📱 Desenvolver ou integrar frontend
2. 👥 Treinar usuários
3. 📊 Monitorar performance
4. 🔄 Configurar rotinas de backup
5. 📈 Acompanhar métricas de uso

### URLs Importantes:
- **Dashboard**: https://app.supabase.com/project/SEU-PROJECT-REF
- **API Base**: https://SEU-PROJECT-REF.supabase.co
- **Documentação da API**: https://SEU-PROJECT-REF.supabase.co/rest/v1/

## 🆘 Suporte e Troubleshooting

### Problemas Comuns:

#### Erro de Migração
```
ERROR: relation "tabela" already exists
```
**Solução**: Verificar se migração anterior foi executada corretamente.

#### Erro de Permissão RLS
```
new row violates row-level security policy
```
**Solução**: Verificar se usuário tem papel correto no JWT token.

#### Edge Function não funciona
```
Function not found
```
**Solução**: Redesployar function ou verificar nome no deploy.

### Contatos de Suporte:
- 📚 Documentação: [docs/README.md](README.md)
- 🐛 Issues: Criar issue no repositório
- 💬 Suporte: suporte@conectasaude.gov.br

---

**✅ Implantação Concluída!** 
O sistema ConectaSaúde está pronto para uso. 🎊

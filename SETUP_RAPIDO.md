# GUIA DE SETUP RÁPIDO - ConectaSaúde

## 📋 Passo a Passo para Configurar o Sistema

### 1. Executar SQL no Supabase
1. Abra: https://supabase.com/dashboard/project/neqkqjpynrinlsodfrkf/sql/new
2. Copie TODO o conteúdo do arquivo `setup_completo.sql`
3. Cole no editor SQL do Supabase
4. Clique em "RUN" para executar

### 2. Testar a API no Swagger
1. Acesse: http://localhost:3000/docs/api/
2. No dropdown "Servers", selecione: **Supabase Production**
3. Clique em "Authorize" 🔒
4. Cole sua chave anon public:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MDI3MjEsImV4cCI6MjA0MTQ3ODcyMX0.CIGIkXVC39...
   ```
5. Teste qualquer endpoint (ex: GET /medicamentos)

### 3. Verificar se Funcionou
✅ **Sucesso**: API retorna dados dos medicamentos  
❌ **Erro 404**: Tabela não foi criada - verifique se o SQL foi executado corretamente  
❌ **Erro 401**: Problema de autenticação - verifique a chave API  

### 4. Comandos Úteis (PowerShell)
```powershell
# Ver conteúdo do arquivo SQL completo
Get-Content setup_completo.sql

# Iniciar servidor de documentação
deno run --allow-net --allow-read serve-docs.ts

# Verificar se porta 3000 está em uso
netstat -an | findstr :3000
```

## 🔧 Resolução de Problemas

**Problema**: "Permission denied" no Supabase  
**Solução**: Use a chave `service_role` em vez da `anon` para operações administrativas

**Problema**: "Table doesn't exist"  
**Solução**: Execute novamente o SQL no editor do Supabase

**Problema**: Erro CORS  
**Solução**: Use o servidor Supabase em vez do localhost

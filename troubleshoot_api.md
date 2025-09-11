# Troubleshoot - API não retorna dados

## 🚨 Problema Identificado
- Supabase tem dados na tabela `basic_health_chronic_diseases`
- Postman retorna array vazio `[]`
- Status 200 OK mas sem dados

## 🔧 Soluções para testar:

### 1. **Verificar Headers no Postman**

**Headers obrigatórios:**
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MDI3MjEsImV4cCI6MjA0MTQ3ODcyMX0.CIGIkXVC39cshvdJH4oM0nHDFV5k4dM4L0I7-67vbj8
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

### 2. **Testar sem RLS primeiro**

Execute no SQL Editor do Supabase:
```sql
-- Desabilitar RLS temporariamente para teste
ALTER TABLE basic_health_chronic_diseases DISABLE ROW LEVEL SECURITY;
```

### 3. **URLs para testar no Postman**

**✅ Teste 1 - Básico:**
```
GET https://neqkqjpynrinlsodfrkf.supabase.co/rest/v1/basic_health_chronic_diseases?select=*
```

**✅ Teste 2 - Com contagem:**
```
GET https://neqkqjpynrinlsodfrkf.supabase.co/rest/v1/basic_health_chronic_diseases?select=count()
```

**✅ Teste 3 - Limite pequeno:**
```
GET https://neqkqjpynrinlsodfrkf.supabase.co/rest/v1/basic_health_chronic_diseases?select=*&limit=5
```

### 4. **Verificar se a tabela existe**

Execute no SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'basic_health_chronic_diseases';
```

### 5. **Verificar dados diretamente**

Execute no SQL Editor:
```sql
SELECT id, name, description, created_at, deleted_at 
FROM basic_health_chronic_diseases 
LIMIT 5;
```

### 6. **Verificar RLS policies**

Execute no SQL Editor:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'basic_health_chronic_diseases';
```

## 🎯 **Teste Rápido no Postman**

1. **Criar nova requisição**
2. **Método:** GET
3. **URL:** `https://neqkqjpynrinlsodfrkf.supabase.co/rest/v1/basic_health_chronic_diseases?select=*`
4. **Headers:**
   - `apikey`: sua_chave_aqui
   - `Content-Type`: application/json
5. **Send**

## 🔄 **Se ainda não funcionar:**

Teste esta URL que força bypass do RLS:
```
GET https://neqkqjpynrinlsodfrkf.supabase.co/rest/v1/basic_health_chronic_diseases?select=*&apikey=SUA_CHAVE
```

Vou criar um script SQL para resolver o problema do RLS.

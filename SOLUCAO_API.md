# 🚨 SOLUÇÃO: API não retorna dados

## 📋 **Passo a Passo para Resolver**

### **1. Execute o script SQL no Supabase**
Copie e cole este código no SQL Editor do Supabase:

```sql
-- Desabilitar RLS temporariamente para teste
ALTER TABLE basic_health_chronic_diseases DISABLE ROW LEVEL SECURITY;
ALTER TABLE basic_health_disease_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE basic_vehicle_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE basic_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE basic_access_profiles DISABLE ROW LEVEL SECURITY;

-- Verificar se tem dados
SELECT COUNT(*) as total FROM basic_health_chronic_diseases;
```

### **2. Configure o Postman corretamente**

**URL:**
```
https://neqkqjpynrinlsodfrkf.supabase.co/rest/v1/basic_health_chronic_diseases?select=*
```

**Headers (TODOS obrigatórios):**
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MDI3MjEsImV4cCI6MjA0MTQ3ODcyMX0.CIGIkXVC39cshvdJH4oM0nHDFV5k4dM4L0I7-67vbj8
Content-Type: application/json
```

### **3. Teste no navegador primeiro**
Cole esta URL no navegador para verificar se funciona:
```
https://neqkqjpynrinlsodfrkf.supabase.co/rest/v1/basic_health_chronic_diseases?select=*&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MDI3MjEsImV4cCI6MjA0MTQ3ODcyMX0.CIGIkXVC39cshvdJH4oM0nHDFV5k4dM4L0I7-67vbj8
```

### **4. Importe a Collection correta**
Use o arquivo: `CadastrosBasicos_Postman_Collection.json`

### **5. Configurar variáveis no Postman**
- `base_url`: https://neqkqjpynrinlsodfrkf.supabase.co
- `anon_key`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MDI3MjEsImV4cCI6MjA0MTQ3ODcyMX0.CIGIkXVC39cshvdJH4oM0nHDFV5k4dM4L0I7-67vbj8

## ✅ **Após seguir esses passos, você deve ver os dados!**

**O problema era:** RLS (Row Level Security) estava bloqueando o acesso anônimo às tabelas.

**A solução:** Desabilitamos RLS temporariamente para os testes.

## 🔄 **Se quiser reabilitar RLS depois:**

```sql
-- Reabilitar RLS com policy pública
ALTER TABLE basic_health_chronic_diseases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON basic_health_chronic_diseases
    FOR SELECT USING (true);

CREATE POLICY "public_insert" ON basic_health_chronic_diseases  
    FOR INSERT WITH CHECK (true);

CREATE POLICY "public_update" ON basic_health_chronic_diseases
    FOR UPDATE USING (true);
```

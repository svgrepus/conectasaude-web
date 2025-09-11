# 🔐 Configuração Segura - Guia Completo

## 🎯 **SOLUÇÃO RECOMENDADA: Chave Secreta**

### **1. Execute o script de segurança no Supabase:**
```sql
-- Copie e cole este código no SQL Editor:
```
```sql
-- Habilitar RLS com políticas seguras
ALTER TABLE basic_health_chronic_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE basic_health_disease_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE basic_vehicle_types ENABLE ROW LEVEL SECURITY;

-- Criar política para service_role (chave secreta)
CREATE POLICY "allow_service_role_all" ON basic_health_chronic_diseases
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "allow_service_role_all" ON basic_health_disease_types
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "allow_service_role_all" ON basic_vehicle_types
    FOR ALL USING (auth.role() = 'service_role');
```

### **2. Configure o Postman:**

**Headers para usar a CHAVE SECRETA:**
```
apikey: sb_secret_rKDH8GPt3lNKKQKXnDWqw_RIHPMIgU
Authorization: Bearer sb_secret_rKDH8GPt3lNKKQKXnDWqw_RIHPMIgU
Content-Type: application/json
```

### **3. URLs de teste:**

**✅ Listar doenças crônicas:**
```
GET https://neqkqjpynrinlsodfrkf.supabase.co/rest/v1/basic_health_chronic_diseases?select=*
```

**✅ Criar nova doença:**
```
POST https://neqkqjpynrinlsodfrkf.supabase.co/rest/v1/basic_health_chronic_diseases
```
Body:
```json
{
  "name": "Nova Doença Teste",
  "description": "Teste de criação via API"
}
```

## 🛡️ **Níveis de Segurança**

### **🔴 Desenvolvimento (Chave Secreta)**
- ✅ Acesso total às tabelas
- ✅ Não precisa autenticação de usuário
- ⚠️ Só use em desenvolvimento/teste
- **Use**: `sb_secret_rKDH8GPt3lNKKQKXnDWqw_RIHPMIgU`

### **🟡 Produção Simples (Chave Pública + RLS Público)**
- ✅ RLS ativo com políticas públicas
- ✅ Mais seguro que chave secreta
- **Use**: `sb_publishable_rvIQk28esGzR-p7IVSDR8g_B853ZdyP`

### **🟢 Produção Completa (Autenticação + RLS)**
- ✅ Usuários autenticados
- ✅ Políticas baseadas em roles
- ✅ Máxima segurança

## 📋 **Teste Rápido no Postman**

1. **Método:** GET
2. **URL:** `https://neqkqjpynrinlsodfrkf.supabase.co/rest/v1/basic_health_chronic_diseases?select=*`
3. **Headers:**
   - `apikey`: `sb_secret_rKDH8GPt3lNKKQKXnDWqw_RIHPMIgU`
   - `Authorization`: `Bearer sb_secret_rKDH8GPt3lNKKQKXnDWqw_RIHPMIgU`
   - `Content-Type`: `application/json`
4. **Send**

**Resultado esperado:** Array com as 16 doenças crônicas cadastradas.

## ⚠️ **IMPORTANTE: Segurança da Chave Secreta**

- 🚫 **NUNCA** commite a chave secreta no Git
- 🚫 **NUNCA** use em frontend/aplicação cliente
- ✅ **APENAS** para desenvolvimento e testes
- ✅ **APENAS** em backend/servidor seguro

## 🔄 **Para migrar para produção depois:**

1. Use a chave pública: `sb_publishable_rvIQk28esGzR-p7IVSDR8g_B853ZdyP`
2. Implemente autenticação de usuários
3. Configure políticas RLS baseadas em roles
4. Use variáveis de ambiente para as chaves

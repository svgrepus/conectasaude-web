# API dos Cadastros Básicos - Exemplos para Postman

## 🔧 Configuração Base

**Base URL:** `https://neqkqjpynrinlsodfrkf.supabase.co`

### 🔐 **OPÇÃO 1: Chave Secreta (Recomendada para desenvolvimento)**
**Headers obrigatórios:**
```
apikey: sb_secret_rKDH8GPt3lNKKQKXnDWqw_RIHPMIgU
Authorization: Bearer sb_secret_rKDH8GPt3lNKKQKXnDWqw_RIHPMIgU
Content-Type: application/json
```

### 🌍 **OPÇÃO 2: Chave Pública (Para produção com RLS)**
**Headers obrigatórios:**
```
apikey: sb_publishable_rvIQk28esGzR-p7IVSDR8g_B853ZdyP
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

---

## 🏥 **1. DOENÇAS CRÔNICAS** (`basic_health_chronic_diseases`)

### ✅ **Listar todas**
```
GET {{base_url}}/rest/v1/basic_health_chronic_diseases?select=*
```

### ✅ **Listar apenas ativas** (usando a view)
```
GET {{base_url}}/rest/v1/basic_health_chronic_diseases_active?select=*
```

### ✅ **Buscar por nome**
```
GET {{base_url}}/rest/v1/basic_health_chronic_diseases?select=*&name=ilike.*Diabetes*
```

### ✅ **Criar nova doença crônica**
```
POST {{base_url}}/rest/v1/basic_health_chronic_diseases
Content-Type: application/json
Prefer: return=representation

{
  "name": "Artrite Reumatoide",
  "description": "Doença inflamatória crônica das articulações"
}
```

### ✅ **Atualizar doença crônica**
```
PATCH {{base_url}}/rest/v1/basic_health_chronic_diseases?id=eq.1
Content-Type: application/json
Prefer: return=representation

{
  "description": "Descrição atualizada da doença"
}
```

### ✅ **Soft Delete (marcar como excluída)**
```
PATCH {{base_url}}/rest/v1/basic_health_chronic_diseases?id=eq.1
Content-Type: application/json

{
  "deleted_at": "2025-09-10T10:00:00Z"
}
```

---

## 🩺 **2. TIPOS DE DOENÇA** (`basic_health_disease_types`)

### ✅ **Listar todos**
```
GET {{base_url}}/rest/v1/basic_health_disease_types?select=*
```

### ✅ **Listar apenas ativos**
```
GET {{base_url}}/rest/v1/basic_health_disease_types_active?select=*
```

### ✅ **Criar novo tipo**
```
POST {{base_url}}/rest/v1/basic_health_disease_types
Content-Type: application/json
Prefer: return=representation

{
  "name": "Neurológica",
  "description": "Doenças que afetam o sistema nervoso"
}
```

---

## 🚗 **3. TIPOS DE VEÍCULO** (`basic_vehicle_types`)

### ✅ **Listar todos**
```
GET {{base_url}}/rest/v1/basic_vehicle_types?select=*
```

### ✅ **Listar apenas ativos**
```
GET {{base_url}}/rest/v1/basic_vehicle_types_active?select=*
```

### ✅ **Criar novo tipo**
```
POST {{base_url}}/rest/v1/basic_vehicle_types
Content-Type: application/json
Prefer: return=representation

{
  "name": "Ambulância UTI Móvel",
  "description": "Ambulância equipada com UTI móvel para casos críticos"
}
```

---

## 👔 **4. CARGOS** (`basic_roles`)

### ✅ **Listar todos**
```
GET {{base_url}}/rest/v1/basic_roles?select=*
```

### ✅ **Listar apenas ativos**
```
GET {{base_url}}/rest/v1/basic_roles_active?select=*
```

### ✅ **Criar novo cargo**
```
POST {{base_url}}/rest/v1/basic_roles
Content-Type: application/json
Prefer: return=representation

{
  "name": "Enfermeiro Especialista",
  "description": "Enfermeiro com especialização em área específica"
}
```

---

## 🔐 **5. PERFIS DE ACESSO** (`basic_access_profiles`)

### ✅ **Listar todos**
```
GET {{base_url}}/rest/v1/basic_access_profiles?select=*
```

### ✅ **Listar apenas ativos**
```
GET {{base_url}}/rest/v1/basic_access_profiles_active?select=*
```

---

## 📋 **Exemplos de Filtros Avançados**

### **Ordenação**
```
GET {{base_url}}/rest/v1/basic_health_chronic_diseases?select=*&order=name.asc
```

### **Limitação de resultados**
```
GET {{base_url}}/rest/v1/basic_health_chronic_diseases?select=*&limit=10&offset=0
```

### **Busca em múltiplos campos**
```
GET {{base_url}}/rest/v1/basic_health_chronic_diseases?select=*&or=(name.ilike.*diabetes*,description.ilike.*diabetes*)
```

### **Contagem de registros**
```
GET {{base_url}}/rest/v1/basic_health_chronic_diseases?select=count()
```

---

## 🚀 **Como testar no Postman:**

1. **Importe a collection** `ConectaSaude_Postman_Collection.json`
2. **Configure as variáveis:**
   - `base_url`: https://neqkqjpynrinlsodfrkf.supabase.co
   - `anon_key`: [sua chave]
3. **Execute primeiro o Login** para obter o token
4. **Teste os endpoints** acima

## ⚠️ **Observações importantes:**

- **Soft Delete:** Use `deleted_at` para marcar como excluído
- **Views _active:** Retornam apenas registros onde `deleted_at IS NULL`
- **Headers obrigatórios:** `apikey` e `Content-Type`
- **Prefer: return=representation** - Retorna o objeto criado/atualizado

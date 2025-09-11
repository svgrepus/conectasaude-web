# COMANDOS PARA RESET COMPLETO DO SUPABASE

## 🔥 ATENÇÃO: Estes comandos irão APAGAR TODOS OS DADOS!

### Opção 1: Script Automatizado (RECOMENDADO)
```powershell
# Windows PowerShell
.\reset_database.ps1
```

```bash
# Linux/Mac
chmod +x reset_database.sh
./reset_database.sh
```

### Opção 2: Comandos Manuais

#### 2.1 Usando psql (se instalado)
```bash
# 1. Limpar banco
psql "postgresql://postgres:password@localhost:54322/postgres" -f clean_database.sql

# 2. Recriar estrutura
psql "postgresql://postgres:password@localhost:54322/postgres" -f setup_completo.sql
```

#### 2.2 Usando Docker Compose
```bash
# 1. Garantir que PostgreSQL está rodando
docker-compose up -d postgres

# 2. Limpar banco via Docker
docker-compose exec postgres psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/clean_database.sql

# 3. Recriar estrutura via Docker
docker-compose exec postgres psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/setup_completo.sql
```

#### 2.3 Usando Supabase CLI (se configurado)
```bash
# 1. Reset completo via Supabase CLI
supabase db reset

# 2. Aplicar migrações
supabase db push
```

### Opção 3: Via Interface Web do Supabase

1. Acesse o painel do Supabase
2. Vá em **Database** → **SQL Editor**
3. Cole o conteúdo de `clean_database.sql` e execute
4. Depois cole o conteúdo de `setup_completo.sql` e execute

### Opção 4: Reset via Docker (completo)
```bash
# Parar e remover containers
docker-compose down

# Remover volumes (DADOS PERDIDOS!)
docker-compose down -v

# Recriar tudo do zero
docker-compose up -d

# Aguardar inicialização
sleep 10

# Executar setup
docker-compose exec postgres psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/setup_completo.sql
```

## 📋 O que cada comando faz:

### clean_database.sql:
- ❌ Remove todas as políticas RLS
- ❌ Remove todos os triggers customizados
- ❌ Remove todas as views
- ❌ Remove todas as funções customizadas
- ❌ Remove todas as tabelas e dados
- ❌ Remove tipos customizados

### setup_completo.sql:
- ✅ Recria todas as funções necessárias
- ✅ Recria todas as tabelas com estrutura atualizada
- ✅ Popula dados iniciais (seeds)
- ✅ Configura RLS e permissões
- ✅ Cria triggers e views
- ✅ Configura sistema completo

## ⚠️ AVISOS IMPORTANTES:

1. **BACKUP**: Faça backup dos dados importantes antes de executar
2. **TESTE**: Execute primeiro em ambiente de desenvolvimento
3. **CONFIRMAÇÃO**: Os scripts pedem confirmação antes de executar
4. **DADOS**: Todos os dados serão perdidos permanentemente
5. **ESTRUTURA**: A nova estrutura terá as tabelas básicas separadas (não combo system)

## 🚀 Após o Reset:

O sistema estará configurado com:
- ✅ Tabelas básicas individuais para CRUD
- ✅ Foreign keys funcionando corretamente
- ✅ RLS configurado
- ✅ Dados de exemplo populados
- ✅ Sistema pronto para desenvolvimento

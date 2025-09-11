# Ordem de Execução - ConectaSaude Database Setup

## 📋 Ordem Correta de Execução

### 1. **Limpeza do Banco (se necessário reset total)**
```sql
-- Execute no SQL Editor do Supabase:
clean_supabase_dashboard.sql
```

### 2. **Setup Completo do Sistema**
```sql
-- Execute no SQL Editor do Supabase:
setup_completo.sql
```

### 3. **Testes de Validação**
```sql
-- Execute no SQL Editor do Supabase (opcional):
test_views_fix.sql          -- Testa views básicas
test_veiculos_view.sql      -- Testa view de veículos
test_basic_tables.sql       -- Testa tabelas básicas
```

## ✅ Últimas Correções Aplicadas

### Problema: Coluna `active` não existia
- **Erro**: `column "active" does not exist`
- **Solução**: Views corrigidas para usar `deleted_at IS NULL`

### Problema: Coluna `tipo_id` não existia  
- **Erro**: `column v.tipo_id does not exist`
- **Solução**: View `veiculos_active` corrigida para não fazer JOIN desnecessário

## 🚀 Status Atual
- ✅ Tabelas básicas criadas e funcionais
- ✅ Views corrigidas (active views usam `deleted_at IS NULL`)
- ✅ Scripts de limpeza funcionais
- ✅ Sistema pronto para desenvolvimento dos CRUDs

## 📁 Arquivos Principais
- `setup_completo.sql` - Script principal (3016+ linhas)
- `clean_supabase_dashboard.sql` - Limpeza do banco
- `test_*.sql` - Scripts de validação

O sistema está pronto para usar! 🎉
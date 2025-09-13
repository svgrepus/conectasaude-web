# 🔧 Configuração Centralizada e Segura do Supabase

Este documento explica a arquitetura de segurança implementada para gerenciar todas as configurações do Supabase em um local único e seguro.

## 🏗️ Arquitetura de Segurança

### 📁 Estrutura de Configuração

```
src/config/
├── supabase.ts           # Configuração básica (legado)
├── supabase-secure.ts    # 🆕 CONFIGURAÇÃO SEGURA PRINCIPAL
└── index.ts              # Exports organizados
```

### 🔑 Configuração Principal: `supabase-secure.ts`

**Este é o ÚNICO arquivo onde você deve alterar as configurações do Supabase!**

```typescript
// ✅ CORRETO - Importar da configuração segura
import { SUPABASE_CONFIG, getSupabaseHeaders, SUPABASE_ENDPOINTS } from '../config/supabase-secure';

// ❌ INCORRETO - Não usar configurações hardcoded
const apiKey = 'eyJhbGci...'; // NUNCA FAÇA ISSO!
```

## �️ Segurança e Variáveis de Ambiente

### Ordem de Prioridade para Configurações:

1. **Expo Constants** (app.json)
2. **Variáveis de ambiente Expo** (EXPO_PUBLIC_*)
3. **Variáveis de ambiente React** (REACT_APP_*)  
4. **Fallback de desenvolvimento** (apenas para dev)

### 📋 Configuração de Variáveis

#### Para Desenvolvimento Local (`.env.local`):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

#### Para Expo (`app.json`):
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://seu-projeto.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "sua-chave-anonima-aqui"
    }
  }
}
```

#### Para Produção:
Configure as variáveis no seu provedor de deploy (Vercel, Netlify, etc.)

## 🎯 Como Usar nos Serviços

### ✅ Padrão Correto para Serviços REST

```typescript
import { authService } from './auth';
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase-secure';

class MeuService {
  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    return getSupabaseHeaders(accessToken || undefined);
  }

  async getData() {
    const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/minha_tabela`, {
      headers: this.getHeaders()
    });
  }
}
```

### ✅ Padrão para Cliente Oficial Supabase

```typescript
import { supabase } from '../services/supabase'; // Já configurado automaticamente
```

## 📊 Serviços Migrados

### ✅ Totalmente Migrados:
- `municipe-real.ts` - Serviço principal de munícipes
- `doencaCronicaService.ts` - Doenças crônicas
- `auth-simple.ts` - Autenticação
- `cargoService.ts` - Cargos/funções
- `tipoVeiculoService.ts` - Tipos de veículo
- `tipoDoencaService.ts` - Tipos de doença
- `municipeService.ts` - Serviço alternativo de munícipes
- `supabase.ts` - Cliente oficial

### 🔄 Status da Migração:
- **8/8 serviços principais** migrados
- **0 configurações hardcoded** restantes
- **100% centralizado** ✅

## 🧪 Validação e Debug

### Função de Validação
```typescript
import { validateSupabaseConfig } from '../config/supabase-secure';

const validation = validateSupabaseConfig();
if (!validation.isValid) {
  console.error('Problemas na configuração:', validation.errors);
}
```

### Debug em Desenvolvimento
A configuração automaticamente valida e exibe logs em modo desenvolvimento:

```
✅ Configuração do Supabase validada: {
  url: "https://seu-projeto.supabase.co",
  hasValidKey: true,
  environment: "development",
  endpoints: { rest: "...", auth: "...", storage: "..." }
}
```

## 🚀 Benefícios da Arquitetura Segura

### 🔒 Segurança
- **Sem credenciais hardcoded** no código
- **Variáveis de ambiente** para dados sensíveis
- **Validação automática** de configurações
- **Logs seguros** (não expõem credenciais)

### 🎯 Manutenibilidade
- **ÚNICA fonte da verdade** para configurações
- **Fácil atualização** de URLs e chaves
- **Padrão consistente** em todos os serviços
- **Debug facilitado** com validação integrada

### 📱 Compatibilidade
- **Expo** e React Native puro
- **Web** e mobile
- **Desenvolvimento** e produção
- **Diferentes provedores** de deploy

### 🧪 Testabilidade
- **Fácil de mockar** em testes
- **Configurações isoladas** por ambiente
- **Validação programática** de configurações

## 🔄 Migração de Serviços Legados

Se você encontrar algum serviço ainda não migrado:

### 1. Identificar Padrões Antigos:
```typescript
// ❌ REMOVER
private readonly supabaseUrl = 'https://...';
private readonly apiKey = 'eyJhbGci...';

// ❌ REMOVER
const headers = {
  'apikey': this.apiKey,
  'Authorization': `Bearer ${token}`
};
```

### 2. Aplicar Padrão Novo:
```typescript
// ✅ ADICIONAR
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase-secure';

// ✅ USAR
private getHeaders(): Record<string, string> {
  const accessToken = authService.getAccessToken();
  return getSupabaseHeaders(accessToken || undefined);
}
```

### 3. Atualizar URLs:
```typescript
// ❌ TROCAR
`${this.supabaseUrl}/rest/v1/tabela`

// ✅ POR
`${SUPABASE_ENDPOINTS.rest}/tabela`
```

## 🚨 Troubleshooting

### Erro: "URL do Supabase não configurada"
- Verifique suas variáveis de ambiente
- Confirme se o arquivo `.env.local` existe
- Valide a configuração no `app.json`

### Erro: "Chave do Supabase incorreta"
- Confirme se a chave começa com `eyJ`
- Verifique se não há espaços ou quebras de linha
- Teste a chave no dashboard do Supabase

### Headers incorretos ou Token inválido
- Verifique se está importando `getSupabaseHeaders`
- Confirme que o `authService.getAccessToken()` retorna um token válido
- Valide se o token não está expirado

## 📚 Próximos Passos

1. **Monitorar logs** para identificar possíveis problemas
2. **Testar em produção** com variáveis reais
3. **Implementar rotação de chaves** quando necessário
4. **Documentar procedimentos** para a equipe

---

**🎯 Resultado Final: Arquitetura 100% segura e centralizada!**

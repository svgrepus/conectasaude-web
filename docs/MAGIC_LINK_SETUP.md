# Configuração do Magic Link Template - ConectaSaúde

Este documento descreve como configurar o template de e-mail personalizado para Magic Links no Supabase.

## 📧 Template de E-mail

O template HTML está localizado em: `email-templates/magic-link-email.html`

### Características do Template:
- ✅ Design responsivo
- ✅ Branding da Prefeitura de Jambeiro
- ✅ Cores institucionais (#8A9E8E)
- ✅ Instruções claras para primeiro acesso
- ✅ Informações de segurança
- ✅ Link alternativo para problemas com o botão

## 🔧 Configuração no Supabase Dashboard

### 1. Acessar Configurações de E-mail
1. Acesse o Dashboard do Supabase
2. Vá para **Settings** → **Auth**
3. Clique na aba **Email Templates**

### 2. Configurar Template do Magic Link
1. Selecione **Magic Link** na lista de templates
2. Substitua o conteúdo HTML pelo template personalizado
3. O template usa a variável `{{ .ConfirmationURL }}` que é automaticamente substituída pelo Supabase

### 3. Configurações Adicionais
No painel de Auth, configure também:

#### Rate Limiting:
- **Max emails per hour**: 10 (para prevenir spam)
- **Max emails per minute**: 3

#### Security:
- **Magic Link expiry**: 3600 seconds (1 hora)
- **Redirect URLs**: Adicione as URLs permitidas:
  ```
  http://localhost:8082/auth/callback
  https://seu-dominio.com/auth/callback
  ```

## 🚀 Implementação no Código

### 1. Serviço Magic Link
O serviço está implementado em: `src/services/magicLinkService.ts`

#### Funcionalidades:
- `sendMagicLink()`: Envia magic link personalizado
- `sendMagicLinkForNewAdmin()`: Para novos administradores
- `handleMagicLinkCallback()`: Processa callback após clique
- `updatePasswordFirstAccess()`: Define senha no primeiro acesso

### 2. Telas de Interface

#### SetPasswordScreen (`src/screens/auth/SetPasswordScreen.tsx`):
- Tela para definir senha no primeiro acesso
- Validação de requisitos de senha
- Interface amigável com feedback visual

#### MagicLinkCallbackScreen (`src/screens/auth/MagicLinkCallbackScreen.tsx`):
- Processa callback do magic link
- Detecta primeiro acesso
- Redireciona para definição de senha se necessário

### 3. Integração com Sistema de Administradores

Para enviar magic link ao criar novo administrador:

```typescript
import { magicLinkService } from '../services/magicLinkService';

// Enviar magic link para novo admin
const result = await magicLinkService.sendMagicLinkForNewAdmin(
  email,
  fullName
);

if (result.success) {
  Alert.alert("Sucesso", result.message);
}
```

## 🔀 Fluxo de Primeiro Acesso

1. **Administrador cria usuário** → Sistema envia magic link
2. **Usuário recebe e-mail** → Clica no botão/link
3. **Sistema detecta primeiro acesso** → Redireciona para definir senha
4. **Usuário define senha** → Sistema atualiza e faz login
5. **Redirecionamento** → Usuário acessa sistema normalmente

## 📱 URLs de Callback

### Desenvolvimento:
```
http://localhost:8082/auth/callback
http://localhost:8082/auth/callback?first_access=true
```

### Produção:
```
https://conectasaude.jambeiro.sp.gov.br/auth/callback
https://conectasaude.jambeiro.sp.gov.br/auth/callback?first_access=true
```

## 🎨 Personalização do Template

### Cores Institucionais:
- **Verde Principal**: `#8A9E8E`
- **Verde Escuro**: `#6B7F6B`
- **Texto Escuro**: `#2c3e50`
- **Texto Secundário**: `#555555`

### Elementos Personalizáveis:
- Logo/Ícone no cabeçalho
- Cores do gradiente
- Texto de boas-vindas
- Informações de contato
- Links institucionais

### Variáveis Disponíveis:
- `{{ .ConfirmationURL }}`: URL do magic link
- `{{ .Email }}`: E-mail do usuário (se disponível)
- `{{ .SiteName }}`: Nome do site configurado

## 🔐 Segurança

### Boas Práticas Implementadas:
- ✅ Link expira em 1 hora
- ✅ Uso único do link
- ✅ Validação de domínios permitidos
- ✅ Rate limiting de e-mails
- ✅ HTTPS obrigatório em produção
- ✅ Validação forte de senha

### Configurações Recomendadas:
```json
{
  "SECURITY_CAPTCHA_ENABLED": false,
  "SECURITY_CAPTCHA_PROVIDER": "hcaptcha",
  "RATE_LIMIT_EMAIL_SENT": 10,
  "RATE_LIMIT_SMS_SENT": 10,
  "MAILER_AUTOCONFIRM": false,
  "EXTERNAL_EMAIL_ENABLED": true
}
```

## 📝 Exemplo de E-mail Enviado

O usuário receberá um e-mail com:
- ✅ Cabeçalho com logo ConectaSaúde
- ✅ Mensagem personalizada de boas-vindas
- ✅ Botão destacado "Acessar ConectaSaúde"
- ✅ Instruções para primeiro acesso
- ✅ Informações de segurança
- ✅ Link alternativo em texto
- ✅ Rodapé institucional

## 🚀 Deploy e Testes

### Para testar o template:
1. Configure o template no Dashboard
2. Use `magicLinkService.sendMagicLink()` no código
3. Verifique o e-mail recebido
4. Teste o fluxo completo de primeiro acesso

### Monitoramento:
- Verifique logs do Supabase Auth
- Monitore taxa de entrega de e-mails
- Acompanhe conversões de primeiro acesso
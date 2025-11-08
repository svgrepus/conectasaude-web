# Como Usar o Sistema de Redefinição de Senha

## Fluxo Completo

### 1. Tela de Login
- O usuário clica em "Esqueceu sua senha?"
- Abre a `ForgotPasswordScreen`

### 2. Tela "Esqueci Minha Senha"
- Usuário insere seu email
- Sistema chama `authService.resetPassword(email)`
- Email é enviado com template `reset-password.html`

### 3. Email Recebido
- Usuário recebe email com botão "Redefinir Senha"
- Botão redireciona para: `${window.location.origin}/reset-password?access_token=TOKEN&type=recovery`

### 4. Detecção Automática
- `LoginScreen` detecta os parâmetros na URL
- Automaticamente abre `ResetPasswordScreen` com o token

### 5. Tela de Nova Senha
- Usuário cria nova senha (com validações)
- Sistema chama `authService.updatePassword(novaSenha, token)`
- Endpoint: `POST https://<PROJECT>.supabase.co/auth/v1/user`

### 6. Tela de Sucesso  
- Mostra `ResetPasswordSuccessScreen`
- Usuário clica "FAZER LOGIN"
- Retorna para tela de login

## Configuração do Email Template

O email `reset-password.html` usa a variável `{{ .ResetURL }}` que deve ser configurada no Supabase para:

```
https://seudominio.com/login?access_token={{.token}}&type=recovery
```

## Endpoints Utilizados

### Solicitar Reset
```bash
POST https://<PROJECT>.supabase.co/auth/v1/recover
{
  "email": "usuario@email.com",
  "redirect_to": "https://seuapp.com/login"
}
```

### Atualizar Senha
```bash  
PUT https://<PROJECT>.supabase.co/auth/v1/user
Authorization: Bearer <access_token>
{
  "password": "novaSenha123!"
}
```

## Validações Implementadas

### Email (Forgot Password)
- Email obrigatório
- Formato de email válido

### Nova Senha (Reset Password)
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula  
- Pelo menos 1 número
- Confirmação de senha deve coincidir

## Estados do Sistema

```typescript
const [showForgotPassword, setShowForgotPassword] = useState(false);
const [showResetPassword, setShowResetPassword] = useState(false);
const [showResetSuccess, setShowResetSuccess] = useState(false);
const [resetToken, setResetToken] = useState<string>();
```

## Componentes Criados

1. **ResetPasswordScreen.tsx** - Tela de criar nova senha
2. **ResetPasswordSuccessScreen.tsx** - Tela de confirmação de sucesso
3. **Método updatePassword** - Adicionado em `auth-simple.ts`

## Segurança

- Token de reset é enviado via URL segura
- Token expira em 1 hora (configurável no Supabase)
- Senha é validada antes do envio
- Token é limpo da URL após uso
- Sessão é mantida após reset de senha
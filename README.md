# ConectaSaúde - Frontend React Native

Sistema de gestão municipal de saúde com frontend React Native para plataformas web e mobile.

## 🚀 Tecnologias

- **React Native** com TypeScript
- **Expo** para desenvolvimento multiplataforma
- **Supabase** para backend e autenticação
- **React Navigation v6** para navegação
- **React Native Paper** para componentes UI
- **TanStack Query** para gerenciamento de estado do servidor
- **React Hook Form** para formulários

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS - apenas macOS)

## 🔧 Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações do Supabase:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Iniciar o servidor de desenvolvimento:**
```bash
npm start
```

## 📱 Executando em diferentes plataformas

### Web
```bash
npm run web
```

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── common/         # Componentes básicos (Button, Input, etc.)
│   ├── forms/          # Componentes de formulário
│   └── ui/             # Componentes de interface específicos
├── screens/            # Telas da aplicação
│   ├── auth/          # Telas de autenticação
│   ├── consultas/     # Telas de consultas
│   ├── exames/        # Telas de exames
│   ├── medicamentos/  # Telas de medicamentos
│   └── profile/       # Telas de perfil
├── navigation/         # Configuração de navegação
├── services/          # Serviços de API (Supabase)
├── hooks/             # Hooks customizados
├── types/             # Definições de tipos TypeScript
├── utils/             # Funções utilitárias
└── constants/         # Constantes e configurações
```

## 🔐 Autenticação

O sistema utiliza autenticação baseada em Supabase com três tipos de usuário:

- **Munícipe**: Cidadão comum
- **Funcionário**: Profissional de saúde
- **Admin**: Administrador do sistema

## 🎨 Temas

O aplicativo suporta temas claro e escuro, seguindo as preferências do sistema operacional.

## 📊 Funcionalidades Principais

### Para Munícipes
- Cadastro e login
- Agendamento de consultas
- Visualização de exames
- Receitas médicas
- Histórico médico

### Para Funcionários
- Gestão de consultas
- Solicitação de exames
- Prescrição de medicamentos
- Cadastro de pacientes

### Para Administradores
- Gestão completa de usuários
- Relatórios e dashboards
- Configuração do sistema
- Gestão de estoque de medicamentos

## 🧪 Testes

```bash
# Executar testes unitários
npm test

# Executar testes com watch mode
npm run test:watch

# Verificar cobertura de testes
npm run test:coverage
```

## 📦 Build e Deploy

### Build para produção
```bash
# Web
npm run build:web

# Android APK
expo build:android

# iOS
expo build:ios
```

### Deploy
O projeto está configurado para deploy via Expo Application Services (EAS).

```bash
# Configurar EAS
npm install -g eas-cli
eas login
eas build:configure

# Build para produção
eas build --platform all
```

## 🔧 Configuração do Supabase

### 1. Criar projeto no Supabase
1. Acesse https://supabase.com
2. Crie um novo projeto
3. Configure as tabelas usando os scripts SQL em `../sql/migrations/`

### 2. Configurar RLS (Row Level Security)
As políticas de segurança estão definidas nos arquivos de migração.

### 3. Configurar Storage
Para upload de fotos, configure o bucket 'fotos' no Supabase Storage.

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia o servidor Expo
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run web` - Executa na web
- `npm run build:web` - Build para web
- `npm test` - Executa testes
- `npm run lint` - Verifica código com ESLint
- `npm run lint:fix` - Corrige problemas do ESLint
- `npm run type-check` - Verifica tipos TypeScript

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@conectasaude.gov.br
- Documentação: [Link para documentação completa]

## 🔄 Atualizações

Para manter o projeto atualizado:

```bash
# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated

# Atualizar Expo SDK
expo install --fix
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de instalação de dependências**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Problemas com cache do Expo**
   ```bash
   expo start --clear
   ```

3. **Problemas com TypeScript**
   ```bash
   npm run type-check
   ```

### Logs e Debug

Para habilitar logs detalhados:
```bash
DEBUG=expo:* npm start
```

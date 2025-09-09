# 📖 Documentação da API - ConectaSaúde

Esta pasta contém a documentação completa da API do sistema ConectaSaúde.

## 🚀 Como Visualizar a Documentação

### Opção 1: Servidor Local (Recomendado)
1. Certifique-se que o Deno está instalado
2. Execute no terminal:
   ```bash
   deno run --allow-net --allow-read serve-docs.ts
   ```
3. Acesse: http://localhost:3000/docs/api/

### Opção 2: Online
- Copie o conteúdo de `upload_municipe_foto_swagger.yaml`
- Cole em: https://editor.swagger.io/

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `upload_municipe_foto_swagger.yaml` | Especificação OpenAPI 3.0 completa |
| `index.html` | Interface Swagger UI para visualização |
| `exemplos_uso.md` | Exemplos práticos de uso da API |
| `README.md` | Este arquivo |

## 🔧 APIs Documentadas

### Upload de Foto do Munícipe
- **Endpoint:** `POST /`
- **Descrição:** Upload de fotos de munícipes para o Supabase Storage
- **Autenticação:** Bearer Token (JWT)
- **Formatos:** JPG, JPEG, PNG
- **Limite:** 5MB por arquivo

## 🛠️ Recursos da Documentação

### ✅ Funcionalidades Implementadas
- [x] Especificação OpenAPI 3.0 completa
- [x] Interface Swagger UI responsiva
- [x] Exemplos de requisições e respostas
- [x] Documentação de códigos de erro
- [x] Esquemas de autenticação
- [x] Validações e limitações
- [x] Exemplos práticos em PowerShell e JavaScript

### 📋 Informações Detalhadas
- Parâmetros de entrada com validações
- Códigos de status HTTP com exemplos
- Estruturas de resposta completas
- Mensagens de erro padronizadas
- Headers CORS configurados
- Esquemas de segurança JWT

## 🔍 Como Testar

1. **Inicie a Edge Function:**
   ```bash
   cd functions/upload_municipe_foto
   deno run --allow-all index.ts
   ```

2. **Inicie a documentação:**
   ```bash
   deno run --allow-net --allow-read serve-docs.ts
   ```

3. **Acesse a documentação:**
   - http://localhost:3000/docs/api/

4. **Use o "Try it out" na interface Swagger**

## 📝 Exemplos Rápidos

### Teste CORS
```bash
curl -X OPTIONS http://localhost:8000
```

### Upload Básico
```bash
curl -X POST http://localhost:8000 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "municipe_id": 123,
    "file_data": "data:image/jpeg;base64,/9j/4AAQ...",
    "file_name": "foto.jpg",
    "content_type": "image/jpeg"
  }'
```

## 🔄 Atualizações

Para adicionar novas APIs:
1. Edite `upload_municipe_foto_swagger.yaml`
2. Adicione novos endpoints na seção `paths`
3. Documente esquemas em `components/schemas`
4. Atualize exemplos se necessário

## 💡 Dicas

- Use o validador online: https://validator.swagger.io/
- Mantenha exemplos atualizados com dados reais
- Documente todos os códigos de erro possíveis
- Inclua exemplos para diferentes cenários de uso

## 🔗 Links Úteis

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/docs/open-source-tools/swagger-ui/)
- [Deno HTTP Server](https://deno.land/std/http/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

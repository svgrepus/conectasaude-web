# Exemplos de Uso da API - Upload Foto Munícipe

## Teste com cURL (PowerShell)

### 1. Teste CORS Preflight
```powershell
Invoke-WebRequest -Uri "http://localhost:8000" -Method OPTIONS
```

### 2. Upload de Foto (exemplo com dados mock)
```powershell
$headers = @{
    "Authorization" = "Bearer SEU_TOKEN_AQUI"
    "Content-Type" = "application/json"
}

$body = @{
    municipe_id = 123
    file_data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    file_name = "teste.jpg"
    content_type = "image/jpeg"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000" -Method POST -Body $body -Headers $headers
```

### 3. Exemplo com arquivo real (PowerShell)
```powershell
# Ler arquivo e converter para base64
$filePath = "C:\caminho\para\sua\foto.jpg"
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$base64String = [System.Convert]::ToBase64String($fileBytes)

$headers = @{
    "Authorization" = "Bearer SEU_TOKEN_AQUI"
    "Content-Type" = "application/json"
}

$body = @{
    municipe_id = 123
    file_data = "data:image/jpeg;base64,$base64String"
    file_name = "foto_municipe.jpg"
    content_type = "image/jpeg"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000" -Method POST -Body $body -Headers $headers
```

## Teste com JavaScript/Fetch

### Upload de foto com JavaScript
```javascript
async function uploadFotoMunicipe(municipeId, file) {
    // Converter arquivo para base64
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    try {
        const base64 = await toBase64(file);
        
        const response = await fetch('http://localhost:8000', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer SEU_TOKEN_AQUI',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                municipe_id: municipeId,
                file_data: base64,
                file_name: file.name,
                content_type: file.type
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Upload realizado com sucesso:', result);
        return result;

    } catch (error) {
        console.error('Erro no upload:', error);
        throw error;
    }
}

// Uso
const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];
uploadFotoMunicipe(123, file);
```

## Validações Implementadas

### Tipos de arquivo aceitos:
- ✅ `image/jpeg`
- ✅ `image/jpg` 
- ✅ `image/png`

### Extensões aceitas:
- ✅ `.jpg`
- ✅ `.jpeg`
- ✅ `.png`

### Limites:
- 📏 **Tamanho máximo:** 5MB por arquivo
- 🔒 **Autenticação:** Token Bearer obrigatório
- 👤 **Munícipe:** Deve existir e estar ativo

## Estrutura de Resposta

### Sucesso (200)
```json
{
    "success": true,
    "message": "Foto do munícipe carregada com sucesso.",
    "foto_url": "https://your-project.supabase.co/storage/v1/object/sign/municipes-fotos/123/2024-01-15T10-30-00-000Z_abc123.jpg?token=...",
    "signed_url": "https://your-project.supabase.co/storage/v1/object/sign/municipes-fotos/123/2024-01-15T10-30-00-000Z_abc123.jpg?token=...",
    "file_path": "123/2024-01-15T10-30-00-000Z_abc123.jpg"
}
```

### Erro (400/401/404/500)
```json
{
    "success": false,
    "error": "Descrição do erro"
}
```

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Upload realizado com sucesso |
| 400 | Erro de validação (dados inválidos, arquivo muito grande, etc.) |
| 401 | Token de autorização ausente ou inválido |
| 404 | Munícipe não encontrado ou inativo |
| 405 | Método HTTP não permitido (use POST) |
| 500 | Erro interno do servidor |

## Variáveis de Ambiente Necessárias

No ambiente de produção (Supabase Edge Functions), certifique-se de que as seguintes variáveis estão configuradas:

- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase

## Estrutura do Storage

Os arquivos são organizados da seguinte forma no bucket `municipes-fotos`:

```
municipes-fotos/
├── 123/
│   ├── 2024-01-15T10-30-00-000Z_abc123.jpg
│   └── 2024-01-15T11-45-30-000Z_def456.png
├── 124/
│   └── 2024-01-15T09-15-20-000Z_ghi789.jpg
└── ...
```

Onde:
- `123`, `124` = ID do munícipe
- `2024-01-15T10-30-00-000Z` = Timestamp da data/hora do upload
- `abc123` = UUID único gerado automaticamente
- `.jpg`, `.png` = Extensão original do arquivo

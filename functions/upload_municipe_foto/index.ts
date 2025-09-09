// Edge Function para Upload de Foto do Munícipe
// Versão simplificada e funcional para Deno

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Função principal
async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Método não permitido. Use POST.' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token de autorização necessário.' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obter variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase não encontrada')
    }

    // Parse do body da requisição
    let requestData: any
    try {
      requestData = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados da requisição inválidos.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar dados obrigatórios
    if (!requestData.municipe_id || !requestData.file_data || !requestData.file_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Parâmetros obrigatórios: municipe_id, file_data, file_name.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se o munícipe existe
    const municipeResponse = await fetch(`${supabaseUrl}/rest/v1/municipes_active?select=id,nome_completo&id=eq.${requestData.municipe_id}`, {
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseKey
      }
    })

    if (!municipeResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao verificar munícipe.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const municipes = await municipeResponse.json()
    if (!municipes || municipes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Munícipe não encontrado ou inativo.' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const contentType = requestData.content_type?.toLowerCase() || ''
    
    if (!allowedTypes.includes(contentType)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Tipo de arquivo não permitido. Use apenas JPG, JPEG ou PNG.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar extensão do arquivo
    const fileName = requestData.file_name.toLowerCase()
    const allowedExtensions = ['.jpg', '.jpeg', '.png']
    const hasValidExtension = allowedExtensions.some((ext: string) => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Extensão de arquivo não permitida. Use apenas .jpg, .jpeg ou .png.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Decodificar arquivo base64
    let fileBuffer: Uint8Array
    try {
      const base64Data = requestData.file_data.replace(/^data:image\/[a-z]+;base64,/, '')
      
      // Verificar se é uma string base64 válida
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
        throw new Error('String base64 inválida')
      }
      
      const binaryString = atob(base64Data)
      fileBuffer = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        fileBuffer[i] = binaryString.charCodeAt(i)
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados do arquivo em base64 inválidos.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSizeBytes = 5 * 1024 * 1024 // 5MB
    if (fileBuffer.length > maxSizeBytes) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Arquivo muito grande. Tamanho máximo: 5MB. Tamanho atual: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB.` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Gerar nome único para o arquivo
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const randomId = crypto.randomUUID()
    const uniqueFileName = `${requestData.municipe_id}/${timestamp}_${randomId}${fileExtension}`

    // Upload para o bucket usando FormData
    const formData = new FormData()
    const arrayBuffer = new ArrayBuffer(fileBuffer.length)
    const uint8View = new Uint8Array(arrayBuffer)
    uint8View.set(fileBuffer)
    const blob = new Blob([arrayBuffer], { type: contentType })
    formData.append('file', blob, uniqueFileName)

    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/municipes-fotos/${uniqueFileName}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseKey
      },
      body: formData
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Erro no upload:', errorText)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao fazer upload do arquivo.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Gerar URL assinada válida por 1 ano
    const signedUrlResponse = await fetch(`${supabaseUrl}/storage/v1/object/sign/municipes-fotos/${uniqueFileName}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expiresIn: 365 * 24 * 60 * 60 }) // 1 ano em segundos
    })

    if (!signedUrlResponse.ok) {
      console.error('Erro ao gerar URL assinada:', await signedUrlResponse.text())
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao gerar URL da foto.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const signedUrlData = await signedUrlResponse.json()
    const fullSignedUrl = `${supabaseUrl}/storage/v1${signedUrlData.signedURL}`

    // Atualizar registro do munícipe com a URL da foto
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/municipes?id=eq.${requestData.municipe_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ foto_url: fullSignedUrl })
    })

    if (!updateResponse.ok) {
      console.error('Erro ao atualizar munícipe:', await updateResponse.text())
      
      // Tentar remover o arquivo carregado em caso de erro
      await fetch(`${supabaseUrl}/storage/v1/object/municipes-fotos/${uniqueFileName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
          'apikey': supabaseKey
        }
      })
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao atualizar dados do munícipe.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Resposta de sucesso
    const response = {
      success: true,
      message: 'Foto do munícipe carregada com sucesso.',
      foto_url: fullSignedUrl,
      signed_url: fullSignedUrl,
      file_path: uniqueFileName
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro inesperado:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

// Servir a função
Deno.serve(handler)

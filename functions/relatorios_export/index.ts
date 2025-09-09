import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'supabase'

interface RelatorioDados {
  [key: string]: any
}

interface RelatorioRequest {
  tipo: 'estoque_atual' | 'alerta_minimo' | 'medicamentos_vencendo' | 'estoque_periodo' | 'dashboard_executivo'
  formato: 'csv' | 'json'
  filtros?: {
    unidade_id?: string
    medicamento_id?: string
    data_inicio?: string
    data_fim?: string
    dias_vencimento?: number
  }
}

serve(async (req: Request): Promise<Response> => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

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

    // Inicializar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não autenticado.' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar permissões do usuário
    const userRole = user.user_metadata?.role || 'consulta'
    if (!['admin', 'operador', 'consulta'].includes(userRole)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não tem permissão para gerar relatórios.' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse do body da requisição
    let requestData: RelatorioRequest
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

    // Validar tipo de relatório
    const tiposValidos = ['estoque_atual', 'alerta_minimo', 'medicamentos_vencendo', 'estoque_periodo', 'dashboard_executivo']
    if (!tiposValidos.includes(requestData.tipo)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Tipo de relatório inválido. Tipos válidos: ${tiposValidos.join(', ')}.` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar formato
    if (!['csv', 'json'].includes(requestData.formato)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Formato inválido. Use "csv" ou "json".' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let dados: RelatorioDados[] = []
    let nomeArquivo = ''

    // Executar consulta baseada no tipo de relatório
    switch (requestData.tipo) {
      case 'estoque_atual':
        const { data: estoqueAtual, error: estoqueError } = await supabase
          .from('vw_estoque_atual')
          .select('*')
          .order('dcb_dci')
        
        if (estoqueError) {
          throw new Error(`Erro ao consultar estoque atual: ${estoqueError.message}`)
        }
        dados = estoqueAtual || []
        nomeArquivo = 'estoque_atual'
        break

      case 'alerta_minimo':
        const { data: alertaMinimo, error: alertaError } = await supabase
          .from('vw_alerta_minimo_atingido')
          .select('*')
          .order('nivel_prioridade, percentual_minimo')
        
        if (alertaError) {
          throw new Error(`Erro ao consultar alertas de mínimo: ${alertaError.message}`)
        }
        dados = alertaMinimo || []
        nomeArquivo = 'alerta_minimo_atingido'
        break

      case 'medicamentos_vencendo':
        const diasVencimento = requestData.filtros?.dias_vencimento || 60
        const { data: vencendo, error: vencendoError } = await supabase
          .rpc('vw_medicamentos_vencendo_em', { dias: diasVencimento })
        
        if (vencendoError) {
          throw new Error(`Erro ao consultar medicamentos vencendo: ${vencendoError.message}`)
        }
        dados = vencendo || []
        nomeArquivo = `medicamentos_vencendo_${diasVencimento}_dias`
        break

      case 'estoque_periodo':
        const { filtros } = requestData
        if (!filtros?.data_inicio || !filtros?.data_fim) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Para relatório por período, data_inicio e data_fim são obrigatórios.' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { data: periodo, error: periodoError } = await supabase
          .rpc('vw_estoque_por_periodo', {
            data_inicio: filtros.data_inicio,
            data_fim: filtros.data_fim,
            unidade_filtro: filtros.unidade_id || null
          })
        
        if (periodoError) {
          throw new Error(`Erro ao consultar estoque por período: ${periodoError.message}`)
        }
        dados = periodo || []
        nomeArquivo = `estoque_periodo_${filtros.data_inicio}_${filtros.data_fim}`
        break

      case 'dashboard_executivo':
        const { data: dashboard, error: dashboardError } = await supabase
          .from('vw_dashboard_executivo')
          .select('*')
          .single()
        
        if (dashboardError) {
          throw new Error(`Erro ao consultar dashboard executivo: ${dashboardError.message}`)
        }
        dados = dashboard ? [dashboard] : []
        nomeArquivo = 'dashboard_executivo'
        break
    }

    // Aplicar filtros adicionais se necessário
    if (requestData.filtros) {
      if (requestData.filtros.unidade_id && requestData.tipo !== 'estoque_periodo') {
        dados = dados.filter(item => 
          item.unidade_id === requestData.filtros!.unidade_id
        )
      }
      if (requestData.filtros.medicamento_id) {
        dados = dados.filter(item => 
          item.medicamento_id === requestData.filtros!.medicamento_id
        )
      }
    }

    // Gerar resposta baseada no formato
    if (requestData.formato === 'json') {
      return new Response(
        JSON.stringify({
          success: true,
          tipo_relatorio: requestData.tipo,
          total_registros: dados.length,
          dados: dados,
          gerado_em: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${nomeArquivo}.json"`
          } 
        }
      )
    } else {
      // Formato CSV
      let csvContent = ''
      
      if (dados.length > 0) {
        // Cabeçalho
        const headers = Object.keys(dados[0])
        csvContent = headers.map(header => `"${header}"`).join(',') + '\n'
        
        // Dados
        for (const item of dados) {
          const row = headers.map(header => {
            const value = item[header]
            if (value === null || value === undefined) {
              return '""'
            }
            // Escapar aspas duplas e envolver em aspas
            return `"${String(value).replace(/"/g, '""')}"`
          }).join(',')
          csvContent += row + '\n'
        }
      } else {
        csvContent = 'Nenhum dado encontrado para o relatório solicitado.\n'
      }

      return new Response(
        csvContent,
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${nomeArquivo}.csv"`
          } 
        }
      )
    }

  } catch (error) {
    console.error('Erro inesperado:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor.',
        detalhes: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

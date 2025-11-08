import { supabase } from './supabase';
import { authService } from './auth-simple';
import { SUPABASE_CONFIG } from '../config/supabase';

export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  placa: string;
  capacidade_passageiros: number;
  tipo_combustivel: 'GASOLINA' | 'ALCOOL' | 'DIESEL' | 'FLEX' | 'ELETRICO';
  autonomia_combustivel: number;
  situacao: 'ATIVO' | 'INATIVO';
  tipo_veiculo: string | null;
  tipo_veiculo_nome: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VeiculoGasto {
  id: string;
  veiculo_id: string;
  data_gasto: string;
  descricao: string;
  fornecedor: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  forma_pagamento: 'CARTAO' | 'BOLETO' | 'PIX' | 'TRANSFERENCIA' | 'DINHEIRO' | 'DEBITO';
  responsavel_email: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface VeiculoFormData {
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  placa: string;
  capacidade_passageiros: number;
  tipo_combustivel: 'GASOLINA' | 'ALCOOL' | 'DIESEL' | 'FLEX' | 'ELETRICO';
  autonomia_combustivel?: number;
  situacao: 'ATIVO' | 'INATIVO';
  tipo_veiculo?: string;
  observacoes?: string;
}

export interface GastoFormData {
  veiculo_id: string;
  data_gasto: string;
  descricao: string;
  fornecedor: string;
  quantidade: number;
  valor_unitario: number;
  forma_pagamento: 'CARTAO' | 'BOLETO' | 'PIX' | 'TRANSFERENCIA' | 'DINHEIRO' | 'DEBITO';
  observacoes?: string;
}

export interface VeiculoFiltros {
  id?: string;
  marca?: string;
  modelo?: string;
  placa?: string;
  situacao?: 'ATIVO' | 'INATIVO';
  limit?: number;
  offset?: number;
}

export interface GastosFiltros {
  veiculo_id: string;
  data_inicio?: string;
  data_fim?: string;
  fornecedor?: string;
  forma_pagamento?: string;
  valor_min?: number;
  valor_max?: number;
  limit?: number;
  offset?: number;
}

export interface GastosResponse {
  success: boolean;
  data?: VeiculoGasto[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  summary?: {
    total_periodo: number;
    total_geral: number;
    data_inicio?: string;
    data_fim?: string;
  };
  error?: string;
  message?: string;
  gasto_id?: string;
  executed_by?: string;
}

export interface VeiculoResponse {
  success: boolean;
  data?: Veiculo[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  error?: string;
  message?: string;
  veiculo_id?: string;
  executed_by?: string;
}

// Opções para tipos de combustível
export const TIPOS_COMBUSTIVEL = [
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'ALCOOL', label: 'Álcool' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'FLEX', label: 'Flex' },
  { value: 'ELETRICO', label: 'Elétrico' }
] as const;

// Opções para situação do veículo
export const SITUACOES_VEICULO = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' }
] as const;

// Opções para tipo de veículo
export const TIPOS_VEICULO = [
  { value: 'carro_passeio', label: 'Carro de Passeio' },
  { value: 'van', label: 'Van' },
  { value: 'ambulancia', label: 'Ambulância' },
  { value: 'Ônibus', label: 'Ônibus' },
  { value: 'caminhao', label: 'Caminhão' },
  { value: 'motocicleta', label: 'Motocicleta' },
  { value: 'outro', label: 'Outro' }
] as const;

// Opções para formas de pagamento
export const FORMAS_PAGAMENTO = [
  { value: 'CARTAO', label: 'Cartão' },
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'PIX', label: 'PIX' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'DEBITO', label: 'Débito' }
] as const;

class VeiculosService {
  
  // Criar veículo completo
  async criar(dados: VeiculoFormData): Promise<VeiculoResponse> {
    try {
      console.log('🚗 Criando veículo via RPC:', dados);
      
      // Usar RPC para criar veículo completo
      const { data, error } = await supabase
        .rpc('rpc_criar_veiculo_completo', {
          p_marca: dados.marca,
          p_modelo: dados.modelo,
          p_ano_fabricacao: dados.ano_fabricacao,
          p_placa: dados.placa,
          p_capacidade_passageiros: dados.capacidade_passageiros,
          p_tipo_combustivel: dados.tipo_combustivel,
          p_autonomia_combustivel: dados.autonomia_combustivel || null,
          p_situacao: dados.situacao,
          p_tipo_veiculo: dados.tipo_veiculo || null,
          p_observacoes: dados.observacoes || null
        });

      if (error) {
        console.error('❌ Erro ao criar veículo:', error);
        return {
          success: false,
          error: error.message || 'Erro ao criar veículo'
        };
      }

      console.log('📦 Resposta RPC criar veículo:', data);
      
      // Verificar se a RPC retornou erro de negócio
      if (data && typeof data === 'object' && data.success === false) {
        console.error('❌ Erro de negócio ao criar veículo:', data.error);
        return {
          success: false,
          error: data.error || 'Erro ao criar veículo'
        };
      }

      console.log('✅ Veículo criado com sucesso:', data);
      return {
        success: true,
        message: 'Veículo criado com sucesso',
        veiculo_id: data?.id || data?.veiculo_id
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosService.criar:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao criar veículo'
      };
    }
  }

  // Buscar veículos com filtros
  async buscar(filtros: VeiculoFiltros = {}): Promise<VeiculoResponse> {
    try {
      console.log('🔍 Buscando veículos via RPC com filtros:', filtros);
      
      // Usar fetch direto para o endpoint RPC
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/rpc_buscar_veiculos`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({
          p_veiculo_id: filtros.id || null,
          p_marca: filtros.marca || null,
          p_modelo: filtros.modelo || null,  
          p_placa: filtros.placa || null,
          p_situacao: filtros.situacao || null,
          p_limit: filtros.limit || 50,
          p_offset: filtros.offset || 0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP ao buscar veículos:', response.status, errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`
        };
      }

      const responseData = await response.json();
      console.log('📦 Resposta RPC recebida:', responseData);
      
      // Verificar se a resposta tem o formato esperado { success: true, data: [], pagination: {} }
      if (responseData && responseData.success && Array.isArray(responseData.data)) {
        console.log('✅ Veículos encontrados via RPC:', responseData.data.length);
        return {
          success: true,
          data: responseData.data,
          pagination: responseData.pagination || {
            total: responseData.data.length,
            limit: filtros.limit || 50,
            offset: filtros.offset || 0,
            has_more: false
          }
        };
      }
      
      // Fallback se a resposta não tem success/data (resposta direta do array)
      if (Array.isArray(responseData)) {
        console.log('✅ Veículos encontrados (formato direto):', responseData.length);
        return {
          success: true,
          data: responseData,
          pagination: {
            total: responseData.length,
            limit: filtros.limit || 50,
            offset: filtros.offset || 0,
            has_more: responseData.length >= (filtros.limit || 50)
          }
        };
      }
      
      // Se chegou até aqui, algo deu errado
      console.error('❌ Formato de resposta inesperado:', responseData);
      return {
        success: false,
        error: 'Formato de resposta inválido do servidor',
        data: []
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosService.buscar:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao buscar veículos',
        data: []
      };
    }
  }

  // Buscar veículo por ID
  async buscarPorId(id: string): Promise<VeiculoResponse> {
    try {
      console.log('🔍 Buscando veículo por ID:', id);
      
      // Usar a mesma RPC de busca com filtro por ID
      const response = await this.buscar({ id, limit: 1, offset: 0 });
      
      if (!response.success) {
        return response;
      }

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: 'Veículo não encontrado'
        };
      }

      console.log('✅ Veículo encontrado:', response.data[0].placa);
      return {
        success: true,
        data: response.data
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosService.buscarPorId:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao buscar veículo'
      };
    }
  }

  // Listar todos os veículos (método simplificado)
  async listarVeiculos(): Promise<Veiculo[]> {
    try {
      console.log('📋 Listando todos os veículos');
      
      const { data, error } = await supabase
        .from('veiculos_active')
        .select(`
          id,
          marca,
          modelo,
          ano_fabricacao,
          placa,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao listar veículos:', error);
        return [];
      }

      console.log('✅ Veículos listados:', data?.length || 0);
      return (data || []) as Veiculo[];
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosService.listarVeiculos:', error);
      return [];
    }
  }

  // Atualizar veículo
  async atualizar(id: string, dados: VeiculoFormData): Promise<VeiculoResponse> {
    try {
      console.log('🔄 Atualizando veículo via RPC:', id, dados);
      
      // Como não temos RPC de atualização específica, vamos usar update direto na tabela
      const { data, error } = await supabase
        .from('veiculos')
        .update({
          marca: dados.marca,
          modelo: dados.modelo,
          ano_fabricacao: dados.ano_fabricacao,
          placa: dados.placa,
          capacidade_passageiros: dados.capacidade_passageiros,
          tipo_combustivel: dados.tipo_combustivel,
          autonomia_combustivel: dados.autonomia_combustivel || null,
          situacao: dados.situacao,
          tipo_veiculo: dados.tipo_veiculo || null,
          observacoes: dados.observacoes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar veículo:', error);
        return {
          success: false,
          error: error.message || 'Erro ao atualizar veículo'
        };
      }

      console.log('✅ Veículo atualizado com sucesso:', data);
      return {
        success: true,
        data: [data],
        message: 'Veículo atualizado com sucesso'
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosService.atualizar:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao atualizar veículo'
      };
    }
  }

  // Excluir veículo (soft delete)
  async excluir(id: string, motivo: string = 'Exclusão via aplicativo'): Promise<VeiculoResponse> {
    try {
      console.log('🗑️ Excluindo veículo via RPC:', id);
      
      // Usar RPC para soft delete
      const { data, error } = await supabase
        .rpc('rpc_soft_delete_record', {
          p_table_name: 'veiculos',
          p_record_id: id,
          p_motivo: motivo
        });

      if (error) {
        console.error('❌ Erro ao excluir veículo:', error);
        return {
          success: false,
          error: error.message || 'Erro ao excluir veículo'
        };
      }

      console.log('✅ Veículo excluído com sucesso via RPC');
      return {
        success: true,
        message: 'Veículo excluído com sucesso'
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosService.excluir:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao excluir veículo'
      };
    }
  }

  // Validações auxiliares
  validarPlaca(placa: string): boolean {
    const placaLimpa = placa.replace(/[^A-Z0-9]/g, '');
    // Formato padrão brasileiro: ABC1234 ou ABC-1234
    // Formato Mercosul: ABC1A23
    return /^[A-Z]{3}[0-9]{4}$/.test(placaLimpa) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placaLimpa);
  }

  validarAno(ano: number): boolean {
    const anoAtual = new Date().getFullYear();
    return ano >= 1980 && ano <= anoAtual;
  }

  formatarPlaca(placa: string): string {
    const placaLimpa = placa.replace(/[^A-Z0-9]/g, '').toUpperCase();
    
    if (placaLimpa.length === 7) {
      // Formato padrão: ABC1234 -> ABC-1234
      if (/^[A-Z]{3}[0-9]{4}$/.test(placaLimpa)) {
        return `${placaLimpa.substring(0, 3)}-${placaLimpa.substring(3)}`;
      }
      // Formato Mercosul: ABC1A23 (mantém sem hífen)
      return placaLimpa;
    }
    
    return placa.toUpperCase();
  }

  // ==================== MÉTODOS PARA GASTOS ====================

  // Criar gasto do veículo
  async criarGasto(dados: GastoFormData): Promise<GastosResponse> {
    try {
      console.log('💰 Criando gasto via RPC:', dados);
      
      // Primeiro tenta usar a RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_criar_gasto_veiculo', {
        p_veiculo_id: dados.veiculo_id,
        p_data_gasto: dados.data_gasto,
        p_descricao: dados.descricao,
        p_fornecedor: dados.fornecedor,
        p_quantidade: dados.quantidade,
        p_valor_unitario: dados.valor_unitario,
        p_forma_pagamento: dados.forma_pagamento,
        p_observacoes: dados.observacoes || null
      });

      // Se a RPC funcionou, retornar resultado
      if (!rpcError && rpcData) {
        console.log('✅ Gasto criado via RPC:', rpcData);
        return {
          success: rpcData?.success || true,
          message: rpcData?.message || 'Gasto criado com sucesso',
          gasto_id: rpcData?.gasto_id,
          executed_by: rpcData?.executed_by
        };
      }

      // Se a RPC falhou (função não existe), usar insert direto
      console.log('⚠️ RPC não encontrada, usando insert direto:', rpcError?.message);
      
      const { data: insertData, error: insertError } = await supabase
        .from('veiculos_gastos')
        .insert({
          veiculo_id: dados.veiculo_id,
          data_gasto: dados.data_gasto,
          descricao: dados.descricao,
          fornecedor: dados.fornecedor,
          quantidade: dados.quantidade,
          valor_unitario: dados.valor_unitario,
          // valor_total é uma coluna gerada automaticamente
          forma_pagamento: dados.forma_pagamento,
          observacoes: dados.observacoes || null,
          responsavel_email: 'sistema@app.com', // Email padrão do sistema
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir gasto:', insertError);
        return {
          success: false,
          error: insertError.message || 'Erro ao criar gasto'
        };
      }

      console.log('✅ Gasto criado via insert direto:', insertData);
      return {
        success: true,
        message: 'Gasto criado com sucesso',
        gasto_id: insertData?.id
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosService.criarGasto:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao criar gasto'
      };
    }
  }

  // Buscar gastos do veículo
  async buscarGastos(filtros: GastosFiltros): Promise<GastosResponse> {
    try {
      console.log('🔍 Buscando gastos via RPC com filtros:', filtros);
      
      // Usar RPC rpc_buscar_gastos_veiculo
      const { data, error } = await supabase
        .rpc('rpc_buscar_gastos_veiculo', {
          p_veiculo_id: filtros.veiculo_id,
          p_data_inicio: filtros.data_inicio || null,
          p_data_fim: filtros.data_fim || null,
          p_fornecedor: filtros.fornecedor || null,
          p_forma_pagamento: filtros.forma_pagamento || null,
          p_valor_min: filtros.valor_min || null,
          p_valor_max: filtros.valor_max || null,
          p_limit: filtros.limit || 50,
          p_offset: filtros.offset || 0
        });

      if (error) {
        console.error('❌ Erro ao buscar gastos via RPC:', error);
        return {
          success: false,
          error: error.message || 'Erro ao buscar gastos'
        };
      }

      console.log('📦 Resposta RPC gastos recebida:', data);
      
      // Verificar se a resposta tem o formato esperado { success: true, data: [], pagination: {}, summary: {} }
      if (data && data.success && Array.isArray(data.data)) {
        console.log('✅ Gastos encontrados via RPC:', data.data.length);
        return {
          success: true,
          data: data.data,
          pagination: data.pagination || {
            total: data.data.length,
            limit: filtros.limit || 50,
            offset: filtros.offset || 0,
            has_more: false
          },
          summary: data.summary || {
            total_periodo: data.data.reduce((sum: number, gasto: any) => sum + (gasto.valor_total || 0), 0),
            total_geral: data.data.reduce((sum: number, gasto: any) => sum + (gasto.valor_total || 0), 0),
            data_inicio: filtros.data_inicio,
            data_fim: filtros.data_fim
          }
        };
      }
      
      // Fallback se a resposta não tem success/data (resposta direta do array)
      if (Array.isArray(data)) {
        const totalPeriodo = data.reduce((sum: number, gasto: any) => sum + (gasto.valor_total || 0), 0);
        console.log('✅ Gastos encontrados (formato direto):', data.length);
        return {
          success: true,
          data: data,
          pagination: {
            total: data.length,
            limit: filtros.limit || 50,
            offset: filtros.offset || 0,
            has_more: data.length >= (filtros.limit || 50)
          },
          summary: {
            total_periodo: totalPeriodo,
            total_geral: totalPeriodo,
            data_inicio: filtros.data_inicio,
            data_fim: filtros.data_fim
          }
        };
      }
      
      // Se chegou até aqui, algo deu errado
      console.error('❌ Formato de resposta inesperado para gastos:', data);
      return {
        success: false,
        error: 'Formato de resposta inválido do servidor',
        data: []
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosService.buscarGastos:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao buscar gastos'
      };
    }
  }

  // Atualizar gasto
  async atualizarGasto(id: string, dados: GastoFormData): Promise<GastosResponse> {
    try {
      console.log('🔄 Atualizando gasto via RPC:', id, dados);
      
      // Usar RPC rpc_atualizar_gasto_veiculo conforme especificado
      const { data, error } = await supabase.rpc('rpc_atualizar_gasto_veiculo', {
        p_gasto_id: id,
        p_veiculo_id: dados.veiculo_id,
        p_data_gasto: dados.data_gasto,
        p_descricao: dados.descricao,
        p_fornecedor: dados.fornecedor,
        p_quantidade: dados.quantidade,
        p_valor_unitario: dados.valor_unitario,
        p_forma_pagamento: dados.forma_pagamento,
        p_observacoes: dados.observacoes || null
      });

      if (error) {
        console.error('❌ Erro ao atualizar gasto via RPC:', error);
        return {
          success: false,
          error: error.message || 'Erro ao atualizar gasto'
        };
      }

      console.log('✅ Gasto atualizado com sucesso via RPC:', data);
      return {
        success: data?.success || true,
        message: data?.message || 'Gasto atualizado com sucesso',
        gasto_id: data?.gasto_id || id,
        executed_by: data?.executed_by
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosService.atualizarGasto:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao atualizar gasto'
      };
    }
  }

  // Excluir gasto (soft delete)
  async excluirGasto(id: string, motivo: string = 'Exclusão via aplicativo'): Promise<GastosResponse> {
    try {
      console.log('🗑️ Excluindo gasto via RPC:', id);
      
      const { data, error } = await supabase.rpc('rpc_soft_delete_record', {
        p_table_name: 'veiculos_gastos',
        p_record_id: id,
        p_motivo: motivo
      });

      if (error) {
        console.error('❌ Erro ao excluir gasto:', error);
        return {
          success: false,
          error: error.message || 'Erro ao excluir gasto'
        };
      }

      console.log('✅ Gasto excluído com sucesso via RPC');
      return {
        success: true,
        message: 'Gasto excluído com sucesso'
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosService.excluirGasto:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao excluir gasto'
      };
    }
  }

  // Validações auxiliares para gastos
  validarDataGasto(data: string): boolean {
    const dataGasto = new Date(data);
    const hoje = new Date();
    return dataGasto <= hoje;
  }

  validarValor(valor: number): boolean {
    return valor >= 0.01;
  }

  validarQuantidade(quantidade: number): boolean {
    return quantidade >= 1;
  }

  // Formatação helpers
  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarVeiculoCompleto(veiculo: Veiculo): string {
    return `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`;
  }
}

export const veiculosService = new VeiculosService();
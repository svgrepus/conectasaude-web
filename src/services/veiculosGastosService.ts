import { supabase } from './supabase';

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

export interface VeiculoGastoFormData {
  veiculo_id: string;
  data_gasto: string;
  descricao: string;
  fornecedor: string;
  quantidade: number;
  valor_unitario: number;
  forma_pagamento: 'CARTAO' | 'BOLETO' | 'PIX' | 'TRANSFERENCIA' | 'DINHEIRO' | 'DEBITO';
  observacoes?: string;
}

export interface VeiculoGastoFiltros {
  veiculo_id: string;
  data_inicio?: string;
  data_fim?: string;
  fornecedor?: string;
  forma_pagamento?: 'CARTAO' | 'BOLETO' | 'PIX' | 'TRANSFERENCIA' | 'DINHEIRO' | 'DEBITO';
  valor_min?: number;
  valor_max?: number;
  limit?: number;
  offset?: number;
}

export interface VeiculoGastoResponse {
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

class VeiculosGastosService {
  
  // Criar gasto do veículo
  async criar(dados: VeiculoGastoFormData): Promise<VeiculoGastoResponse> {
    try {
      console.log('💰 Criando gasto do veículo:', dados);
      
      const { data, error } = await supabase.rpc('rpc_criar_gasto_veiculo', {
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
        console.error('❌ Erro ao criar gasto:', error);
        return {
          success: false,
          error: error.message || 'Erro ao criar gasto'
        };
      }

      console.log('✅ Gasto criado com sucesso:', data);
      return {
        success: data?.success || true,
        message: data?.message || 'Gasto registrado com sucesso',
        gasto_id: data?.gasto_id,
        executed_by: data?.executed_by
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosGastosService.criar:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao criar gasto'
      };
    }
  }

  // Buscar gastos com filtros
  async buscar(filtros: VeiculoGastoFiltros): Promise<VeiculoGastoResponse> {
    try {
      console.log('🔍 Buscando gastos com filtros:', filtros);
      
      const { data, error } = await supabase.rpc('rpc_buscar_gastos_veiculo', {
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
        console.error('❌ Erro ao buscar gastos:', error);
        return {
          success: false,
          error: error.message || 'Erro ao buscar gastos'
        };
      }

      console.log('✅ Gastos encontrados:', data?.data?.length || 0);
      return {
        success: data?.success || true,
        data: data?.data || [],
        pagination: data?.pagination,
        summary: data?.summary
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosGastosService.buscar:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao buscar gastos'
      };
    }
  }

  // Atualizar gasto
  async atualizar(id: string, dados: Omit<VeiculoGastoFormData, 'veiculo_id'>): Promise<VeiculoGastoResponse> {
    try {
      console.log('🔄 Atualizando gasto:', id, dados);
      
      const { data, error } = await supabase.rpc('rpc_atualizar_gasto_veiculo', {
        p_gasto_id: id,
        p_data_gasto: dados.data_gasto,
        p_descricao: dados.descricao,
        p_fornecedor: dados.fornecedor,
        p_quantidade: dados.quantidade,
        p_valor_unitario: dados.valor_unitario,
        p_forma_pagamento: dados.forma_pagamento,
        p_observacoes: dados.observacoes || null
      });

      if (error) {
        console.error('❌ Erro ao atualizar gasto:', error);
        return {
          success: false,
          error: error.message || 'Erro ao atualizar gasto'
        };
      }

      console.log('✅ Gasto atualizado com sucesso:', data);
      return {
        success: data?.success || true,
        message: data?.message || 'Gasto atualizado com sucesso',
        gasto_id: data?.gasto_id,
        executed_by: data?.executed_by
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosGastosService.atualizar:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao atualizar gasto'
      };
    }
  }

  // Excluir gasto (soft delete)
  async excluir(id: string): Promise<VeiculoGastoResponse> {
    try {
      console.log('🗑️ Excluindo gasto:', id);
      
      const { data, error } = await supabase.rpc('soft_delete_record', {
        table_name: 'veiculos_gastos',
        record_id: id
      });

      if (error) {
        console.error('❌ Erro ao excluir gasto:', error);
        return {
          success: false,
          error: error.message || 'Erro ao excluir gasto'
        };
      }

      console.log('✅ Gasto excluído com sucesso');
      return {
        success: true,
        message: 'Gasto excluído com sucesso'
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosGastosService.excluir:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao excluir gasto'
      };
    }
  }

  // Buscar totais por período
  async buscarTotais(veiculoId: string, dataInicio?: string, dataFim?: string): Promise<VeiculoGastoResponse> {
    try {
      console.log('📊 Buscando totais do veículo:', veiculoId);
      
      const { data, error } = await supabase.rpc('rpc_buscar_gastos_veiculo', {
        p_veiculo_id: veiculoId,
        p_data_inicio: dataInicio || null,
        p_data_fim: dataFim || null,
        p_fornecedor: null,
        p_forma_pagamento: null,
        p_valor_min: null,
        p_valor_max: null,
        p_limit: 0, // Só queremos o summary
        p_offset: 0
      });

      if (error) {
        console.error('❌ Erro ao buscar totais:', error);
        return {
          success: false,
          error: error.message || 'Erro ao buscar totais'
        };
      }

      console.log('✅ Totais calculados:', data?.summary);
      return {
        success: data?.success || true,
        summary: data?.summary
      };
      
    } catch (error: any) {
      console.error('❌ Erro no VeiculosGastosService.buscarTotais:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao buscar totais'
      };
    }
  }

  // Validações auxiliares
  validarData(data: string): boolean {
    const dataObj = new Date(data);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999); // Fim do dia de hoje
    
    return !isNaN(dataObj.getTime()) && dataObj <= hoje;
  }

  validarValor(valor: number): boolean {
    return valor >= 0.01;
  }

  validarQuantidade(quantidade: number): boolean {
    return quantidade >= 1;
  }

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  calcularTotal(quantidade: number, valorUnitario: number): number {
    return quantidade * valorUnitario;
  }

  // Opções para dropdowns
  getOpcoesFormaPagamento() {
    return [
      { label: 'Cartão de Crédito', value: 'CARTAO' },
      { label: 'Cartão de Débito', value: 'DEBITO' },
      { label: 'PIX', value: 'PIX' },
      { label: 'Transferência', value: 'TRANSFERENCIA' },
      { label: 'Boleto', value: 'BOLETO' },
      { label: 'Dinheiro', value: 'DINHEIRO' }
    ];
  }

  getOpcoesCombustivel() {
    return [
      { label: 'Gasolina', value: 'GASOLINA' },
      { label: 'Álcool', value: 'ALCOOL' },
      { label: 'Diesel', value: 'DIESEL' },
      { label: 'Flex', value: 'FLEX' },
      { label: 'Elétrico', value: 'ELETRICO' }
    ];
  }
}

export const veiculosGastosService = new VeiculosGastosService();
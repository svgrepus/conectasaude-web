import { supabase } from './supabase';
import { authService } from './auth';
import { getSupabaseHeaders } from '../config/supabase';

// Interface baseada no objeto de retorno da API
export interface EstoqueMovimento {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';
  medicamentos_estoque_id: string;
  quantidade: number;
  motivo: string;
  executed_at: string;
  executed_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

class EstoqueMovimentosService {
  private readonly table = 'estoque_movimentos_active';

  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    return getSupabaseHeaders(accessToken || undefined);
  }

  // Testar se a tabela existe
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('id', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        console.error('❌ Erro ao testar tabela:', error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro no teste de conexão:', error);
      return false;
    }
  }

  // Buscar movimentações por ID do estoque de medicamento
  async getByEstoqueId(medicamentosEstoqueId: string): Promise<EstoqueMovimento[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('medicamentos_estoque_id', medicamentosEstoqueId)
        .order('executed_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar movimentações:', error.message);
        throw new Error(`Erro na consulta: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro no EstoqueMovimentosService.getByEstoqueId:', error);
      throw error;
    }
  }

  // Buscar todas as movimentações (com paginação opcional)
  async getAll(limit?: number, offset?: number): Promise<EstoqueMovimento[]> {
    try {
      console.log('🔍 Buscando todas as movimentações');
      
      let query = supabase
        .from(this.table)
        .select('*')
        .order('executed_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar movimentações:', error);
        throw new Error(error.message);
      }

      console.log('✅ Movimentações encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro no EstoqueMovimentosService.getAll:', error);
      throw error;
    }
  }

  // Criar nova movimentação
  async create(movimentacao: Omit<EstoqueMovimento, 'id' | 'created_at' | 'updated_at'>): Promise<EstoqueMovimento> {
    try {
      console.log('📤 Criando nova movimentação:', movimentacao);
      
      const { data, error } = await supabase
        .from(this.table)
        .insert([movimentacao])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar movimentação:', error);
        throw new Error(error.message);
      }

      console.log('✅ Movimentação criada com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro no EstoqueMovimentosService.create:', error);
      throw error;
    }
  }

  // Buscar resumo de movimentações por estoque
  async getResumoByEstoqueId(medicamentosEstoqueId: string): Promise<{
    totalEntradas: number;
    totalSaidas: number;
    saldoMovimentacao: number;
    ultimaMovimentacao?: EstoqueMovimento;
  }> {
    try {
      console.log('📊 Calculando resumo para estoque:', medicamentosEstoqueId);
      
      const movimentacoes = await this.getByEstoqueId(medicamentosEstoqueId);
      
      let totalEntradas = 0;
      let totalSaidas = 0;
      let ultimaMovimentacao: EstoqueMovimento | undefined;

      movimentacoes.forEach(mov => {
        if (mov.tipo === 'ENTRADA') {
          totalEntradas += mov.quantidade;
        } else if (mov.tipo === 'SAIDA') {
          totalSaidas += mov.quantidade;
        }
        
        // A primeira movimentação já é a mais recente devido ao order by
        if (!ultimaMovimentacao) {
          ultimaMovimentacao = mov;
        }
      });

      const saldoMovimentacao = totalEntradas - totalSaidas;

      console.log('✅ Resumo calculado:', {
        totalEntradas,
        totalSaidas,
        saldoMovimentacao,
        totalMovimentacoes: movimentacoes.length
      });

      return {
        totalEntradas,
        totalSaidas,
        saldoMovimentacao,
        ultimaMovimentacao
      };
    } catch (error) {
      console.error('❌ Erro no EstoqueMovimentosService.getResumoByEstoqueId:', error);
      throw error;
    }
  }

  // Buscar movimentações por tipo
  async getByTipo(tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA'): Promise<EstoqueMovimento[]> {
    try {
      console.log('🔍 Buscando movimentações por tipo:', tipo);
      
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('tipo', tipo)
        .order('executed_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar movimentações por tipo:', error);
        throw new Error(error.message);
      }

      console.log('✅ Movimentações encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro no EstoqueMovimentosService.getByTipo:', error);
      throw error;
    }
  }

  // Buscar movimentações por período
  async getByPeriodo(dataInicio: string, dataFim: string): Promise<EstoqueMovimento[]> {
    try {
      console.log('🔍 Buscando movimentações por período:', dataInicio, 'até', dataFim);
      
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .gte('executed_at', dataInicio)
        .lte('executed_at', dataFim)
        .order('executed_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar movimentações por período:', error);
        throw new Error(error.message);
      }

      console.log('✅ Movimentações encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro no EstoqueMovimentosService.getByPeriodo:', error);
      throw error;
    }
  }

  // Registrar saída de estoque usando RPC
  async registrarSaidaEstoque(params: {
    medicamentos_estoque_id: string;
    quantidade: number;
    motivo: string;
    executed_by?: string;
  }): Promise<{
    success: boolean;
    message: string;
    movimento_id?: string;
    medicamento?: string;
    lote?: string;
    unidade?: string;
    quantidade_saida?: number;
    estoque_anterior?: number;
    estoque_atual?: number;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('registrar_saida_estoque', {
        p_medicamentos_estoque_id: params.medicamentos_estoque_id,
        p_quantidade: params.quantidade,
        p_motivo: params.motivo,
        p_executed_by: params.executed_by || null
      });

      if (error) {
        console.error('❌ Erro na RPC registrar_saida_estoque:', error.message);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no EstoqueMovimentosService.registrarSaidaEstoque:', error);
      throw error;
    }
  }
}

export const estoqueMovimentosService = new EstoqueMovimentosService();
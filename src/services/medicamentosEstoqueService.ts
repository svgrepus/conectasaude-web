import { supabase } from './supabase';
import { withAuth } from '../utils/authUtils';

// Interface base para medicamento estoque - versão limpa sem unidade_controle
export interface MedicamentoEstoque {
  id?: string;
  medicamento_id: string;
  lote: string;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_maxima?: number | null;
  localizacao?: string | null;
  data_entrada: string;
  data_validade?: string | null;
  fornecedor?: string | null;
  valor_unitario?: number | null;
  valor_total?: number | null;
  responsavel_entrada: string;
  status_lote: 'ATIVO' | 'VENCIDO' | 'QUARENTENA' | 'DEVOLVIDO' | 'BLOQUEADO';
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Campos da view para listagem (vw_estoque_medicamentos)
  nome_dcb?: string;
  nome_dci?: string;
  codigo_interno?: string;
  forca_valor?: string;
  forca_unidade_abrev?: string;
  observacoes_estoque?: string; // Alias da view para observacoes
}

// Interface para pesquisa e filtros
export interface EstoqueMedicamentoFilters {
  medicamento_nome?: string;
  status_lote?: string;
  data_entrada_inicio?: string;
  data_entrada_fim?: string;
  data_validade_inicio?: string;
  data_validade_fim?: string;
  fornecedor?: string;
  lote?: string;
  responsavel_entrada?: string;
}

class MedicamentosEstoqueService {
  private readonly table = 'medicamentos_estoque';
  private readonly view = 'vw_estoque_medicamentos';

  // Listar com filtros e ordenação
  async getAll(filters?: EstoqueMedicamentoFilters): Promise<MedicamentoEstoque[]> {
    try {
      console.log('🔄 MedicamentosEstoqueService.getAll chamado com filtros:', filters);
      
      let query = supabase
        .from(this.view)
        .select('*')
        .order('created_at', { ascending: false })
        .order('nome_dcb', { ascending: true })
        .order('lote', { ascending: true });

      // Aplicar filtros se fornecidos
      if (filters) {
        if (filters.medicamento_nome) {
          // Pesquisa por nome do medicamento usando OR para pesquisar em nome_dcb, nome_dci e codigo_interno
          const searchParams = new URLSearchParams();
          searchParams.append('or', `nome_dcb.ilike.%${filters.medicamento_nome}%,nome_dci.ilike.%${filters.medicamento_nome}%,codigo_interno.ilike.%${filters.medicamento_nome}%`);
          
          console.log('🔍 Pesquisando medicamento com termo:', filters.medicamento_nome);
          
          // Usar rpc ou filtros individuais para busca complexa
          query = query.or(`nome_dcb.ilike.%${filters.medicamento_nome}%,nome_dci.ilike.%${filters.medicamento_nome}%,codigo_interno.ilike.%${filters.medicamento_nome}%`);
        }

        if (filters.status_lote) {
          query = query.eq('status_lote', filters.status_lote);
        }

        if (filters.data_entrada_inicio) {
          query = query.gte('data_entrada', filters.data_entrada_inicio);
        }

        if (filters.data_entrada_fim) {
          query = query.lte('data_entrada', filters.data_entrada_fim);
        }

        if (filters.data_validade_inicio) {
          query = query.gte('data_validade', filters.data_validade_inicio);
        }

        if (filters.data_validade_fim) {
          query = query.lte('data_validade', filters.data_validade_fim);
        }

        if (filters.fornecedor) {
          query = query.ilike('fornecedor', `%${filters.fornecedor}%`);
        }

        if (filters.lote) {
          query = query.ilike('lote', `%${filters.lote}%`);
        }

        if (filters.responsavel_entrada) {
          query = query.ilike('responsavel_entrada', `%${filters.responsavel_entrada}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar estoques:', error);
        throw new Error(error.message);
      }

      console.log('✅ Estoques carregados:', data?.length || 0, 'registros');
      return data || [];
    } catch (error) {
      console.error('❌ Erro no MedicamentosEstoqueService.getAll:', error);
      throw error;
    }
  }

  // Buscar por ID específico
  async getById(id: string): Promise<MedicamentoEstoque | null> {
    try {
      console.log('🔍 Buscando estoque por ID:', id);
      
      const { data, error } = await supabase
        .from(this.view)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Estoque não encontrado:', id);
          return null;
        }
        console.error('❌ Erro ao buscar estoque:', error);
        throw new Error(error.message);
      }

      console.log('✅ Estoque encontrado:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro no MedicamentosEstoqueService.getById:', error);
      throw error;
    }
  }

  // Criar novo estoque
  async create(estoque: Omit<MedicamentoEstoque, 'id' | 'created_at' | 'updated_at'>): Promise<MedicamentoEstoque> {
    try {
      console.log('📤 Criando novo estoque:', estoque);
      
      const { data, error } = await supabase
        .from(this.table)
        .insert([estoque])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar estoque:', error);
        throw new Error(error.message);
      }

      console.log('✅ Estoque criado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro no MedicamentosEstoqueService.create:', error);
      throw error;
    }
  }

  // Atualizar estoque existente
  async update(id: string, estoque: Partial<MedicamentoEstoque>): Promise<boolean> {
    try {
      console.log('📤 Atualizando estoque:', id, estoque);
      
      const { error } = await supabase
        .from(this.table)
        .update(estoque)
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao atualizar estoque:', error);
        throw new Error(error.message);
      }

      console.log('✅ Estoque atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro no MedicamentosEstoqueService.update:', error);
      throw error;
    }
  }

  // Deletar estoque (hard delete - manter para compatibilidade)
  async delete(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Deletando estoque:', id);
      
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar estoque:', error);
        throw new Error(error.message);
      }

      console.log('✅ Estoque deletado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro no MedicamentosEstoqueService.delete:', error);
      throw error;
    }
  }

  // Soft delete com motivo usando RPC
  async softDelete(id: string, motivo: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🎯 softDelete iniciado - ID:', id, 'Motivo:', motivo);
      
      // Verificar se há usuário autenticado e obter token
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log('🔐 Sessão atual:', { hasSession: !!session, authError });
      
      if (authError) {
        console.log('⚠️ Erro ao obter sessão, continuando sem token');
      }
      
      // Fazer chamada RPC com ou sem token
      console.log('🔐 Fazendo chamada RPC...');
      
      const { data, error } = await supabase.rpc('soft_delete_record', {
        table_name: 'medicamentos_estoque',
        record_id: id,
        motivo: motivo
      });

      console.log('📞 Resposta da RPC:', { data, error });

      if (error) {
        console.error('❌ Erro ao fazer soft delete:', error);
        
        // Verificar se é erro de função não encontrada
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          return {
            success: false,
            error: 'A função de exclusão não está configurada no sistema. Contate o administrador.'
          };
        }
        
        // Verificar se é erro de autenticação
        if (error.message.includes('JWT') || error.message.includes('authentication')) {
          return {
            success: false,
            error: 'Você precisa estar logado para realizar esta ação. Faça login e tente novamente.'
          };
        }
        
        return {
          success: false,
          error: error.message || 'Erro ao excluir registro'
        };
      }

      console.log('✅ Soft delete realizado com sucesso:', data);
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Erro no MedicamentosEstoqueService.softDelete:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao excluir registro'
      };
    }
  }

  // Excluir estoque usando RPC específico
  async excluirEstoque(estoqueId: string, motivo: string): Promise<{
    success: boolean;
    message?: string;
    medicamento?: string;
    lote?: string;
    quantidade_excluida?: number;
    motivo?: string;
    executed_by?: string;
    error?: string;
  }> {
    try {
      console.log('🎯 excluirEstoque iniciado - ID:', estoqueId, 'Motivo:', motivo);
      
      const { data, error } = await supabase.rpc('excluir_estoque_medicamento', {
        p_estoque_id: estoqueId,
        p_motivo: motivo
      });

      if (error) {
        console.error('❌ Erro ao excluir estoque:', error);
        return {
          success: false,
          error: error.message || 'Erro ao excluir estoque'
        };
      }

      console.log('✅ Estoque excluído com sucesso:', data);
      return {
        success: true,
        message: data?.message || 'Estoque excluído com sucesso',
        medicamento: data?.medicamento,
        lote: data?.lote,
        quantidade_excluida: data?.quantidade_excluida,
        motivo: data?.motivo,
        executed_by: data?.executed_by
      };
      
    } catch (error: any) {
      console.error('❌ Erro no MedicamentosEstoqueService.excluirEstoque:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao excluir estoque'
      };
    }
  }

  // Buscar medicamentos com estoque baixo
  async getEstoqueBaixo(): Promise<MedicamentoEstoque[]> {
    try {
      console.log('🔍 Buscando medicamentos com estoque baixo');
      
      const { data, error } = await supabase
        .from(this.view)
        .select('*')
        .lte('quantidade_atual', 'quantidade_minima')
        .eq('status_lote', 'ATIVO')
        .order('quantidade_atual', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar estoque baixo:', error);
        throw new Error(error.message);
      }

      console.log('✅ Medicamentos com estoque baixo:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro no MedicamentosEstoqueService.getEstoqueBaixo:', error);
      throw error;
    }
  }

  // Buscar medicamentos próximos ao vencimento
  async getProximosVencimento(dias: number = 30): Promise<MedicamentoEstoque[]> {
    try {
      console.log('🔍 Buscando medicamentos próximos ao vencimento em', dias, 'dias');
      
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + dias);
      const dataLimiteStr = dataLimite.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from(this.view)
        .select('*')
        .not('data_validade', 'is', null)
        .lte('data_validade', dataLimiteStr)
        .eq('status_lote', 'ATIVO')
        .order('data_validade', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar próximos ao vencimento:', error);
        throw new Error(error.message);
      }

      console.log('✅ Medicamentos próximos ao vencimento:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro no MedicamentosEstoqueService.getProximosVencimento:', error);
      throw error;
    }
  }
}

export const medicamentosEstoqueService = new MedicamentosEstoqueService();
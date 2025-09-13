import supabase from './supabase';

export interface EstoqueMovimento {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';
  medicamento_id: string;
  unidade_origem_id?: string;
  unidade_destino_id?: string;
  quantidade: number;
  lote: string;
  data_entrada?: string;
  destino?: string;
  motivo?: string;
  executed_at: string;
  executed_by: string;
  created_at: string;
  updated_at: string;
}

export interface EstoquePorUnidade {
  unidade_id: string;
  unidade_nome: string;
  total_medicamentos: number;
  total_quantidade: number;
  medicamentos_baixo_estoque: number;
}

class EstoquesService {
  async getMovimentos(): Promise<EstoqueMovimento[]> {
    try {
      const { data, error } = await supabase
        .from('estoque_movimentos')
        .select(`
          *,
          medicamento:medicamentos!inner(dcb_dci, codigo_interno),
          unidade_origem:stock_units!estoque_movimentos_unidade_origem_id_fkey(nome),
          unidade_destino:stock_units!estoque_movimentos_unidade_destino_id_fkey(nome)
        `)
        .eq('deleted_at', null)
        .order('executed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar movimentos de estoque:', error);
      throw error;
    }
  }

  async createMovimento(movimento: Omit<EstoqueMovimento, 'id' | 'created_at' | 'updated_at'>): Promise<EstoqueMovimento> {
    try {
      const { data, error } = await supabase
        .from('estoque_movimentos')
        .insert([movimento])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar movimento de estoque:', error);
      throw error;
    }
  }

  async getEstoquePorUnidade(): Promise<EstoquePorUnidade[]> {
    try {
      const { data, error } = await supabase
        .from('medicamentos_estoque')
        .select(`
          unidade_id,
          unidade:stock_units!inner(nome),
          quantidade,
          minimo_alerta,
          medicamento:medicamentos!inner(id)
        `);

      if (error) throw error;

      // Agrupar dados por unidade
      const estoquePorUnidade = data?.reduce((acc: any, item: any) => {
        const unidadeId = item.unidade_id;
        
        if (!acc[unidadeId]) {
          acc[unidadeId] = {
            unidade_id: unidadeId,
            unidade_nome: item.unidade.nome,
            total_medicamentos: 0,
            total_quantidade: 0,
            medicamentos_baixo_estoque: 0,
          };
        }

        acc[unidadeId].total_medicamentos += 1;
        acc[unidadeId].total_quantidade += item.quantidade;
        
        if (item.quantidade <= item.minimo_alerta) {
          acc[unidadeId].medicamentos_baixo_estoque += 1;
        }

        return acc;
      }, {});

      return Object.values(estoquePorUnidade || {}) as EstoquePorUnidade[];
    } catch (error) {
      console.error('Erro ao buscar estoque por unidade:', error);
      throw error;
    }
  }

  async getMovimentosPorPeriodo(diasAtras: number = 30): Promise<any[]> {
    try {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - diasAtras);

      const { data, error } = await supabase
        .from('estoque_movimentos')
        .select(`
          executed_at,
          tipo,
          quantidade,
          medicamento:medicamentos!inner(dcb_dci),
          unidade_destino:stock_units!estoque_movimentos_unidade_destino_id_fkey(nome)
        `)
        .eq('deleted_at', null)
        .gte('executed_at', dataInicio.toISOString())
        .order('executed_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar movimentos por período:', error);
      throw error;
    }
  }

  async getRelatorioDashboard(): Promise<{
    movimentosRecentes: EstoqueMovimento[];
    estoquePorUnidade: EstoquePorUnidade[];
    alertasEstoque: any[];
  }> {
    try {
      const [movimentosRecentes, estoquePorUnidade] = await Promise.all([
        this.getMovimentos(),
        this.getEstoquePorUnidade(),
      ]);

      // Buscar alertas de estoque baixo
      const { data: alertasData, error: alertasError } = await supabase
        .from('medicamentos_estoque')
        .select(`
          *,
          medicamento:medicamentos!inner(dcb_dci, codigo_interno),
          unidade:stock_units!inner(nome)
        `)
        .filter('quantidade', 'lte', 'minimo_alerta');

      if (alertasError) throw alertasError;

      return {
        movimentosRecentes: movimentosRecentes.slice(0, 10),
        estoquePorUnidade,
        alertasEstoque: alertasData || [],
      };
    } catch (error) {
      console.error('Erro ao buscar relatório do dashboard:', error);
      throw error;
    }
  }

  async transferirMedicamento(
    medicamentoId: string,
    unidadeOrigemId: string,
    unidadeDestinoId: string,
    quantidade: number,
    lote: string,
    motivo: string,
    executedBy: string
  ): Promise<EstoqueMovimento> {
    try {
      // Verificar se há estoque suficiente na origem
      const { data: estoqueOrigem, error: estoqueError } = await supabase
        .from('medicamentos_estoque')
        .select('quantidade')
        .eq('medicamento_id', medicamentoId)
        .eq('unidade_id', unidadeOrigemId)
        .single();

      if (estoqueError) throw estoqueError;

      if (!estoqueOrigem || estoqueOrigem.quantidade < quantidade) {
        throw new Error('Estoque insuficiente na unidade de origem');
      }

      // Criar movimento de transferência
      const movimento = await this.createMovimento({
        tipo: 'TRANSFERENCIA',
        medicamento_id: medicamentoId,
        unidade_origem_id: unidadeOrigemId,
        unidade_destino_id: unidadeDestinoId,
        quantidade,
        lote,
        motivo,
        executed_at: new Date().toISOString(),
        executed_by: executedBy,
      });

      // Atualizar estoques (isso seria feito por trigger no banco)
      // Por enquanto, apenas retornamos o movimento criado

      return movimento;
    } catch (error) {
      console.error('Erro ao transferir medicamento:', error);
      throw error;
    }
  }
}

export const estoquesService = new EstoquesService();

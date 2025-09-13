import supabase from './supabase';

export interface Medicamento {
  id: string;
  dcb_dci: string;
  forca_concentracao: string;
  codigo_interno: string;
  status: 'ATIVO' | 'INATIVO';
  obsoleto: boolean;
  validade: string;
  custo: number;
  valor_repasse: number;
  local_armazenamento: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export interface MedicamentoEstoque {
  id: string;
  medicamento_id: string;
  unidade_id: string;
  quantidade: number;
  minimo_alerta: number;
  medicamento: Medicamento;
  unidade: {
    id: string;
    nome: string;
  };
}

class MedicamentosService {
  async getAll(): Promise<Medicamento[]> {
    try {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .eq('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Medicamento | null> {
    try {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .eq('id', id)
        .eq('deleted_at', null)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar medicamento:', error);
      throw error;
    }
  }

  async create(medicamento: Omit<Medicamento, 'id' | 'created_at' | 'updated_at'>): Promise<Medicamento> {
    try {
      const { data, error } = await supabase
        .from('medicamentos')
        .insert([medicamento])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar medicamento:', error);
      throw error;
    }
  }

  async update(id: string, medicamento: Partial<Medicamento>): Promise<Medicamento> {
    try {
      const { data, error } = await supabase
        .from('medicamentos')
        .update({ ...medicamento, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar medicamento:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('medicamentos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao excluir medicamento:', error);
      throw error;
    }
  }

  async getEstoqueBaixo(): Promise<MedicamentoEstoque[]> {
    try {
      const { data, error } = await supabase
        .from('medicamentos_estoque')
        .select(`
          *,
          medicamento:medicamentos!inner(*),
          unidade:stock_units!inner(id, nome)
        `)
        .filter('quantidade', 'lte', 'minimo_alerta')
        .eq('medicamento.deleted_at', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar estoque baixo:', error);
      throw error;
    }
  }

  async getProximosVencimento(dias: number = 30): Promise<Medicamento[]> {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + dias);

      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .eq('deleted_at', null)
        .lte('validade', dataLimite.toISOString().split('T')[0])
        .gte('validade', new Date().toISOString().split('T')[0])
        .order('validade', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar medicamentos próximos do vencimento:', error);
      throw error;
    }
  }

  async getVencidos(): Promise<Medicamento[]> {
    try {
      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .eq('deleted_at', null)
        .lt('validade', hoje)
        .order('validade', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar medicamentos vencidos:', error);
      throw error;
    }
  }

  async getTotalCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('medicamentos')
        .select('*', { count: 'exact', head: true })
        .eq('deleted_at', null);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar medicamentos:', error);
      throw error;
    }
  }

  async search(query: string): Promise<Medicamento[]> {
    try {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .eq('deleted_at', null)
        .or(`dcb_dci.ilike.%${query}%, codigo_interno.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao pesquisar medicamentos:', error);
      throw error;
    }
  }

  // 💊 Buscar medicamentos ativos para seleção no formulário de munícipe
  async searchMedicamentosAtivos(query: string): Promise<{ id: string; dcb_dci: string }[]> {
    try {
      const { data, error } = await supabase
        .from('medicamentos_active') // ✅ CORREÇÃO: usar medicamentos_active
        .select('id, dcb_dci')
        .eq('status', 'ATIVO')
        .is('deleted_at', null) // ✅ CORREÇÃO: filtrar deleted_at=null
        .ilike('dcb_dci', `%${query}%`)
        .order('dcb_dci', { ascending: true })
        .limit(10); // Limitar a 10 resultados para performance

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar medicamentos ativos:', error);
      throw error;
    }
  }

  // 💊 Buscar todos os medicamentos ativos (para carregar inicialmente)
  async getMedicamentosAtivos(): Promise<{ id: string; dcb_dci: string }[]> {
    try {
      const { data, error } = await supabase
        .from('medicamentos_active') // ✅ CORREÇÃO: usar medicamentos_active
        .select('id, dcb_dci')
        .eq('status', 'ATIVO')
        .is('deleted_at', null) // ✅ CORREÇÃO: filtrar deleted_at=null
        .order('dcb_dci', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar medicamentos ativos:', error);
      throw error;
    }
  }
}

export const medicamentosService = new MedicamentosService();

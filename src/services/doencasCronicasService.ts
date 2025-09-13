import supabase from './supabase';

export interface DoencaCronica {
  id: string;
  name: string;
  descricao?: string;
  status: 'ATIVO' | 'INATIVO';
  created_at: string;
  updated_at: string;
}

class DoencasCronicasService {
  // 🩺 Buscar doenças crônicas ativas para seleção no formulário de munícipe
  async searchDoencasCronicasAtivas(query: string): Promise<{ id: string; nome: string }[]> {
    try {
      const { data, error } = await supabase
        .from('basic_health_chronic_diseases_active')
        .select('id, name')
        .is('deleted_at', null)
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(10); // Limitar a 10 resultados para performance

      if (error) throw error;
      
      // Converter name para nome para manter compatibilidade com o frontend
      return (data || []).map(item => ({
        id: item.id,
        nome: item.name
      }));
    } catch (error) {
      console.error('Erro ao buscar doenças crônicas ativas:', error);
      throw error;
    }
  }

  // 🩺 Buscar todas as doenças crônicas ativas (para carregar inicialmente)
  async getDoencasCronicasAtivas(): Promise<{ id: string; nome: string }[]> {
    try {
      const { data, error } = await supabase
        .from('basic_health_chronic_diseases_active')
        .select('id, name')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Converter name para nome para manter compatibilidade com o frontend
      return (data || []).map(item => ({
        id: item.id,
        nome: item.name
      }));
    } catch (error) {
      console.error('Erro ao buscar doenças crônicas ativas:', error);
      throw error;
    }
  }

  // 🩺 Buscar todas as doenças crônicas (incluindo inativas - para administração)
  async getAll(): Promise<DoencaCronica[]> {
    try {
      const { data, error } = await supabase
        .from('basic_health_chronic_diseases')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar doenças crônicas:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<DoencaCronica | null> {
    try {
      const { data, error } = await supabase
        .from('basic_health_chronic_diseases')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar doença crônica:', error);
      throw error;
    }
  }

  async create(doenca: Omit<DoencaCronica, 'id' | 'created_at' | 'updated_at'>): Promise<DoencaCronica> {
    try {
      const { data, error } = await supabase
        .from('basic_health_chronic_diseases')
        .insert([doenca])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar doença crônica:', error);
      throw error;
    }
  }

  async update(id: string, doenca: Partial<DoencaCronica>): Promise<DoencaCronica> {
    try {
      const { data, error } = await supabase
        .from('basic_health_chronic_diseases')
        .update({ ...doenca, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar doença crônica:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('basic_health_chronic_diseases')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao excluir doença crônica:', error);
      throw error;
    }
  }

  async search(query: string): Promise<DoencaCronica[]> {
    try {
      const { data, error } = await supabase
        .from('basic_health_chronic_diseases')
        .select('*')
        .is('deleted_at', null)
        .or(`nome.ilike.%${query}%, descricao.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao pesquisar doenças crônicas:', error);
      throw error;
    }
  }

  async getTotalCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('basic_health_chronic_diseases')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar doenças crônicas:', error);
      throw error;
    }
  }
}

export const doencasCronicasService = new DoencasCronicasService();

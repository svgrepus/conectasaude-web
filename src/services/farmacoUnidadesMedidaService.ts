import supabase from './supabase';

export interface FarmacoUnidadeMedida {
  id: string;
  nome: string;
  sigla?: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

class FarmacoUnidadesMedidaService {
  async getAll(): Promise<FarmacoUnidadeMedida[]> {
    try {
      const { data, error } = await supabase
        .from('farmaco_unidades_medida')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao buscar unidades de medida:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar unidades de medida:', error);
      // Fallback com algumas unidades básicas
      return [
        { id: '1', nome: 'Unidade', sigla: 'UN' },
        { id: '2', nome: 'Miligrama', sigla: 'mg' },
        { id: '3', nome: 'Grama', sigla: 'g' },
        { id: '4', nome: 'Mililitro', sigla: 'ml' },
        { id: '5', nome: 'Litro', sigla: 'L' },
        { id: '6', nome: 'Comprimido', sigla: 'cp' },
        { id: '7', nome: 'Cápsula', sigla: 'caps' },
        { id: '8', nome: 'Ampola', sigla: 'amp' },
        { id: '9', nome: 'Frasco', sigla: 'fr' },
        { id: '10', nome: 'Cartela', sigla: 'cart' },
      ];
    }
  }

  async getById(id: string): Promise<FarmacoUnidadeMedida | null> {
    try {
      const { data, error } = await supabase
        .from('farmaco_unidades_medida')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erro ao buscar unidade de medida:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar unidade de medida:', error);
      return null;
    }
  }

  async search(query: string): Promise<FarmacoUnidadeMedida[]> {
    try {
      const { data, error } = await supabase
        .from('farmaco_unidades_medida')
        .select('*')
        .or(`nome.ilike.%${query}%,sigla.ilike.%${query}%`)
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao pesquisar unidades de medida:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao pesquisar unidades de medida:', error);
      return [];
    }
  }
}

export const farmacoUnidadesMedidaService = new FarmacoUnidadesMedidaService();
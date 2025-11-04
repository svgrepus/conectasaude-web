import supabase from './supabase';

export interface StockControlUnit {
  id: string;
  nome: string;
  abreviacao?: string;
  sigla?: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

class StockControlUnitsService {
  // Dados mock para demonstração
  private mockData: StockControlUnit[] = [
    {
      id: '1',
      nome: 'Unidade',
      sigla: 'UN',
      descricao: 'Unidade individual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'Caixa',
      sigla: 'CX',
      descricao: 'Caixa com múltiplas unidades',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      nome: 'Pacote',
      sigla: 'PCT',
      descricao: 'Pacote com múltiplas unidades',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      nome: 'Frasco',
      sigla: 'FR',
      descricao: 'Frasco individual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      nome: 'Ampola',
      sigla: 'AMP',
      descricao: 'Ampola individual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  async getAll(): Promise<StockControlUnit[]> {
    try {
      // Buscar do banco usando a view stock_control_units_active
      const { data, error } = await supabase
        .from('stock_control_units_active')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao buscar unidades de controle:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar unidades de controle:', error);
      // Em caso de erro, retornar dados mock como fallback
      return this.mockData;
    }
  }

  async getById(id: string): Promise<StockControlUnit | null> {
    try {
      // Buscar na view stock_control_units_active
      const { data, error } = await supabase
        .from('stock_control_units_active')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          return null;
        }
        console.error('Erro ao buscar unidade de controle:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar unidade de controle:', error);
      // Buscar nos dados mock como fallback
      return this.mockData.find(item => item.id === id) || null;
    }
  }
}

export const stockControlUnitsService = new StockControlUnitsService();
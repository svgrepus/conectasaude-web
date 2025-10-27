import supabase from './supabase';
import { authService } from './auth';
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase';

export interface Medicamento {
  id?: string;
  nome_dcb?: string;
  nome_dci?: string;
  forca_valor?: number;
  forca_unidade_id?: string;
  unidade_controle_id: string;
  codigo_interno?: string;
  status?: 'ATIVO' | 'INATIVO';
  obsoleto?: boolean;
  validade: string; // ISO date string
  custo?: number;
  valor_repasse?: number;
  local_armazenamento?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
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
  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    return getSupabaseHeaders(accessToken || undefined);
  }
  // Dados mock para demonstração
  private mockData: Medicamento[] = [
    {
      id: '1',
      nome_dcb: 'Paracetamol 500mg',
      nome_dci: 'Paracetamol',
      forca_valor: 500,
      forca_unidade_id: 'mg',
      unidade_controle_id: 'UNI001',
      codigo_interno: 'PAR500',
      status: 'ATIVO',
      obsoleto: false,
      validade: '2025-12-31',
      custo: 0.15,
      valor_repasse: 0.20,
      local_armazenamento: 'Armário A - Prateleira 1',
      observacoes: 'Analgésico e antitérmico',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      nome_dcb: 'Ibuprofeno 600mg',
      nome_dci: 'Ibuprofeno',
      forca_valor: 600,
      forca_unidade_id: 'mg',
      unidade_controle_id: 'UNI002',
      codigo_interno: 'IBU600',
      status: 'ATIVO',
      obsoleto: false,
      validade: '2025-08-15',
      custo: 0.25,
      valor_repasse: 0.35,
      local_armazenamento: 'Armário A - Prateleira 2',
      observacoes: 'Anti-inflamatório',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      nome_dcb: 'Dipirona 500mg',
      nome_dci: 'Metamizol',
      forca_valor: 500,
      forca_unidade_id: 'mg',
      unidade_controle_id: 'UNI003',
      codigo_interno: 'DIP500',
      status: 'ATIVO',
      obsoleto: false,
      validade: '2025-10-20',
      custo: 0.12,
      valor_repasse: 0.18,
      local_armazenamento: 'Armário B - Prateleira 1',
      observacoes: 'Analgésico e antiespasmódico',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      nome_dcb: 'Amoxicilina 500mg',
      nome_dci: 'Amoxicilina',
      forca_valor: 500,
      forca_unidade_id: 'mg',
      unidade_controle_id: 'UNI004',
      codigo_interno: 'AMO500',
      status: 'INATIVO',
      obsoleto: false,
      validade: '2025-06-30',
      custo: 0.45,
      valor_repasse: 0.60,
      local_armazenamento: 'Geladeira - Prateleira 1',
      observacoes: 'Antibiótico',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      nome_dcb: 'Omeprazol 20mg',
      nome_dci: 'Omeprazol',
      forca_valor: 20,
      forca_unidade_id: 'mg',
      unidade_controle_id: 'UNI005',
      codigo_interno: 'OME20',
      status: 'ATIVO',
      obsoleto: false,
      validade: '2026-03-15',
      custo: 0.30,
      valor_repasse: 0.45,
      local_armazenamento: 'Armário C - Prateleira 1',
      observacoes: 'Inibidor da bomba de prótons',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  async getAll(): Promise<Medicamento[]> {
    try {
      // Buscar do banco usando o endpoint correto: medicamentos_active
      const { data, error } = await supabase
        .from('medicamentos_active')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar medicamentos:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
      // Em caso de erro, retornar dados mock como fallback
      return this.mockData;
    }
  }

  async getById(id: string): Promise<Medicamento | null> {
    try {
      // Buscar na tabela medicamentos_active
      const { data, error } = await supabase
        .from('medicamentos_active')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          return null;
        }
        console.error('Erro ao buscar medicamento:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar medicamento:', error);
      // Buscar nos dados mock como fallback
      return this.mockData.find(item => item.id === id) || null;
    }
  }

  async create(medicamento: Omit<Medicamento, 'id' | 'created_at' | 'updated_at'>): Promise<Medicamento> {
    try {
      console.log('🔄 Criando novo medicamento:', medicamento);
      
      // Salvar na tabela medicamentos usando fetch direto
      const url = `${SUPABASE_ENDPOINTS.rest}/medicamentos`;
      const payload = {
        ...medicamento,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🌐 URL:', url);
      console.log('📦 Payload:', payload);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', response.status, errorData);
        throw new Error(`Erro ao criar medicamento: ${response.status}`);
      }
      
      console.log('✅ Medicamento criado com sucesso no banco');
      
      // Buscar o registro criado pela view (o mais recente)
      const records = await this.getAll();
      const createdRecord = records[0]; // O mais recente (ordenado por created_at desc)
      
      if (!createdRecord) {
        throw new Error('Erro ao recuperar registro criado');
      }
      
      console.log('✅ Registro criado recuperado:', createdRecord);
      return createdRecord;
    } catch (error) {
      console.error('❌ Erro ao criar medicamento:', error);
      throw error;
    }
  }

  async update(id: string, medicamento: Partial<Medicamento>): Promise<Medicamento> {
    try {
      console.log('🔄 Iniciando update do medicamento:', id, medicamento);
      
      // Atualizar na tabela medicamentos usando fetch direto
      const url = `${SUPABASE_ENDPOINTS.rest}/medicamentos?id=eq.${id}`;
      const payload = { ...medicamento, updated_at: new Date().toISOString() };
      
      console.log('🌐 URL:', url);
      console.log('📦 Payload:', payload);
      console.log('🔑 Headers:', this.getHeaders());
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', response.status, errorData);
        throw new Error(`Erro ao atualizar medicamento: ${response.status}`);
      }
      
      console.log('✅ Medicamento atualizado com sucesso no banco');
      
      // Aguardar um pouco para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Buscar o registro atualizado separadamente da view
      const updatedRecord = await this.getById(id);
      if (!updatedRecord) {
        console.warn('⚠️ Não foi possível recuperar o registro atualizado, retornando dados originais + updates');
        // Se não conseguir buscar, retorna uma versão "simulada" do objeto atualizado
        return {
          id,
          ...medicamento,
          updated_at: new Date().toISOString()
        } as Medicamento;
      }
      
      console.log('✅ Registro atualizado recuperado:', updatedRecord);
      return updatedRecord;
    } catch (error) {
      console.error('❌ Erro ao atualizar medicamento:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      console.log('🗑️ Iniciando soft delete do medicamento:', id);
      
      // Fazer soft delete na tabela medicamentos usando fetch direto
      const url = `${SUPABASE_ENDPOINTS.rest}/medicamentos?id=eq.${id}`;
      const payload = {
        deleted_at: new Date().toISOString()
      };
      
      console.log('🌐 URL:', url);
      console.log('📦 Payload:', payload);
      console.log('🔑 Headers:', this.getHeaders());
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', response.status, errorData);
        throw new Error(`Erro ao excluir medicamento: ${response.status}`);
      }
      
      console.log('✅ Medicamento marcado como deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao excluir medicamento:', error);
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
      // Buscar na tabela medicamentos_active
      const { data, error } = await supabase
        .from('medicamentos_active')
        .select('*')
        .or(`nome_dcb.ilike.%${query}%,nome_dci.ilike.%${query}%,codigo_interno.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao pesquisar medicamentos:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao pesquisar medicamentos:', error);
      // Buscar nos dados mock como fallback
      const lowerQuery = query.toLowerCase();
      return this.mockData.filter(item => 
        (item.nome_dcb?.toLowerCase().includes(lowerQuery)) ||
        (item.nome_dci?.toLowerCase().includes(lowerQuery)) ||
        (item.codigo_interno?.toLowerCase().includes(lowerQuery))
      );
    }
  }

  // 💊 Buscar medicamentos ativos para seleção no formulário de munícipe
  async searchMedicamentosAtivos(query: string): Promise<{ id: string; nome_dcb: string }[]> {
    try {
      const { data, error } = await supabase
        .from('medicamentos_active') // ✅ CORREÇÃO: usar medicamentos_active
        .select('id, nome_dcb')
        .eq('status', 'ATIVO')
        .is('deleted_at', null) // ✅ CORREÇÃO: filtrar deleted_at=null
        .ilike('nome_dcb', `%${query}%`)
        .order('nome_dcb', { ascending: true })
        .limit(10); // Limitar a 10 resultados para performance

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar medicamentos ativos:', error);
      throw error;
    }
  }

  // 💊 Buscar todos os medicamentos ativos (para carregar inicialmente)
  async getMedicamentosAtivos(): Promise<{ id: string; nome_dcb: string }[]> {
    try {
      const { data, error } = await supabase
        .from('medicamentos_active') // ✅ CORREÇÃO: usar medicamentos_active
        .select('id, nome_dcb')
        .eq('status', 'ATIVO')
        .is('deleted_at', null) // ✅ CORREÇÃO: filtrar deleted_at=null
        .order('nome_dcb', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar medicamentos ativos:', error);
      throw error;
    }
  }
}

export const medicamentosService = new MedicamentosService();

import { authService } from './auth';
import { Municipe } from '../types';
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase';

export interface MunicipeResponse {
  data: Municipe[];
  count: number;
  hasMore: boolean;
}

class MunicipeService {
  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    return getSupabaseHeaders(accessToken || undefined);
  }

  async getMunicipes(
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ): Promise<MunicipeResponse> {
    try {
      console.log('🔍 MunicipeService: Buscando munícipes', { 
        page, 
        limit, 
        search,
        searchType: typeof search,
        searchLength: search ? search.length : 0
      });

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir URL com parâmetros de paginação
      let url = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo`;
      const params = new URLSearchParams({
        select: '*',
        limit: limit.toString(),
        offset: offset.toString(),
        order: 'nome_completo.asc'
      });

      // Adicionar filtro de busca se fornecido
      if (search && search.trim()) {
        const trimmedSearch = search.trim();
        console.log('🔍 MunicipeService: Aplicando filtro de busca:', trimmedSearch);
        // Buscar por nome_completo, CPF ou cartão SUS
        params.append('or', `(nome_completo.ilike.*${trimmedSearch}*,cpf.ilike.*${trimmedSearch}*,cartao_sus.ilike.*${trimmedSearch}*)`);
      }

      url += `?${params.toString()}`;

      console.log('🌐 MunicipeService: URL da requisição:', url);
      console.log('🔍 MunicipeService: Termo de busca:', search);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ MunicipeService: Erro na requisição:', response.status, errorData);
        throw new Error(`Erro ao buscar munícipes: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ MunicipeService: Dados recebidos:', data);

      // Obter contagem total para paginação
      let countUrl = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?select=count`;
      if (search && search.trim()) {
        countUrl += `&or=(nome_completo.ilike.*${search.trim()}*,cpf.ilike.*${search.trim()}*,cartao_sus.ilike.*${search.trim()}*)`;
      }
      
      console.log('🔢 MunicipeService: URL de contagem:', countUrl);
      
      const countResponse = await fetch(countUrl, {
        method: 'GET',
        headers: { ...this.getHeaders(), 'Prefer': 'count=exact' }
      });

      let totalCount = 0;
      if (countResponse.ok) {
        const countHeader = countResponse.headers.get('Content-Range');
        if (countHeader) {
          const match = countHeader.match(/\/(\d+)$/);
          if (match) {
            totalCount = parseInt(match[1], 10);
          }
        }
      }

      const hasMore = (offset + data.length) < totalCount;

      return {
        data: data || [],
        count: totalCount,
        hasMore
      };

    } catch (error) {
      console.error('❌ MunicipeService: Erro ao buscar munícipes:', error);
      throw error;
    }
  }

  async getMunicipeById(id: string): Promise<Municipe> {
    try {
      console.log('🔍 MunicipeService: Buscando munícipe por ID:', id);

      // Agora usa a view completa que já tem todos os dados de endereço e saúde
      const url = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?id=eq.${id}&select=*`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar munícipe: ${response.status}`);
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error('Munícipe não encontrado');
      }

      const municipe = data[0];
      console.log('✅ MunicipeService: Munícipe completo encontrado:', municipe);
      return municipe;
    } catch (error) {
      console.error('❌ MunicipeService: Erro ao buscar munícipe:', error);
      throw error;
    }
  }

  async createMunicipe(data: Omit<Municipe, 'id' | 'created_at' | 'updated_at'>): Promise<Municipe> {
    try {
      console.log('➕ MunicipeService: Criando munícipe:', data);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/municipes`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ MunicipeService: Erro ao criar:', response.status, errorData);
        throw new Error(`Erro ao criar munícipe: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ MunicipeService: Munícipe criado:', result);

      return result[0];
    } catch (error) {
      console.error('❌ MunicipeService: Erro ao criar munícipe:', error);
      throw error;
    }
  }

  async updateMunicipe(id: string, data: Partial<Municipe>): Promise<Municipe> {
    try {
      console.log('✏️ MunicipeService: Atualizando munícipe:', id, data);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/municipes?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({
          ...data,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ MunicipeService: Erro ao atualizar:', response.status, errorData);
        throw new Error(`Erro ao atualizar munícipe: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ MunicipeService: Munícipe atualizado:', result);

      return result[0];
    } catch (error) {
      console.error('❌ MunicipeService: Erro ao atualizar munícipe:', error);
      throw error;
    }
  }

  async deleteMunicipe(id: string): Promise<void> {
    try {
      console.log('🗑️ MunicipeService: Deletando munícipe:', id);

      const url = `${SUPABASE_ENDPOINTS.rest}/municipes_active?id=eq.${id}`;
      console.log('🌐 MunicipeService: URL PATCH (soft delete):', url);
      
      const headers = this.getHeaders();
      console.log('🔑 MunicipeService: Headers PATCH:', headers);

      // Soft delete - marca como deletado usando endpoint municipes_active
      const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          deleted_at: 'now()'
        })
      });

      console.log('📡 MunicipeService: Response status:', response.status);
      console.log('📡 MunicipeService: Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ MunicipeService: Error response data:', errorData);
        } catch (parseError) {
          console.error('❌ MunicipeService: Erro ao fazer parse do erro:', parseError);
          errorData = { message: 'Erro desconhecido na resposta do servidor' };
        }
        
        const errorMessage = errorData?.message || errorData?.error?.message || `HTTP ${response.status}`;
        throw new Error(`Erro ao deletar munícipe: ${errorMessage}`);
      }

      const responseText = await response.text();
      console.log('📄 MunicipeService: Response text:', responseText);
      console.log('✅ MunicipeService: Munícipe marcado como deletado com sucesso');
    } catch (error) {
      console.error('❌ MunicipeService: Erro ao deletar munícipe:', error);
      throw error;
    }
  }
}

export const municipeService = new MunicipeService();


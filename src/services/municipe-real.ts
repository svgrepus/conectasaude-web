import type { Municipe, PaginatedResponse, ApiResponse, ApiArrayResponse } from '../types';
import { authService } from './auth';
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase';

const getHeaders = (): Record<string, string> => {
  const accessToken = authService.getAccessToken();
  return getSupabaseHeaders(accessToken || undefined);
};

export class MunicipeService {
  
  static async getAllMunicipes(page = 1, limit = 10): Promise<PaginatedResponse<Municipe>> {
    try {
      const offset = (page - 1) * limit;
      const url = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?select=*&limit=${limit}&offset=${offset}&order=nome_completo.asc`;
      
      console.log('🔍 Buscando munícipes na API:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Buscar contagem total
      const countResponse = await fetch(`${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?select=count`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Prefer': 'count=exact',
        },
      });

      let totalCount = 0;
      if (countResponse.ok) {
        const countHeader = countResponse.headers.get('content-range');
        if (countHeader) {
          const match = countHeader.match(/\/(\d+)$/);
          totalCount = match ? parseInt(match[1]) : 0;
        }
      }

      console.log('✅ Dados recebidos da API:', { data, totalCount });

      return {
        data: data || [],
        count: totalCount,
        page,
        limit,
        total_pages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      console.error('❌ Erro ao buscar munícipes:', error);
      return {
        data: [],
        count: 0,
        page,
        limit,
        total_pages: 0,
      };
    }
  }

  static async getMunicipeById(id: string): Promise<ApiResponse<Municipe>> {
    try {
      console.log('🔍 Buscando munícipe por ID:', id);
      
      // Usar a view completa que já tem todos os dados de endereço e saúde
      const municipeUrl = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?select=*&id=eq.${id}`;
      const municipeResponse = await fetch(municipeUrl, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!municipeResponse.ok) {
        throw new Error(`HTTP error! status: ${municipeResponse.status}`);
      }

      const municipeData = await municipeResponse.json();
      
      if (!municipeData || municipeData.length === 0) {
        return { data: null, error: 'Munícipe não encontrado' };
      }

      const finalData = municipeData[0];
      console.log('✅ Dados completos do munícipe:', finalData);

      return { data: finalData };
    } catch (error) {
      console.error('❌ Erro ao buscar munícipe por ID:', error);
      return { data: null, error: `Error fetching municipe: ${error}` };
    }
  }

  static async searchMunicipes(query: string): Promise<ApiArrayResponse<Municipe>> {
    try {
      console.log('🔍 Buscando munícipes com query:', query);
      
      // Buscar por nome_completo ou CPF
      const url = `${SUPABASE_ENDPOINTS.rest}/vw_municipes_completo?select=*&or=(nome_completo.ilike.*${query}*,cpf.like.*${query}*)&order=nome_completo.asc`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ Resultados da busca:', data);

      return { data: data || [] };
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      return { data: [], error: `Error searching municipes: ${error}` };
    }
  }

  static async createMunicipe(municipe: Omit<Municipe, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Municipe>> {
    try {
      const url = `${SUPABASE_ENDPOINTS.rest}/municipes`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(municipe),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return { data: data[0] };
    } catch (error) {
      console.error('❌ Erro ao criar munícipe:', error);
      return { data: null, error: `Error creating municipe: ${error}` };
    }
  }

  static async updateMunicipe(id: string, updates: Partial<Municipe>): Promise<ApiResponse<Municipe>> {
    try {
      const url = `${SUPABASE_ENDPOINTS.rest}/municipes?id=eq.${id}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return { data: data[0] };
    } catch (error) {
      console.error('❌ Erro ao atualizar munícipe:', error);
      return { data: null, error: `Error updating municipe: ${error}` };
    }
  }

  static async deleteMunicipe(id: string): Promise<ApiResponse<boolean>> {
    try {
      const url = `${SUPABASE_ENDPOINTS.rest}/municipes?id=eq.${id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { data: true };
    } catch (error) {
      console.error('❌ Erro ao excluir munícipe:', error);
      return { data: false, error: `Error deleting municipe: ${error}` };
    }
  }
}

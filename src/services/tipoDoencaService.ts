import { authService } from './auth';
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase';

export interface TipoDoenca {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TipoDoencaResponse {
  data: TipoDoenca[];
  count: number;
  hasMore: boolean;
}

class TipoDoencaService {
  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    return getSupabaseHeaders(accessToken || undefined);
  }

  async getTiposDoenca(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<TipoDoencaResponse> {
    try {
      console.log('🔍 TipoDoencaService: Buscando tipos de doença', { 
        page, 
        limit, 
        search,
        searchType: typeof search,
        searchLength: search ? search.length : 0
      });

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir URL com parâmetros de paginação
      let url = `${SUPABASE_ENDPOINTS.rest}/basic_health_disease_types_active`;
      const params = new URLSearchParams({
        select: '*',
        limit: limit.toString(),
        offset: offset.toString(),
        order: 'name.asc'
      });

      // Adicionar filtro de busca se fornecido
      if (search && search.trim()) {
        const trimmedSearch = search.trim();
        console.log('🔍 TipoDoencaService: Aplicando filtro de busca:', trimmedSearch);
        params.append('or', `(name.ilike.*${trimmedSearch}*,description.ilike.*${trimmedSearch}*)`);
      }

      url += `?${params.toString()}`;
      console.log('🌐 TipoDoencaService: URL completa:', url);

      const headers = this.getHeaders();
      console.log('🔑 TipoDoencaService: Headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      console.log('📡 TipoDoencaService: Response status:', response.status);
      console.log('📡 TipoDoencaService: Response headers:', response.headers);

      if (!response.ok) {
        console.error('❌ TipoDoencaService: Erro na resposta:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TipoDoenca[] = await response.json();
      console.log('📦 TipoDoencaService: Dados recebidos:', data);

      // Contar total de registros (sem paginação)
      const countUrl = `${SUPABASE_ENDPOINTS.rest}/basic_health_disease_types_active?select=count${search ? `&or=(name.ilike.*${search.trim()}*,description.ilike.*${search.trim()}*)` : ''}`;
      const countResponse = await fetch(countUrl, {
        method: 'GET',
        headers: { ...headers, 'Prefer': 'count=exact' }
      });

      let totalCount = 0;
      if (countResponse.ok) {
        const countHeader = countResponse.headers.get('content-range');
        if (countHeader) {
          const match = countHeader.match(/\/(\d+)$/);
          if (match) {
            totalCount = parseInt(match[1], 10);
          }
        }
      }

      console.log('📊 TipoDoencaService: Total de registros:', totalCount);

      return {
        data,
        count: totalCount,
        hasMore: (page * limit) < totalCount
      };
    } catch (error) {
      console.error('❌ TipoDoencaService: Erro ao buscar tipos de doença:', error);
      throw error;
    }
  }

  async createTipoDoenca(data: Pick<TipoDoenca, 'name' | 'description'>): Promise<TipoDoenca> {
    try {
      console.log('➕ TipoDoencaService: Criando tipo de doença:', data);

      const url = `${SUPABASE_ENDPOINTS.rest}/basic_health_disease_types_active`;
      const headers = this.getHeaders();

      const response = await fetch(url, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });

      console.log('📡 TipoDoencaService: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ TipoDoencaService: Erro ao criar:', errorData);
        throw new Error(`Erro ao criar tipo de doença: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ TipoDoencaService: Tipo de doença criado:', result);

      return result[0];
    } catch (error) {
      console.error('❌ TipoDoencaService: Erro ao criar tipo de doença:', error);
      throw error;
    }
  }

  async updateTipoDoenca(id: number, data: Pick<TipoDoenca, 'name' | 'description'>): Promise<TipoDoenca> {
    try {
      console.log('✏️ TipoDoencaService: Atualizando tipo de doença:', id, data);

      const url = `${SUPABASE_ENDPOINTS.rest}/basic_health_disease_types_active?id=eq.${id}`;
      const headers = this.getHeaders();

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });

      console.log('📡 TipoDoencaService: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ TipoDoencaService: Erro ao atualizar:', errorData);
        throw new Error(`Erro ao atualizar tipo de doença: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ TipoDoencaService: Tipo de doença atualizado:', result);

      return result[0];
    } catch (error) {
      console.error('❌ TipoDoencaService: Erro ao atualizar tipo de doença:', error);
      throw error;
    }
  }

  async deleteTipoDoenca(id: number): Promise<void> {
    try {
      console.log('🗑️ TipoDoencaService: Deletando tipo de doença:', id);

      const url = `${SUPABASE_ENDPOINTS.rest}/basic_health_disease_types_active?id=eq.${id}`;
      console.log('🌐 TipoDoencaService: URL PATCH (soft delete):', url);
      
      const headers = this.getHeaders();
      console.log('🔑 TipoDoencaService: Headers PATCH:', headers);

      // Soft delete - marca como deletado em vez de remover
      const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          deleted_at: new Date().toISOString()
        })
      });

      console.log('📡 TipoDoencaService: Response status:', response.status);
      console.log('📡 TipoDoencaService: Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ TipoDoencaService: Error response data:', errorData);
        } catch (parseError) {
          console.error('❌ TipoDoencaService: Erro ao fazer parse do erro:', parseError);
          errorData = { message: 'Erro desconhecido na resposta do servidor' };
        }
        
        const errorMessage = errorData?.message || errorData?.error?.message || `HTTP ${response.status}`;
        throw new Error(`Erro ao deletar tipo de doença: ${errorMessage}`);
      }

      // Verificar se a resposta tem conteúdo
      const responseText = await response.text();
      console.log('📄 TipoDoencaService: Response text:', responseText);

      console.log('✅ TipoDoencaService: Tipo de doença marcado como deletado com sucesso');
    } catch (error) {
      console.error('❌ TipoDoencaService: Erro ao deletar tipo de doença:', error);
      throw error;
    }
  }
}

export const tipoDoencaService = new TipoDoencaService();


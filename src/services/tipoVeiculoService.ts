import { authService } from './auth';
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase';

export interface TipoVeiculo {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TipoVeiculoResponse {
  data: TipoVeiculo[];
  count: number;
  hasMore: boolean;
}

class TipoVeiculoService {
  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    return getSupabaseHeaders(accessToken || undefined);
  }

  async getTiposVeiculo(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<TipoVeiculoResponse> {
    try {
      console.log('🔍 TipoVeiculoService: Buscando tipos de veículo', { 
        page, 
        limit, 
        search,
        searchType: typeof search,
        searchLength: search ? search.length : 0
      });

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir URL com parâmetros de paginação
      let url = `${SUPABASE_ENDPOINTS.rest}/basic_vehicle_types_active`;
      const params = new URLSearchParams({
        select: '*',
        limit: limit.toString(),
        offset: offset.toString(),
        order: 'name.asc'
      });

      // Adicionar filtro de busca se fornecido
      if (search && search.trim()) {
        const trimmedSearch = search.trim();
        console.log('🔍 TipoVeiculoService: Aplicando filtro de busca:', trimmedSearch);
        params.append('or', `(name.ilike.*${trimmedSearch}*,description.ilike.*${trimmedSearch}*)`);
      }

      url += `?${params.toString()}`;
      console.log('🌐 TipoVeiculoService: URL completa:', url);

      const headers = this.getHeaders();
      console.log('🔑 TipoVeiculoService: Headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      console.log('📡 TipoVeiculoService: Response status:', response.status);
      console.log('📡 TipoVeiculoService: Response headers:', response.headers);

      if (!response.ok) {
        console.error('❌ TipoVeiculoService: Erro na resposta:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TipoVeiculo[] = await response.json();
      console.log('📦 TipoVeiculoService: Dados recebidos:', data);

      // Contar total de registros (sem paginação)
      const countUrl = `${SUPABASE_ENDPOINTS.rest}/basic_vehicle_types_active?select=count${search ? `&or=(name.ilike.*${search.trim()}*,description.ilike.*${search.trim()}*)` : ''}`;
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

      console.log('📊 TipoVeiculoService: Total de registros:', totalCount);

      return {
        data,
        count: totalCount,
        hasMore: (page * limit) < totalCount
      };
    } catch (error) {
      console.error('❌ TipoVeiculoService: Erro ao buscar tipos de veículo:', error);
      throw error;
    }
  }

  async createTipoVeiculo(data: Pick<TipoVeiculo, 'name' | 'description'>): Promise<TipoVeiculo> {
    try {
      console.log('➕ TipoVeiculoService: Criando tipo de veículo:', data);

      const url = `${SUPABASE_ENDPOINTS.rest}/basic_vehicle_types_active`;
      const headers = this.getHeaders();

      const response = await fetch(url, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });

      console.log('📡 TipoVeiculoService: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ TipoVeiculoService: Erro ao criar:', errorData);
        throw new Error(`Erro ao criar tipo de veículo: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ TipoVeiculoService: Tipo de veículo criado:', result);

      return result[0];
    } catch (error) {
      console.error('❌ TipoVeiculoService: Erro ao criar tipo de veículo:', error);
      throw error;
    }
  }

  async updateTipoVeiculo(id: number, data: Pick<TipoVeiculo, 'name' | 'description'>): Promise<TipoVeiculo> {
    try {
      console.log('✏️ TipoVeiculoService: Atualizando tipo de veículo:', id, data);

      const url = `${SUPABASE_ENDPOINTS.rest}/basic_vehicle_types_active?id=eq.${id}`;
      const headers = this.getHeaders();

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });

      console.log('📡 TipoVeiculoService: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ TipoVeiculoService: Erro ao atualizar:', errorData);
        throw new Error(`Erro ao atualizar tipo de veículo: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ TipoVeiculoService: Tipo de veículo atualizado:', result);

      return result[0];
    } catch (error) {
      console.error('❌ TipoVeiculoService: Erro ao atualizar tipo de veículo:', error);
      throw error;
    }
  }

  async deleteTipoVeiculo(id: number): Promise<void> {
    try {
      console.log('🗑️ TipoVeiculoService: Deletando tipo de veículo:', id);

      const url = `${SUPABASE_ENDPOINTS.rest}/basic_vehicle_types_active?id=eq.${id}`;
      console.log('🌐 TipoVeiculoService: URL PATCH (soft delete):', url);
      
      const headers = this.getHeaders();
      console.log('🔑 TipoVeiculoService: Headers PATCH:', headers);

      // Soft delete - marca como deletado em vez de remover
      const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          deleted_at: new Date().toISOString()
        })
      });

      console.log('📡 TipoVeiculoService: Response status:', response.status);
      console.log('📡 TipoVeiculoService: Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ TipoVeiculoService: Error response data:', errorData);
        } catch (parseError) {
          console.error('❌ TipoVeiculoService: Erro ao fazer parse do erro:', parseError);
          errorData = { message: 'Erro desconhecido na resposta do servidor' };
        }
        
        const errorMessage = errorData?.message || errorData?.error?.message || `HTTP ${response.status}`;
        throw new Error(`Erro ao deletar tipo de veículo: ${errorMessage}`);
      }

      // Verificar se a resposta tem conteúdo
      const responseText = await response.text();
      console.log('📄 TipoVeiculoService: Response text:', responseText);

      console.log('✅ TipoVeiculoService: Tipo de veículo marcado como deletado com sucesso');
    } catch (error) {
      console.error('❌ TipoVeiculoService: Erro ao deletar tipo de veículo:', error);
      throw error;
    }
  }
}

export const tipoVeiculoService = new TipoVeiculoService();


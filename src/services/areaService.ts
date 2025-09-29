import { authService } from './auth';
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase';

export interface Area {
  id: string;
  nome: string;
  codigo?: string;
  unidade_id?: string;
  descricao?: string;
  populacao_estimada?: number;
  ativa: boolean;
  created_at: string;
  updated_at: string;
  // Dados da unidade relacionada
  unidade_nome?: string;
}

export interface CreateAreaData {
  nome: string;
  codigo?: string;
  unidade_id?: string;
  descricao?: string;
  populacao_estimada?: number;
  ativa?: boolean;
}

export interface UpdateAreaData {
  nome?: string;
  codigo?: string;
  unidade_id?: string;
  descricao?: string;
  populacao_estimada?: number;
  ativa?: boolean;
}

class AreaService {
  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    return getSupabaseHeaders(accessToken || undefined);
  }

  // Buscar áreas com paginação e filtro
  async getAreas(page: number = 1, limit: number = 10, search?: string) {
    try {
      console.log('🔍 AreaService: Buscando áreas', { page, limit, search });

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir URL com parâmetros de paginação (com join da unidade)
      let url = `${SUPABASE_ENDPOINTS.rest}/basic_health_areas_active`;
      const params = new URLSearchParams({
        select: '*, basic_health_units(nome)',
        deleted_at: 'is.null',
        limit: limit.toString(),
        offset: offset.toString(),
        order: 'created_at.desc'
      });

      // Adicionar filtro de busca se fornecido
      if (search && search.trim()) {
        const trimmedSearch = search.trim();
        console.log('🔍 AreaService: Aplicando filtro de busca:', trimmedSearch);
        params.append('or', `(nome.ilike.*${trimmedSearch}*,codigo.ilike.*${trimmedSearch}*,descricao.ilike.*${trimmedSearch}*)`);
      }

      url += `?${params.toString()}`;

      console.log('🌐 AreaService: URL da requisição:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ AreaService: Erro na requisição:', response.status, errorData);
        throw new Error(`Erro ao buscar áreas: ${response.status}`);
      }

      const data = await response.json();
      
      // Transformar dados para incluir nome da unidade
      const transformedData = data.map((area: any) => ({
        ...area,
        unidade_nome: area.basic_health_units?.nome || '-'
      }));
      
      console.log('✅ AreaService: Dados recebidos:', transformedData);

      // Obter contagem total para paginação
      let countUrl = `${SUPABASE_ENDPOINTS.rest}/basic_health_areas_active?select=count&deleted_at=is.null`;
      if (search && search.trim()) {
        countUrl += `&or=(nome.ilike.*${search.trim()}*,codigo.ilike.*${search.trim()}*,descricao.ilike.*${search.trim()}*)`;
      }
      
      console.log('🔢 AreaService: URL de contagem:', countUrl);
      
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

      return { data: transformedData || [], count: totalCount };
    } catch (error) {
      console.error('❌ AreaService.getAreas - Erro:', error);
      throw error;
    }
  }

  // Criar nova área
  async createArea(data: CreateAreaData): Promise<Area> {
    try {
      console.log('➕ AreaService: Criando área', data);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_areas_active`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({
          nome: data.nome,
          codigo: data.codigo || null,
          unidade_id: data.unidade_id || null,
          descricao: data.descricao || null,
          populacao_estimada: data.populacao_estimada || null,
          ativa: data.ativa !== undefined ? data.ativa : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ AreaService: Erro ao criar:', response.status, errorData);
        throw new Error(`Erro ao criar área: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ AreaService: Área criada:', result);

      return result[0];
    } catch (error) {
      console.error('❌ AreaService.createArea - Erro:', error);
      throw error;
    }
  }

  // Atualizar área
  async updateArea(id: string, data: UpdateAreaData): Promise<Area> {
    try {
      console.log('✏️ AreaService: Atualizando área', { id, data });

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.codigo !== undefined) updateData.codigo = data.codigo || null;
      if (data.unidade_id !== undefined) updateData.unidade_id = data.unidade_id || null;
      if (data.descricao !== undefined) updateData.descricao = data.descricao || null;
      if (data.populacao_estimada !== undefined) updateData.populacao_estimada = data.populacao_estimada || null;
      if (data.ativa !== undefined) updateData.ativa = data.ativa;

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_areas_active?id=eq.${id}&deleted_at=is.null`, {
        method: 'PATCH',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ AreaService: Erro ao atualizar:', response.status, errorData);
        throw new Error(`Erro ao atualizar área: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ AreaService: Área atualizada:', result);

      return result[0];
    } catch (error) {
      console.error('❌ AreaService.updateArea - Erro:', error);
      throw error;
    }
  }

  // Excluir área (soft delete)
  async deleteArea(id: string): Promise<void> {
    try {
      console.log('🗑️ AreaService: Excluindo área', id);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_areas_active?id=eq.${id}&deleted_at=is.null`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ AreaService: Erro ao excluir:', response.status, errorData);
        throw new Error(`Erro ao excluir área: ${response.status}`);
      }

      console.log('✅ AreaService: Área excluída com sucesso');
    } catch (error) {
      console.error('❌ AreaService.deleteArea - Erro:', error);
      throw error;
    }
  }

  // Buscar todas as áreas ativas (para uso em combos)
  async getAreasAtivas(): Promise<Area[]> {
    try {
      console.log('🔍 AreaService: Buscando áreas ativas');

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_areas_active?ativa=eq.true&deleted_at=is.null&order=nome.asc`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('❌ AreaService: Erro ao buscar áreas ativas:', response.status);
        throw new Error(`Erro ao buscar áreas ativas: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ AreaService: Áreas ativas encontradas:', data?.length);
      return data || [];
    } catch (error) {
      console.error('❌ AreaService.getAreasAtivas - Erro:', error);
      throw error;
    }
  }

  // Buscar áreas por unidade
  async getAreasByUnidade(unidadeId: string): Promise<Area[]> {
    try {
      console.log('🔍 AreaService: Buscando áreas por unidade', unidadeId);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_areas_active?unidade_id=eq.${unidadeId}&ativa=eq.true&deleted_at=is.null&order=nome.asc`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('❌ AreaService: Erro ao buscar áreas por unidade:', response.status);
        throw new Error(`Erro ao buscar áreas: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ AreaService: Áreas da unidade encontradas:', data?.length);
      return data || [];
    } catch (error) {
      console.error('❌ AreaService.getAreasByUnidade - Erro:', error);
      throw error;
    }
  }
}

export const areaService = new AreaService();
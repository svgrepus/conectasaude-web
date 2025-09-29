import { authService } from './auth';
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase';

export interface Microarea {
  id: string;
  nome: string;
  codigo?: string;
  area_id: string;
  equipe_id?: string;
  descricao?: string;
  familias_cadastradas: number;
  pessoas_cadastradas: number;
  ativa: boolean;
  created_at: string;
  updated_at: string;
  // Dados das tabelas relacionadas
  area_nome?: string;
  equipe_nome?: string;
}

export interface CreateMicroareaData {
  nome: string;
  codigo?: string;
  area_id: string;
  equipe_id?: string;
  descricao?: string;
  familias_cadastradas?: number;
  pessoas_cadastradas?: number;
  ativa?: boolean;
}

export interface UpdateMicroareaData {
  nome?: string;
  codigo?: string;
  area_id?: string;
  equipe_id?: string;
  descricao?: string;
  familias_cadastradas?: number;
  pessoas_cadastradas?: number;
  ativa?: boolean;
}

class MicroareaService {
  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    return getSupabaseHeaders(accessToken || undefined);
  }

  // Buscar microáreas com paginação e filtro
  async getMicroareas(page: number = 1, limit: number = 10, search?: string) {
    try {
      console.log('🔍 MicroareaService: Buscando microáreas', { page, limit, search });

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir URL com parâmetros de paginação (com join das tabelas relacionadas)
      let url = `${SUPABASE_ENDPOINTS.rest}/basic_health_microareas_active`;
      const params = new URLSearchParams({
        select: '*, basic_health_areas(nome), basic_health_teams(nome)',
        deleted_at: 'is.null',
        limit: limit.toString(),
        offset: offset.toString(),
        order: 'created_at.desc'
      });

      // Adicionar filtro de busca se fornecido
      if (search && search.trim()) {
        const trimmedSearch = search.trim();
        console.log('🔍 MicroareaService: Aplicando filtro de busca:', trimmedSearch);
        params.append('or', `(nome.ilike.*${trimmedSearch}*,codigo.ilike.*${trimmedSearch}*,descricao.ilike.*${trimmedSearch}*)`);
      }

      url += `?${params.toString()}`;

      console.log('🌐 MicroareaService: URL da requisição:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ MicroareaService: Erro na requisição:', response.status, errorData);
        throw new Error(`Erro ao buscar microáreas: ${response.status}`);
      }

      const data = await response.json();
      
      // Transformar dados para incluir nomes das tabelas relacionadas
      const transformedData = data.map((microarea: any) => ({
        ...microarea,
        area_nome: microarea.basic_health_areas?.nome || '-',
        equipe_nome: microarea.basic_health_teams?.nome || '-'
      }));
      
      console.log('✅ MicroareaService: Dados recebidos:', transformedData);

      // Obter contagem total para paginação
      let countUrl = `${SUPABASE_ENDPOINTS.rest}/basic_health_microareas_active?select=count&deleted_at=is.null`;
      if (search && search.trim()) {
        countUrl += `&or=(nome.ilike.*${search.trim()}*,codigo.ilike.*${search.trim()}*,descricao.ilike.*${search.trim()}*)`;
      }
      
      console.log('🔢 MicroareaService: URL de contagem:', countUrl);
      
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
      console.error('❌ MicroareaService.getMicroareas - Erro:', error);
      throw error;
    }
  }

  // Criar nova microárea
  async createMicroarea(data: CreateMicroareaData): Promise<Microarea> {
    try {
      console.log('➕ MicroareaService: Criando microárea', data);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_microareas_active`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({
          nome: data.nome,
          codigo: data.codigo || null,
          area_id: data.area_id,
          equipe_id: data.equipe_id || null,
          descricao: data.descricao || null,
          familias_cadastradas: data.familias_cadastradas || 0,
          pessoas_cadastradas: data.pessoas_cadastradas || 0,
          ativa: data.ativa !== undefined ? data.ativa : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ MicroareaService: Erro ao criar:', response.status, errorData);
        throw new Error(`Erro ao criar microárea: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ MicroareaService: Microárea criada:', result);

      return result[0];
    } catch (error) {
      console.error('❌ MicroareaService.createMicroarea - Erro:', error);
      throw error;
    }
  }

  // Atualizar microárea
  async updateMicroarea(id: string, data: UpdateMicroareaData): Promise<Microarea> {
    try {
      console.log('✏️ MicroareaService: Atualizando microárea', { id, data });

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.codigo !== undefined) updateData.codigo = data.codigo || null;
      if (data.area_id !== undefined) updateData.area_id = data.area_id;
      if (data.equipe_id !== undefined) updateData.equipe_id = data.equipe_id || null;
      if (data.descricao !== undefined) updateData.descricao = data.descricao || null;
      if (data.familias_cadastradas !== undefined) updateData.familias_cadastradas = data.familias_cadastradas || 0;
      if (data.pessoas_cadastradas !== undefined) updateData.pessoas_cadastradas = data.pessoas_cadastradas || 0;
      if (data.ativa !== undefined) updateData.ativa = data.ativa;

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_microareas_active?id=eq.${id}&deleted_at=is.null`, {
        method: 'PATCH',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ MicroareaService: Erro ao atualizar:', response.status, errorData);
        throw new Error(`Erro ao atualizar microárea: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ MicroareaService: Microárea atualizada:', result);

      return result[0];
    } catch (error) {
      console.error('❌ MicroareaService.updateMicroarea - Erro:', error);
      throw error;
    }
  }

  // Excluir microárea (soft delete)
  async deleteMicroarea(id: string): Promise<void> {
    try {
      console.log('🗑️ MicroareaService: Excluindo microárea', id);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_microareas_active?id=eq.${id}&deleted_at=is.null`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ MicroareaService: Erro ao excluir:', response.status, errorData);
        throw new Error(`Erro ao excluir microárea: ${response.status}`);
      }

      console.log('✅ MicroareaService: Microárea excluída com sucesso');
    } catch (error) {
      console.error('❌ MicroareaService.deleteMicroarea - Erro:', error);
      throw error;
    }
  }

  // Buscar todas as microáreas ativas (para uso em combos)
  async getMicroareasAtivas(): Promise<Microarea[]> {
    try {
      console.log('🔍 MicroareaService: Buscando microáreas ativas');

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_microareas_active?ativa=eq.true&deleted_at=is.null&order=nome.asc`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('❌ MicroareaService: Erro ao buscar microáreas ativas:', response.status);
        throw new Error(`Erro ao buscar microáreas ativas: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ MicroareaService: Microáreas ativas encontradas:', data?.length);
      return data || [];
    } catch (error) {
      console.error('❌ MicroareaService.getMicroareasAtivas - Erro:', error);
      throw error;
    }
  }

  // Buscar microáreas por área
  async getMicroareasByArea(areaId: string): Promise<Microarea[]> {
    try {
      console.log('🔍 MicroareaService: Buscando microáreas por área', areaId);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_microareas_active?area_id=eq.${areaId}&ativa=eq.true&deleted_at=is.null&order=nome.asc`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('❌ MicroareaService: Erro ao buscar microáreas por área:', response.status);
        throw new Error(`Erro ao buscar microáreas: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ MicroareaService: Microáreas da área encontradas:', data?.length);
      return data || [];
    } catch (error) {
      console.error('❌ MicroareaService.getMicroareasByArea - Erro:', error);
      throw error;
    }
  }
}

export const microareaService = new MicroareaService();
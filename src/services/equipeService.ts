import { authService } from './auth';
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase';

export interface Equipe {
  id: string;
  nome: string;
  codigo?: string;
  descricao?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEquipeData {
  nome: string;
  codigo?: string;
  descricao?: string;
  ativa?: boolean;
}

export interface UpdateEquipeData {
  nome?: string;
  codigo?: string;
  descricao?: string;
  ativa?: boolean;
}

class EquipeService {
  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    return getSupabaseHeaders(accessToken || undefined);
  }

  // Buscar equipes com paginação e filtro
  async getEquipes(page: number = 1, limit: number = 10, search?: string) {
    try {
      console.log('🔍 EquipeService: Buscando equipes', { page, limit, search });

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir URL com parâmetros de paginação
      let url = `${SUPABASE_ENDPOINTS.rest}/basic_health_teams_active`;
      const params = new URLSearchParams({
        select: '*',
        deleted_at: 'is.null',
        limit: limit.toString(),
        offset: offset.toString(),
        order: 'created_at.desc'
      });

      // Adicionar filtro de busca se fornecido
      if (search && search.trim()) {
        const trimmedSearch = search.trim();
        console.log('🔍 EquipeService: Aplicando filtro de busca:', trimmedSearch);
        params.append('or', `(nome.ilike.*${trimmedSearch}*,codigo.ilike.*${trimmedSearch}*,descricao.ilike.*${trimmedSearch}*)`);
      }

      url += `?${params.toString()}`;

      console.log('🌐 EquipeService: URL da requisição:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ EquipeService: Erro na requisição:', response.status, errorData);
        throw new Error(`Erro ao buscar equipes: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ EquipeService: Dados recebidos:', data);

      // Obter contagem total para paginação
      let countUrl = `${SUPABASE_ENDPOINTS.rest}/basic_health_teams_active?select=count&deleted_at=is.null`;
      if (search && search.trim()) {
        countUrl += `&or=(nome.ilike.*${search.trim()}*,codigo.ilike.*${search.trim()}*,descricao.ilike.*${search.trim()}*)`;
      }
      
      console.log('🔢 EquipeService: URL de contagem:', countUrl);
      
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

      return { data: data || [], count: totalCount };
    } catch (error) {
      console.error('❌ EquipeService.getEquipes - Erro:', error);
      throw error;
    }
  }

  // Criar nova equipe
  async createEquipe(data: CreateEquipeData): Promise<Equipe> {
    try {
      console.log('➕ EquipeService: Criando equipe', data);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_teams_active`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({
          nome: data.nome,
          codigo: data.codigo || null,
          descricao: data.descricao || null,
          ativa: data.ativa !== undefined ? data.ativa : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ EquipeService: Erro ao criar:', response.status, errorData);
        throw new Error(`Erro ao criar equipe: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ EquipeService: Equipe criada:', result);

      return result[0];
    } catch (error) {
      console.error('❌ EquipeService.createEquipe - Erro:', error);
      throw error;
    }
  }

  // Atualizar equipe
  async updateEquipe(id: string, data: UpdateEquipeData): Promise<Equipe> {
    try {
      console.log('✏️ EquipeService: Atualizando equipe', { id, data });

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.codigo !== undefined) updateData.codigo = data.codigo || null;
      if (data.descricao !== undefined) updateData.descricao = data.descricao || null;
      if (data.ativa !== undefined) updateData.ativa = data.ativa;

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_teams_active?id=eq.${id}&deleted_at=is.null`, {
        method: 'PATCH',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ EquipeService: Erro ao atualizar:', response.status, errorData);
        throw new Error(`Erro ao atualizar equipe: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ EquipeService: Equipe atualizada:', result);

      return result[0];
    } catch (error) {
      console.error('❌ EquipeService.updateEquipe - Erro:', error);
      throw error;
    }
  }

  // Excluir equipe (soft delete)
  async deleteEquipe(id: string): Promise<void> {
    try {
      console.log('🗑️ EquipeService: Excluindo equipe', id);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_teams_active?id=eq.${id}&deleted_at=is.null`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ EquipeService: Erro ao excluir:', response.status, errorData);
        throw new Error(`Erro ao excluir equipe: ${response.status}`);
      }

      console.log('✅ EquipeService: Equipe excluída com sucesso');
    } catch (error) {
      console.error('❌ EquipeService.deleteEquipe - Erro:', error);
      throw error;
    }
  }

  // Buscar equipe por ID
  async getEquipeById(id: string): Promise<Equipe | null> {
    try {
      console.log('🔍 EquipeService: Buscando equipe por ID', id);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_teams_active?id=eq.${id}&deleted_at=is.null`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('❌ EquipeService: Erro ao buscar equipe:', response.status);
        throw new Error(`Erro ao buscar equipe: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        console.log('ℹ️ Equipe não encontrada');
        return null;
      }

      console.log('✅ EquipeService: Equipe encontrada:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ EquipeService.getEquipeById - Erro:', error);
      throw error;
    }
  }

  // Buscar todas as equipes ativas (para uso em combos)
  async getEquipesAtivas(): Promise<Equipe[]> {
    try {
      console.log('🔍 EquipeService: Buscando equipes ativas');

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_teams_active?ativa=eq.true&deleted_at=is.null&order=nome.asc`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('❌ EquipeService: Erro ao buscar equipes ativas:', response.status);
        throw new Error(`Erro ao buscar equipes ativas: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ EquipeService: Equipes ativas encontradas:', data?.length);
      return data || [];
    } catch (error) {
      console.error('❌ EquipeService.getEquipesAtivas - Erro:', error);
      throw error;
    }
  }
}

export const equipeService = new EquipeService();
import { authService } from './auth';
import { SUPABASE_ENDPOINTS, getSupabaseHeaders } from '../config/supabase';

export interface Unidade {
  id: string;
  nome: string;
  codigo_cnes?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  tipo_unidade?: 'UBS' | 'ESF' | 'HOSPITAL' | 'CLINICA' | 'CENTRO_ESPECIALIDADES' | 'OUTROS';
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUnidadeData {
  nome: string;
  codigo_cnes?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  tipo_unidade?: 'UBS' | 'ESF' | 'HOSPITAL' | 'CLINICA' | 'CENTRO_ESPECIALIDADES' | 'OUTROS';
  ativa?: boolean;
}

export interface UpdateUnidadeData {
  nome?: string;
  codigo_cnes?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  tipo_unidade?: 'UBS' | 'ESF' | 'HOSPITAL' | 'CLINICA' | 'CENTRO_ESPECIALIDADES' | 'OUTROS';
  ativa?: boolean;
}

class UnidadeService {
  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    return getSupabaseHeaders(accessToken || undefined);
  }

  // Buscar unidades com paginação e filtro
  async getUnidades(page: number = 1, limit: number = 10, search?: string) {
    try {
      console.log('🔍 UnidadeService: Buscando unidades', { page, limit, search });

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir URL com parâmetros de paginação
      let url = `${SUPABASE_ENDPOINTS.rest}/basic_health_units_active`;
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
        console.log('🔍 UnidadeService: Aplicando filtro de busca:', trimmedSearch);
        params.append('or', `(nome.ilike.*${trimmedSearch}*,codigo_cnes.ilike.*${trimmedSearch}*,endereco.ilike.*${trimmedSearch}*)`);
      }

      url += `?${params.toString()}`;

      console.log('🌐 UnidadeService: URL da requisição:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ UnidadeService: Erro na requisição:', response.status, errorData);
        throw new Error(`Erro ao buscar unidades: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ UnidadeService: Dados recebidos:', data);

      // Obter contagem total para paginação
      let countUrl = `${SUPABASE_ENDPOINTS.rest}/basic_health_units_active?select=count&deleted_at=is.null`;
      if (search && search.trim()) {
        countUrl += `&or=(nome.ilike.*${search.trim()}*,codigo_cnes.ilike.*${search.trim()}*,endereco.ilike.*${search.trim()}*)`;
      }
      
      console.log('🔢 UnidadeService: URL de contagem:', countUrl);
      
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
      console.error('❌ UnidadeService.getUnidades - Erro:', error);
      throw error;
    }
  }

  // Criar nova unidade
  async createUnidade(data: CreateUnidadeData): Promise<Unidade> {
    try {
      console.log('➕ UnidadeService: Criando unidade', data);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_units_active`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({
          nome: data.nome,
          codigo_cnes: data.codigo_cnes || null,
          endereco: data.endereco || null,
          telefone: data.telefone || null,
          email: data.email || null,
          tipo_unidade: data.tipo_unidade || null,
          ativa: data.ativa !== undefined ? data.ativa : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ UnidadeService: Erro ao criar:', response.status, errorData);
        throw new Error(`Erro ao criar unidade: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ UnidadeService: Unidade criada:', result);

      return result[0];
    } catch (error) {
      console.error('❌ UnidadeService.createUnidade - Erro:', error);
      throw error;
    }
  }

  // Atualizar unidade
  async updateUnidade(id: string, data: UpdateUnidadeData): Promise<Unidade> {
    try {
      console.log('✏️ UnidadeService: Atualizando unidade', { id, data });

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.codigo_cnes !== undefined) updateData.codigo_cnes = data.codigo_cnes || null;
      if (data.endereco !== undefined) updateData.endereco = data.endereco || null;
      if (data.telefone !== undefined) updateData.telefone = data.telefone || null;
      if (data.email !== undefined) updateData.email = data.email || null;
      if (data.tipo_unidade !== undefined) updateData.tipo_unidade = data.tipo_unidade || null;
      if (data.ativa !== undefined) updateData.ativa = data.ativa;

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_units_active?id=eq.${id}&deleted_at=is.null`, {
        method: 'PATCH',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ UnidadeService: Erro ao atualizar:', response.status, errorData);
        throw new Error(`Erro ao atualizar unidade: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ UnidadeService: Unidade atualizada:', result);

      return result[0];
    } catch (error) {
      console.error('❌ UnidadeService.updateUnidade - Erro:', error);
      throw error;
    }
  }

  // Excluir unidade (soft delete)
  async deleteUnidade(id: string): Promise<void> {
    try {
      console.log('🗑️ UnidadeService: Excluindo unidade', id);

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_units_active?id=eq.${id}&deleted_at=is.null`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ UnidadeService: Erro ao excluir:', response.status, errorData);
        throw new Error(`Erro ao excluir unidade: ${response.status}`);
      }

      console.log('✅ UnidadeService: Unidade excluída com sucesso');
    } catch (error) {
      console.error('❌ UnidadeService.deleteUnidade - Erro:', error);
      throw error;
    }
  }

  // Buscar todas as unidades ativas (para uso em combos)
  async getUnidadesAtivas(): Promise<Unidade[]> {
    try {
      console.log('🔍 UnidadeService: Buscando unidades ativas');

      const response = await fetch(`${SUPABASE_ENDPOINTS.rest}/basic_health_units_active?ativa=eq.true&deleted_at=is.null&order=nome.asc`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('❌ UnidadeService: Erro ao buscar unidades ativas:', response.status);
        throw new Error(`Erro ao buscar unidades ativas: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ UnidadeService: Unidades ativas encontradas:', data?.length);
      return data || [];
    } catch (error) {
      console.error('❌ UnidadeService.getUnidadesAtivas - Erro:', error);
      throw error;
    }
  }
}

export const unidadeService = new UnidadeService();
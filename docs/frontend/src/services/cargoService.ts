import { authService } from './auth';

export interface Cargo {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CargoResponse {
  data: Cargo[];
  count: number;
  hasMore: boolean;
}

class CargoService {
  private readonly supabaseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co';
  private readonly apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWtxanB5bnJpbmxzb2RmcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTg2MDcsImV4cCI6MjA3MjY5NDYwN30.-xJL2HTvxU0HPWLqtFAT3HQu-cTBPUqu4lzK0k8bCQM';

  private getHeaders(): Record<string, string> {
    const accessToken = authService.getAccessToken();
    const headers: Record<string, string> = {
      'apikey': this.apiKey,
      'Content-Type': 'application/json'
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  async getCargos(
    page: number = 1, 
    limit: number = 20, 
    search?: string
  ): Promise<CargoResponse> {
    try {
      console.log('🔍 CargoService: Buscando cargos', { 
        page, 
        limit, 
        search,
        searchType: typeof search,
        searchLength: search ? search.length : 0
      });

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir URL com parâmetros de paginação
      let url = `${this.supabaseUrl}/rest/v1/basic_roles_active`;
      const params = new URLSearchParams({
        select: '*',
        limit: limit.toString(),
        offset: offset.toString(),
        order: 'name.asc'
      });

      // Adicionar filtro de busca se fornecido
      if (search && search.trim()) {
        const trimmedSearch = search.trim();
        console.log('🔍 CargoService: Aplicando filtro de busca:', trimmedSearch);
        params.append('name', `ilike.*${trimmedSearch}*`);
      }

      url += `?${params.toString()}`;

      console.log('📡 CargoService: URL da requisição:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      console.log('📡 CargoService: Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CargoService: Erro na resposta:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      // Para contagem total, precisamos fazer uma segunda requisição
      const countResponse = await fetch(
        `${this.supabaseUrl}/rest/v1/basic_roles_active?select=*${search ? `&name=ilike.*${search.trim()}*` : ''}`,
        {
          method: 'GET',
          headers: { ...this.getHeaders(), 'Prefer': 'count=exact' }
        }
      );

      const data = await response.json();
      const totalCount = parseInt(countResponse.headers.get('content-range')?.split('/')[1] || '0');

      console.log('✅ CargoService: Dados obtidos:', {
        dataLength: data.length,
        totalCount,
        currentPage: page,
        offset
      });

      return {
        data,
        count: totalCount,
        hasMore: (offset + data.length) < totalCount
      };
    } catch (error) {
      console.error('❌ CargoService: Erro ao buscar cargos:', error);
      throw error;
    }
  }

  async createCargo(data: Pick<Cargo, 'name'>): Promise<Cargo> {
    try {
      console.log('📝 CargoService: Criando cargo:', data);

      const response = await fetch(`${this.supabaseUrl}/rest/v1/basic_roles_active`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CargoService: Erro ao criar cargo:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ CargoService: Cargo criado:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ CargoService: Erro ao criar cargo:', error);
      throw error;
    }
  }

  async updateCargo(id: number, data: Pick<Cargo, 'name'>): Promise<Cargo> {
    try {
      console.log('📝 CargoService: Atualizando cargo:', { id, data });

      const response = await fetch(`${this.supabaseUrl}/rest/v1/basic_roles_active?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CargoService: Erro ao atualizar cargo:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ CargoService: Cargo atualizado:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ CargoService: Erro ao atualizar cargo:', error);
      throw error;
    }
  }

  async deleteCargo(id: number): Promise<Cargo> {
    try {
      console.log('🗑️ CargoService: Fazendo soft delete do cargo:', id);

      const response = await fetch(`${this.supabaseUrl}/rest/v1/basic_roles_active?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({ deleted_at: new Date().toISOString() })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CargoService: Erro ao deletar cargo:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ CargoService: Cargo deletado (soft delete):', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ CargoService: Erro ao deletar cargo:', error);
      throw error;
    }
  }

  async searchCargos(searchTerm: string): Promise<Cargo[]> {
    try {
      console.log('🔍 CargoService: Buscando cargos por termo:', searchTerm);

      if (!searchTerm || searchTerm.trim().length === 0) {
        console.log('⚠️ CargoService: Termo de busca vazio, retornando array vazio');
        return [];
      }

      const trimmedSearch = searchTerm.trim();
      const url = `${this.supabaseUrl}/rest/v1/basic_roles_active?name=ilike.*${trimmedSearch}*&order=name.asc`;

      console.log('📡 CargoService: URL de busca:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CargoService: Erro na busca:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ CargoService: Resultados da busca:', data.length);
      return data;
    } catch (error) {
      console.error('❌ CargoService: Erro ao buscar cargos:', error);
      throw error;
    }
  }

  formatCargoName(cargo: Cargo): string {
    return cargo.name;
  }

  validateCargoData(data: Pick<Cargo, 'name'>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome do cargo é obrigatório');
    } else if (data.name.trim().length < 2) {
      errors.push('Nome do cargo deve ter pelo menos 2 caracteres');
    } else if (data.name.trim().length > 100) {
      errors.push('Nome do cargo deve ter no máximo 100 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const cargoService = new CargoService();

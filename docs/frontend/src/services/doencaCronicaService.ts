import { authService } from './auth';

export interface DoencaCronica {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DoencaCronicaResponse {
  data: DoencaCronica[];
  count: number;
  hasMore: boolean;
}

class DoencaCronicaService {
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

  async getDoencasCronicas(
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ): Promise<DoencaCronicaResponse> {
    try {
      console.log('🔍 DoencaCronicaService: Buscando doenças crônicas', { 
        page, 
        limit, 
        search,
        searchType: typeof search,
        searchLength: search ? search.length : 0
      });

      // Calcular offset para paginação
      const offset = (page - 1) * limit;

      // Construir URL com parâmetros de paginação
      let url = `${this.supabaseUrl}/rest/v1/basic_health_chronic_diseases_active`;
      const params = new URLSearchParams({
        select: '*',
        limit: limit.toString(),
        offset: offset.toString(),
        order: 'name.asc'
      });

      // Adicionar filtro de busca se fornecido
      if (search && search.trim()) {
        const trimmedSearch = search.trim();
        console.log('🔍 DoencaCronicaService: Aplicando filtro de busca:', trimmedSearch);
        params.append('or', `(name.ilike.*${trimmedSearch}*,description.ilike.*${trimmedSearch}*)`);
      }

      url += `?${params.toString()}`;

      console.log('🌐 DoencaCronicaService: URL da requisição:', url);
      console.log('🔍 DoencaCronicaService: Termo de busca:', search);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ DoencaCronicaService: Erro na requisição:', response.status, errorData);
        throw new Error(`Erro ao buscar doenças crônicas: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ DoencaCronicaService: Dados recebidos:', data);

      // Obter contagem total para paginação
      let countUrl = `${this.supabaseUrl}/rest/v1/basic_health_chronic_diseases_active?select=count`;
      if (search && search.trim()) {
        countUrl += `&or=(name.ilike.*${search.trim()}*,description.ilike.*${search.trim()}*)`;
      }
      
      console.log('🔢 DoencaCronicaService: URL de contagem:', countUrl);
      
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
      console.error('❌ DoencaCronicaService: Erro ao buscar doenças crônicas:', error);
      throw error;
    }
  }

  async createDoencaCronica(data: Pick<DoencaCronica, 'name' | 'description'>): Promise<DoencaCronica> {
    try {
      console.log('➕ DoencaCronicaService: Criando doença crônica:', data);

      const response = await fetch(`${this.supabaseUrl}/rest/v1/basic_health_chronic_diseases_active`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ DoencaCronicaService: Erro ao criar:', response.status, errorData);
        throw new Error(`Erro ao criar doença crônica: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ DoencaCronicaService: Doença crônica criada:', result);

      return result[0];
    } catch (error) {
      console.error('❌ DoencaCronicaService: Erro ao criar doença crônica:', error);
      throw error;
    }
  }

  async updateDoencaCronica(id: number, data: Pick<DoencaCronica, 'name' | 'description'>): Promise<DoencaCronica> {
    try {
      console.log('✏️ DoencaCronicaService: Atualizando doença crônica:', id, data);

      const response = await fetch(`${this.supabaseUrl}/rest/v1/basic_health_chronic_diseases_active?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ DoencaCronicaService: Erro ao atualizar:', response.status, errorData);
        throw new Error(`Erro ao atualizar doença crônica: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ DoencaCronicaService: Doença crônica atualizada:', result);

      return result[0];
    } catch (error) {
      console.error('❌ DoencaCronicaService: Erro ao atualizar doença crônica:', error);
      throw error;
    }
  }

  async deleteDoencaCronica(id: number): Promise<void> {
    try {
      console.log('🗑️ DoencaCronicaService: Deletando doença crônica:', id);

      const url = `${this.supabaseUrl}/rest/v1/basic_health_chronic_diseases_active?id=eq.${id}`;
      console.log('🌐 DoencaCronicaService: URL PATCH (soft delete):', url);
      
      // Usar headers normais com Authorization para PATCH
      const headers = this.getHeaders();
      console.log('🔑 DoencaCronicaService: Headers PATCH:', headers);

      // Soft delete - marca como deletado em vez de remover
      const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          deleted_at: new Date().toISOString()
        })
      });

      console.log('📡 DoencaCronicaService: Response status:', response.status);
      console.log('📡 DoencaCronicaService: Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ DoencaCronicaService: Error response data:', errorData);
        } catch (parseError) {
          console.error('❌ DoencaCronicaService: Erro ao fazer parse do erro:', parseError);
          errorData = { message: 'Erro desconhecido na resposta do servidor' };
        }
        
        const errorMessage = errorData?.message || errorData?.error?.message || `HTTP ${response.status}`;
        throw new Error(`Erro ao deletar doença crônica: ${errorMessage}`);
      }

      // Verificar se a resposta tem conteúdo
      const responseText = await response.text();
      console.log('📄 DoencaCronicaService: Response text:', responseText);

      console.log('✅ DoencaCronicaService: Doença crônica marcada como deletada com sucesso');
    } catch (error) {
      console.error('❌ DoencaCronicaService: Erro ao deletar doença crônica:', error);
      throw error;
    }
  }
}

export const doencaCronicaService = new DoencaCronicaService();

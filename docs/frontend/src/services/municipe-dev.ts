import type { Municipe, PaginatedResponse, ApiResponse, ApiArrayResponse } from '../types';

// Mock data for development
const mockMunicipes: Municipe[] = [
  {
    id: 'dev-municipe-1',
    nome: 'João Silva Santos',
    cpf: '123.456.789-01',
    data_nascimento: '1985-03-15',
    sexo: 'M',
    telefone: '(11) 99999-1234',
    email: 'joao.silva@email.com',
    endereco: 'Rua das Flores, 123',
    numero_endereco: '123',
    bairro: 'Centro',
    cep: '12345-678',
    cidade: 'São Paulo',
    estado: 'SP',
    cartao_sus: '123456789012345',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dev-municipe-2',
    nome: 'Maria Oliveira Costa',
    cpf: '987.654.321-09',
    data_nascimento: '1990-07-22',
    sexo: 'F',
    telefone: '(11) 98888-5678',
    email: 'maria.oliveira@email.com',
    endereco: 'Avenida Brasil, 456',
    numero_endereco: '456',
    bairro: 'Vila Nova',
    cep: '87654-321',
    cidade: 'São Paulo',
    estado: 'SP',
    cartao_sus: '987654321098765',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export class MunicipeService {
  private static municipes: Municipe[] = [...mockMunicipes];

  static async getAllMunicipes(page = 1, limit = 20): Promise<PaginatedResponse<Municipe>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = this.municipes.slice(start, end);

      return {
        data: paginatedData,
        count: this.municipes.length,
        page,
        limit,
        total_pages: Math.ceil(this.municipes.length / limit),
      };
    } catch (error) {
      throw new Error(`Error fetching municipes: ${error}`);
    }
  }

  static async getMunicipeById(id: string): Promise<ApiResponse<Municipe>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const municipe = this.municipes.find(m => m.id === id);
      
      if (!municipe) {
        return { data: null, error: 'Munícipe não encontrado' };
      }

      return { data: municipe };
    } catch (error) {
      return { data: null, error: `Error fetching municipe: ${error}` };
    }
  }

  static async searchMunicipes(query: string): Promise<ApiArrayResponse<Municipe>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));

      const lowerQuery = query.toLowerCase();
      const filtered = this.municipes.filter(m => 
        m.nome.toLowerCase().includes(lowerQuery) ||
        m.cpf.includes(query) ||
        m.cartao_sus?.includes(query)
      );

      return { data: filtered };
    } catch (error) {
      return { data: [], error: `Error searching municipes: ${error}` };
    }
  }

  static async createMunicipe(municipe: Omit<Municipe, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Municipe>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));

      const newMunicipe: Municipe = {
        ...municipe,
        id: `dev-municipe-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.municipes.push(newMunicipe);

      return { data: newMunicipe };
    } catch (error) {
      return { data: null, error: `Error creating municipe: ${error}` };
    }
  }

  static async updateMunicipe(id: string, updates: Partial<Municipe>): Promise<ApiResponse<Municipe>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = this.municipes.findIndex(m => m.id === id);
      
      if (index === -1) {
        return { data: null, error: 'Munícipe não encontrado' };
      }

      this.municipes[index] = {
        ...this.municipes[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      return { data: this.municipes[index] };
    } catch (error) {
      return { data: null, error: `Error updating municipe: ${error}` };
    }
  }

  static async deleteMunicipe(id: string): Promise<ApiResponse<boolean>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));

      const index = this.municipes.findIndex(m => m.id === id);
      
      if (index === -1) {
        return { data: false, error: 'Munícipe não encontrado' };
      }

      // Soft delete - mark as deleted
      this.municipes[index] = {
        ...this.municipes[index],
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return { data: true };
    } catch (error) {
      return { data: false, error: `Error deleting municipe: ${error}` };
    }
  }

  static async uploadFoto(municipeId: string, file: File | Blob, fileName: string): Promise<ApiResponse<string>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock URL for development
      const mockUrl = `https://mock-storage.dev/municipes/${municipeId}/foto_${Date.now()}.jpg`;

      // Update municipe with photo URL
      await this.updateMunicipe(municipeId, { foto_url: mockUrl });

      return { data: mockUrl };
    } catch (error) {
      return { data: '', error: `Error uploading photo: ${error}` };
    }
  }

  static async getMunicipesByResponsavel(responsavelId: string): Promise<ApiArrayResponse<Municipe>> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const dependents = this.municipes.filter(m => 
        m.responsavel_id === responsavelId && !m.deleted_at
      );

      return { data: dependents };
    } catch (error) {
      return { data: [], error: `Error fetching dependents: ${error}` };
    }
  }

  static async validateCPF(cpf: string): Promise<boolean> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Simple CPF validation for development
      const cleanCPF = cpf.replace(/\D/g, '');
      
      // Basic validation - check if it's 11 digits and not all the same
      if (cleanCPF.length !== 11) return false;
      if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
      
      return true;
    } catch (error) {
      console.error('Error validating CPF:', error);
      return false;
    }
  }
}

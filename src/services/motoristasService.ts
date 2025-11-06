import { SUPABASE_CONFIG, getSupabaseHeaders } from '../config/supabase';

// Interface para Motorista seguindo a estrutura do backend exata do cURL
export interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  estado_civil?: string;
  sexo: 'M' | 'F';
  email?: string;
  telefone: string;
  cargo_id: number;
  cargo_nome?: string;
  possui_acesso: boolean;
  perfil_acesso_id?: string;
  perfil_acesso_nome?: string;
  foto_url?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Interface para Endereço do Motorista exata do cURL
export interface MotoristaEndereco {
  id: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  uf: string;
  bairro: string;
  cidade: string;
  cep: string;
  zona_rural: boolean;
  ref_zona_rural?: string;
}

// Interface para Escala do Motorista exata do cURL
export interface MotoristaEscala {
  id: string;
  dia_semana: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado
  dia_semana_nome: string;
  periodos: string[]; // ['MANHA', 'TARDE', 'NOITE', 'PLANTAO']
  observacoes?: string;
}

// Interface para dados completos do Motorista exata do cURL
export interface MotoristaCompleto {
  motorista: Motorista;
  endereco: MotoristaEndereco;
  escalas: MotoristaEscala[];
}

// Interface de resposta da API exata do cURL
export interface MotoristaAPIResponse {
  success: boolean;
  data: MotoristaCompleto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Interface para criação/atualização de Motorista
export interface CriarMotoristaData {
  // Dados pessoais
  nome: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  estado_civil?: string;
  sexo: 'M' | 'F';
  email?: string;
  telefone: string;
  cargo_id: number;
  possui_acesso?: boolean;
  perfil_acesso_id?: string;
  foto_url?: string;
  observacoes?: string;
  
  // Dados do endereço
  logradouro: string;
  numero?: string;
  complemento?: string;
  uf: string;
  bairro: string;
  cidade: string;
  cep: string;
  zona_rural?: boolean;
  ref_zona_rural?: string;
  
  // Escalas de trabalho
  escalas?: Array<{
    dia_semana: number;
    periodos: string[];
    observacoes?: string;
  }>;
}

// Opções para períodos de trabalho
export const PERIODOS_TRABALHO = [
  { value: 'MANHA', label: 'Manhã' },
  { value: 'TARDE', label: 'Tarde' },
  { value: 'NOITE', label: 'Noite' },
  { value: 'PLANTAO', label: 'Plantão' }
] as const;

// Opções para dias da semana
export const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
] as const;

// Opções para estado civil
export const ESTADO_CIVIL_OPTIONS = [
  { value: 'SOLTEIRO', label: 'Solteiro(a)' },
  { value: 'CASADO', label: 'Casado(a)' },
  { value: 'DIVORCIADO', label: 'Divorciado(a)' },
  { value: 'VIUVO', label: 'Viúvo(a)' },
  { value: 'UNIAO_ESTAVEL', label: 'União Estável' }
] as const;

class MotoristasService {
  // Criar motorista completo
  async criarMotoristaCompleto(data: CriarMotoristaData): Promise<MotoristaCompleto> {
    try {
      console.log('🚗 Criando motorista completo:', data);
      
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/rpc_criar_motorista_completo`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({
          // Dados pessoais
          p_nome: data.nome,
          p_cpf: data.cpf,
          p_rg: data.rg,
          p_data_nascimento: data.data_nascimento,
          p_estado_civil: data.estado_civil,
          p_sexo: data.sexo,
          p_email: data.email,
          p_telefone: data.telefone,
          p_cargo_id: data.cargo_id,
          p_possui_acesso: data.possui_acesso || false,
          p_perfil_acesso_id: data.perfil_acesso_id,
          p_foto_url: data.foto_url,
          p_observacoes: data.observacoes,
          
          // Dados do endereço
          p_logradouro: data.logradouro,
          p_numero: data.numero,
          p_complemento: data.complemento,
          p_uf: data.uf,
          p_bairro: data.bairro,
          p_cidade: data.cidade,
          p_cep: data.cep,
          p_zona_rural: data.zona_rural || false,
          p_ref_zona_rural: data.ref_zona_rural,
          
          // Escalas de trabalho
          p_escalas: data.escalas || []
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📦 Resposta da criação:', result);

      // Verificar se foi criado com sucesso - usando formato do cURL
      if (result && result.success) {
        console.log('✅ Motorista criado:', result);
        
        // Se a resposta já tem os dados completos
        if (result.data && result.data.motorista) {
          return result.data;
        }
        
        // Se retornou apenas o ID, buscar os dados completos
        if (result.motorista_id) {
          return await this.buscarMotoristaCompleto(result.motorista_id);
        }
      } else {
        const errorMsg = result?.error || result?.message || 'Erro desconhecido ao criar motorista';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Erro no serviço de criação de motorista:', error);
      throw error;
    }
  }

  // Atualizar motorista completo
  async atualizarMotoristaCompleto(motoristaId: string, data: CriarMotoristaData): Promise<MotoristaCompleto> {
    try {
      console.log('🔄 Atualizando motorista completo:', motoristaId, data);
      
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/rpc_atualizar_motorista_completo`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({
          p_motorista_id: motoristaId,
          // Dados pessoais
          p_nome: data.nome,
          p_cpf: data.cpf,
          p_rg: data.rg,
          p_data_nascimento: data.data_nascimento,
          p_estado_civil: data.estado_civil,
          p_sexo: data.sexo,
          p_email: data.email,
          p_telefone: data.telefone,
          p_cargo_id: data.cargo_id,
          p_possui_acesso: data.possui_acesso || false,
          p_perfil_acesso_id: data.perfil_acesso_id,
          p_foto_url: data.foto_url,
          p_observacoes: data.observacoes,
          
          // Dados do endereço
          p_logradouro: data.logradouro,
          p_numero: data.numero,
          p_complemento: data.complemento,
          p_uf: data.uf,
          p_bairro: data.bairro,
          p_cidade: data.cidade,
          p_cep: data.cep,
          p_zona_rural: data.zona_rural || false,
          p_ref_zona_rural: data.ref_zona_rural,
          
          // Escalas de trabalho
          p_escalas: data.escalas || []
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📦 Resposta da atualização:', result);

      // Verificar se foi atualizado com sucesso - usando formato do cURL
      if (result && result.success) {
        console.log('✅ Motorista atualizado:', result);
        
        // Se a resposta já tem os dados completos
        if (result.data && result.data.motorista) {
          return result.data;
        }
        
        // Se não, buscar os dados atualizados
        return await this.buscarMotoristaCompleto(motoristaId);
      } else {
        const errorMsg = result?.error || result?.message || 'Erro desconhecido ao atualizar motorista';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Erro no serviço de atualização de motorista:', error);
      throw error;
    }
  }

  // Buscar motorista completo por ID
  async buscarMotoristaCompleto(motoristaId: string): Promise<MotoristaCompleto> {
    try {
      console.log('🔍 Buscando motorista completo:', motoristaId);
      
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/rpc_buscar_motorista_completo`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({
          p_motorista_id: motoristaId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📦 Resposta da API:', result);

      // Interpretar a resposta baseado no cURL que funciona
      if (result && result.success && result.data) {
        // Se retornou array com um item
        if (Array.isArray(result.data) && result.data.length > 0) {
          console.log('✅ Motorista encontrado (array):', result.data[0]);
          return result.data[0];
        }
        // Se retornou objeto direto
        if (result.data.motorista) {
          console.log('✅ Motorista encontrado (objeto):', result.data);
          return result.data;
        }
      }

      // Se não tem success mas tem dados diretamente
      if (result && result.motorista) {
        console.log('✅ Motorista encontrado (formato direto):', result);
        return result;
      }

      // Se chegou aqui, não encontrou
      throw new Error('Motorista não encontrado');
    } catch (error) {
      console.error('❌ Erro no serviço de busca de motorista:', error);
      throw error;
    }
  }

  // Listar todos os motoristas usando RPC
  async listarMotoristas(): Promise<MotoristaCompleto[]> {
    try {
      console.log('📋 Listando motoristas via RPC');
      
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/rpc_buscar_motorista_completo`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({
          p_motorista_id: null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: MotoristaAPIResponse = await response.json();
      console.log('📦 Resposta da API (listar):', result);

      // Interpretar a resposta baseado no cURL que funciona
      if (result && result.success && Array.isArray(result.data)) {
        console.log('✅ Motoristas listados:', result.data.length);
        return result.data;
      }

      console.log('⚠️ Nenhum motorista encontrado');
      return [];
    } catch (error) {
      console.error('❌ Erro no serviço de listagem de motoristas:', error);
      throw error;
    }
  }

  // Soft delete de motorista
  async excluirMotorista(motoristaId: string, motivo: string): Promise<boolean> {
    try {
      console.log('🗑️ Excluindo motorista:', motoristaId, 'Motivo:', motivo);
      
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/soft_delete_record`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({
          table_name: 'motoristas',
          record_id: motoristaId,
          motivo: motivo
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Motorista excluído:', result);
      return true;
    } catch (error) {
      console.error('❌ Erro no serviço de exclusão de motorista:', error);
      throw error;
    }
  }
}

export const motoristasService = new MotoristasService();
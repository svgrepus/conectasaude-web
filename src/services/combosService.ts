import supabase from './supabase';

export interface ComboOption {
  option_label: string;
  option_value: string;
  sort_order: number;
}

export interface Context {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Subcontext {
  id: number;
  context_id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ComboField {
  id: number;
  subcontext_id: number;
  display_name: string;
  field_key: string;
  area?: string;
  created_at: string;
  updated_at: string;
}

class CombosService {
  /**
   * Busca opções de combo através da função RPC
   */
  async getComboOptions(
    context: string,
    subcontext: string,
    fieldKey: string
  ): Promise<ComboOption[]> {
    try {
      const { data, error } = await supabase.rpc('get_combo_options', {
        p_context: context,
        p_subcontext: subcontext,
        p_field_key: fieldKey,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar opções de combo:', error);
      throw error;
    }
  }

  /**
   * Busca todas as opções de doença crônica para munícipes
   */
  async getDoencasCronicas(): Promise<ComboOption[]> {
    return this.getComboOptions('Cadastros Básicos', 'Munícipes', 'doenca_cronica');
  }

  /**
   * Busca todas as opções de tipo de doença para munícipes
   */
  async getTiposDoenca(): Promise<ComboOption[]> {
    return this.getComboOptions('Cadastros Básicos', 'Munícipes', 'tipo_de_doenca');
  }

  /**
   * Busca todas as opções de tipo de veículo
   */
  async getTiposVeiculo(): Promise<ComboOption[]> {
    return this.getComboOptions('Cadastros Básicos', 'Veículos', 'tipo_de_veiculo');
  }

  /**
   * Busca todas as opções de cargo para colaboradores
   */
  async getCargos(): Promise<ComboOption[]> {
    return this.getComboOptions('Cadastros Básicos', 'Colaboradores', 'cargo');
  }

  /**
   * Busca todas as opções de perfil de acesso para colaboradores
   */
  async getPerfisAcesso(): Promise<ComboOption[]> {
    return this.getComboOptions('Cadastros Básicos', 'Colaboradores', 'perfil_de_acesso');
  }

  /**
   * Busca todos os contextos disponíveis
   */
  async getContexts(): Promise<Context[]> {
    try {
      const { data, error } = await supabase
        .from('contexts')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar contextos:', error);
      throw error;
    }
  }

  /**
   * Busca subcontextos por contexto
   */
  async getSubcontexts(contextId: number): Promise<Subcontext[]> {
    try {
      const { data, error } = await supabase
        .from('subcontexts')
        .select('*')
        .eq('context_id', contextId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar subcontextos:', error);
      throw error;
    }
  }

  /**
   * Busca campos de combo por subcontexto
   */
  async getComboFields(subcontextId: number): Promise<ComboField[]> {
    try {
      const { data, error } = await supabase
        .from('combo_fields')
        .select('*')
        .eq('subcontext_id', subcontextId)
        .order('display_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar campos de combo:', error);
      throw error;
    }
  }

  /**
   * Busca todas as estruturas de combo (contextos > subcontextos > campos)
   */
  async getComboStructure(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('contexts')
        .select(`
          *,
          subcontexts (
            *,
            combo_fields (
              *
            )
          )
        `)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar estrutura de combos:', error);
      throw error;
    }
  }

  /**
   * Converte opções de combo para formato de Select/Picker
   */
  formatOptionsForPicker(options: ComboOption[]): Array<{label: string, value: string}> {
    return options.map(option => ({
      label: option.option_label,
      value: option.option_value,
    }));
  }

  /**
   * Busca o label de uma opção pelo seu value
   */
  getLabelByValue(options: ComboOption[], value: string): string {
    const option = options.find(opt => opt.option_value === value);
    return option ? option.option_label : value;
  }
}

export const combosService = new CombosService();

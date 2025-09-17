// Database entity types based on the ConectaSaúde system

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'funcionario' | 'municipe';
  created_at?: string;
  updated_at?: string;
}

export interface Municipe {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  telefone?: string;
  email?: string;
  
  // Campos básicos adicionais
  nome_mae?: string;
  rg?: string;
  estado_civil?: string;
  
  // Campos de endereço (da view vw_municipes_completo)
  endereco?: string;
  logradouro?: string; // campo alternativo da view
  numero_endereco?: string;
  numero?: string; // campo alternativo da view
  complemento_endereco?: string;
  complemento?: string; // campo alternativo da view
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  uf?: string; // campo alternativo para estado
  endereco_id?: string;
  zona_rural?: boolean;
  ref_zona_rural?: string;
  tipo_endereco?: string;
  endereco_created_at?: string;
  endereco_updated_at?: string;
  
  // Campos de saúde (da view vw_municipes_completo)
  cartao_sus?: string;
  usoMedicamentoContinuo?: string;
  uso_medicamento_continuo?: string; // campo alternativo
  uso_continuo_medicamentos?: string; // campo alternativo da view
  usa_medicamentos_continuos?: string; // campo alternativo da view
  quaisMedicamentos?: string;
  quais_medicamentos?: string; // campo alternativo
  deficiencia?: string;
  tem_deficiencia_fisica?: string; // campo alternativo da view
  possui_deficiencia?: string; // campo alternativo da view
  necessitaAcompanhante?: string;
  necessita_acompanhante?: string; // campo alternativo
  precisa_acompanhante?: string; // campo alternativo da view
  doencasCronicas?: string;
  doencas_cronicas?: string; // campo alternativo
  doenca_cronica?: string; // campo alternativo da view
  tipo_doenca?: string; // campo alternativo da view
  observacoes_medicas?: string; // campo da view
  saude_id?: string;
  saude_created_at?: string;
  saude_updated_at?: string;
  
  // Campos do acompanhante (da view vw_municipes_completo)
  acompanhante_id?: string;
  acompanhante_nome?: string;
  acompanhante_cpf?: string;
  acompanhante_rg?: string;
  acompanhante_data_nascimento?: string;
  acompanhante_sexo?: 'M' | 'F';
  acompanhante_grau_parentesco?: string;
  acompanhante_idade?: number;
  acompanhante_created_at?: string;
  acompanhante_updated_at?: string;
  tem_acompanhante_cadastrado?: string;
  
  // Campos calculados da view
  idade?: number;
  
  // Campos do sistema
  foto_url?: string;
  responsavel_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Funcionario {
  id: string;
  user_id: string;
  nome: string;
  cpf: string;
  cargo: string;
  especialidade?: string;
  cro_crm?: string;
  telefone?: string;
  email?: string;
  data_admissao: string;
  status: 'ativo' | 'inativo' | 'afastado';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user?: User;
}

export interface Unidade {
  id: string;
  nome: string;
  tipo: 'posto' | 'ubs' | 'hospital' | 'clinica';
  endereco: string;
  telefone?: string;
  horario_funcionamento?: string;
  responsavel_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  responsavel?: Funcionario;
}

export interface Consulta {
  id: string;
  municipe_id: string;
  funcionario_id: string;
  unidade_id: string;
  data_consulta: string;
  hora_consulta: string;
  tipo_consulta: 'rotina' | 'urgencia' | 'retorno' | 'especialista';
  status: 'agendada' | 'confirmada' | 'realizada' | 'cancelada' | 'faltou';
  observacoes?: string;
  receita?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  municipe?: Municipe;
  funcionario?: Funcionario;
  unidade?: Unidade;
}

export interface Exame {
  id: string;
  municipe_id: string;
  funcionario_solicitante_id: string;
  tipo_exame: string;
  data_solicitacao: string;
  data_realizacao?: string;
  status: 'solicitado' | 'agendado' | 'realizado' | 'cancelado';
  resultado?: string;
  observacoes?: string;
  arquivo_resultado?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  municipe?: Municipe;
  funcionario_solicitante?: Funcionario;
}

export interface Medicamento {
  id: string;
  nome: string;
  principio_ativo: string;
  concentracao?: string;
  forma_farmaceutica: string;
  fabricante?: string;
  codigo_barras?: string;
  preco_unitario?: number;
  estoque_minimo: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface EstoqueMedicamento {
  id: string;
  medicamento_id: string;
  unidade_id: string;
  quantidade_atual: number;
  data_vencimento: string;
  lote?: string;
  created_at: string;
  updated_at: string;
  medicamento?: Medicamento;
  unidade?: Unidade;
}

export interface DispensacaoMedicamento {
  id: string;
  receita_id: string;
  medicamento_id: string;
  quantidade_dispensada: number;
  funcionario_farmacia_id: string;
  data_dispensacao: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  medicamento?: Medicamento;
  funcionario_farmacia?: Funcionario;
}

// Navigation types
export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
  Profile: { userId: string };
  ConsultaDetails: { consultaId: string };
  ExameDetails: { exameId: string };
  MedicamentoDetails: { medicamentoId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Consultas: undefined;
  Exames: undefined;
  Medicamentos: undefined;
  Perfil: undefined;
};

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error?: string;
  message?: string;
}

export interface ApiArrayResponse<T> {
  data: T[];
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  nome: string;
  cpf: string;
  telefone?: string;
}

export interface ConsultaForm {
  municipe_id: string;
  funcionario_id: string;
  unidade_id: string;
  data_consulta: string;
  hora_consulta: string;
  tipo_consulta: 'rotina' | 'urgencia' | 'retorno' | 'especialista';
  observacoes?: string;
}

export interface ExameForm {
  municipe_id: string;
  tipo_exame: string;
  observacoes?: string;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data?: T;
  loading: boolean;
  error?: string;
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    body: number;
    caption: number;
  };
}

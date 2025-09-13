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
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  telefone?: string;
  email?: string;
  endereco?: string;
  numero_endereco?: string;
  complemento_endereco?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  foto_url?: string;
  cartao_sus?: string;
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

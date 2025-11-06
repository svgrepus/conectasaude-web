// Database entity types based on the ConectaSaúde system

// ===== ENUMS E CONSTANTES =====

// Orientação Sexual
export const ORIENTACAO_SEXUAL_OPTIONS = [
  'HETEROSSEXUAL',
  'HOMOSSEXUAL', 
  'BISSEXUAL',
  'PANSEXUAL',
  'ASSEXUAL',
  'OUTROS',
  'NAO_INFORMADO'
] as const;

export type OrientacaoSexual = typeof ORIENTACAO_SEXUAL_OPTIONS[number];

// Escolaridade
export const ESCOLARIDADE_OPTIONS = [
  'SEM_ESCOLARIDADE',
  'FUNDAMENTAL_INCOMPLETO',
  'FUNDAMENTAL_COMPLETO',
  'MEDIO_INCOMPLETO', 
  'MEDIO_COMPLETO',
  'SUPERIOR_INCOMPLETO',
  'SUPERIOR_COMPLETO',
  'POS_GRADUACAO',
  'MESTRADO',
  'DOUTORADO'
] as const;

export type Escolaridade = typeof ESCOLARIDADE_OPTIONS[number];

// Identidade de Gênero
export const IDENTIDADE_GENERO_OPTIONS = [
  'CISGÊNERO',
  'TRANSGÊNERO', 
  'NÃO_BINÁRIO',
  'GÊNERO_FLUIDO',
  'AGÊNERO',
  'OUTROS',
  'NAO_INFORMADO'
] as const;

export type IdentidadeGenero = typeof IDENTIDADE_GENERO_OPTIONS[number];

// Tipo Sanguíneo
export const TIPO_SANGUINEO_OPTIONS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

export type TipoSanguineo = typeof TIPO_SANGUINEO_OPTIONS[number];

// Labels para exibição
export const ORIENTACAO_SEXUAL_LABELS: Record<OrientacaoSexual, string> = {
  'HETEROSSEXUAL': 'Heterossexual',
  'HOMOSSEXUAL': 'Homossexual',
  'BISSEXUAL': 'Bissexual',
  'PANSEXUAL': 'Pansexual',
  'ASSEXUAL': 'Assexual',
  'OUTROS': 'Outros',
  'NAO_INFORMADO': 'Não informado'
};

export const ESCOLARIDADE_LABELS: Record<Escolaridade, string> = {
  'SEM_ESCOLARIDADE': 'Sem escolaridade',
  'FUNDAMENTAL_INCOMPLETO': 'Fundamental incompleto',
  'FUNDAMENTAL_COMPLETO': 'Fundamental completo',
  'MEDIO_INCOMPLETO': 'Médio incompleto',
  'MEDIO_COMPLETO': 'Médio completo',
  'SUPERIOR_INCOMPLETO': 'Superior incompleto',
  'SUPERIOR_COMPLETO': 'Superior completo',
  'POS_GRADUACAO': 'Pós-graduação',
  'MESTRADO': 'Mestrado',
  'DOUTORADO': 'Doutorado'
};

export const IDENTIDADE_GENERO_LABELS: Record<IdentidadeGenero, string> = {
  'CISGÊNERO': 'Cisgênero',
  'TRANSGÊNERO': 'Transgênero',
  'NÃO_BINÁRIO': 'Não-binário',
  'GÊNERO_FLUIDO': 'Gênero fluido',
  'AGÊNERO': 'Agênero',
  'OUTROS': 'Outros',
  'NAO_INFORMADO': 'Não informado'
};

export const TIPO_SANGUINEO_LABELS: Record<TipoSanguineo, string> = {
  'A+': 'A+',
  'A-': 'A-',
  'B+': 'B+', 
  'B-': 'B-',
  'AB+': 'AB+',
  'AB-': 'AB-',
  'O+': 'O+',
  'O-': 'O-'
};

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
  // Telefones desmembrados
  telefone_residencial?: string;
  telefone_celular?: string;
  telefone_contato?: string;
  // Campo legacy para compatibilidade
  telefone?: string;
  email?: string;
  
  // Campos básicos adicionais
  nome_mae?: string;
  nome_pai?: string; // NOVO
  rg?: string;
  estado_civil?: string;
  nacionalidade?: string; // NOVO OBRIGATÓRIO
  municipio_nascimento?: string; // NOVO OBRIGATÓRIO
  
  // Campos de endereço (da view vw_municipes_completo)
  endereco?: string;
  logradouro?: string; // campo alternativo da view
  numero_endereco?: string;
  numero?: string; // campo alternativo da view
  complemento_endereco?: string;
  complemento?: string; // campo alternativo da view
  complemento_logradouro?: string; // NOVO
  ponto_referencia?: string; // NOVO
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
  cns?: string; // ALTERADO de cartao_sus para cns
  cartao_sus?: string; // Campo legacy para compatibilidade
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
  // NOVOS campos de saúde
  uso_bebida_alcoolica?: boolean;
  uso_tabaco?: boolean;
  consome_bebida_alcoolica?: string; // campo calculado
  consome_tabaco?: string; // campo calculado
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
  
  // NOVA SEÇÃO: Informações Sociodemográficas
  sociodemografico_id?: string;
  nis?: string; // 11 dígitos
  ocupacao?: string;
  orientacao_sexual?: OrientacaoSexual;
  escolaridade?: Escolaridade;
  identidade_genero?: IdentidadeGenero;
  tipo_sanguineo?: TipoSanguineo;
  tem_dados_sociodemograficos?: string;
  
  // NOVA SEÇÃO: Equipe Responsável
  equipe_responsavel_id?: string;
  equipe_responsavel?: string;
  unidade_responsavel?: string;
  area?: string;
  microarea?: string;
  tem_equipe_responsavel?: string;
  
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
  possui_acesso?: boolean;
  perfil_acesso_id?: string;
  foto_url?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface MotoristaEndereco {
  id: string;
  motorista_id: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  uf: string;
  bairro: string;
  cidade: string;
  cep: string;
  zona_rural?: boolean;
  ref_zona_rural?: string;
  created_at: string;
  updated_at: string;
}

export interface MotoristaEscala {
  id: string;
  motorista_id: string;
  dia_semana: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado
  periodos: string[]; // ['MANHA', 'TARDE', 'NOITE', 'PLANTAO']
  observacoes?: string;
  created_at: string;
  updated_at: string;
}
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

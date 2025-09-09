import type { Theme } from '../types';

export const lightTheme: Theme = {
  colors: {
    primary: '#ea2a33',
    secondary: '#4CAF50',
    background: '#fdf2f2',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#d1d5db',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#ea2a33',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    body: 16,
    caption: 14,
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#ea2a33',
    secondary: '#81C784',
    background: '#1f2937',
    surface: '#374151',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#6b7280',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFA726',
    info: '#ea2a33',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    body: 16,
    caption: 14,
  },
};

// App constants
export const APP_CONFIG = {
  name: 'ConectaSaúde',
  version: '1.0.0',
  supportEmail: 'suporte@conectasaude.gov.br',
  privacyPolicyUrl: 'https://conectasaude.gov.br/privacidade',
  termsOfServiceUrl: 'https://conectasaude.gov.br/termos',
};

// API constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    RESET_PASSWORD: '/auth/reset-password',
  },
  MUNICIPES: '/municipes',
  FUNCIONARIOS: '/funcionarios',
  CONSULTAS: '/consultas',
  EXAMES: '/exames',
  MEDICAMENTOS: '/medicamentos',
  UNIDADES: '/unidades',
  ESTOQUE: '/estoque_medicamentos',
  DISPENSACAO: '/dispensacao_medicamentos',
};

// Brazilian specific constants
export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
];

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
  { value: 'O', label: 'Outro' },
];

export const CONSULTA_TYPES = [
  { value: 'rotina', label: 'Consulta de Rotina' },
  { value: 'urgencia', label: 'Urgência' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'especialista', label: 'Especialista' },
];

export const CONSULTA_STATUS = [
  { value: 'agendada', label: 'Agendada' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'realizada', label: 'Realizada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'faltou', label: 'Paciente Faltou' },
];

export const EXAME_STATUS = [
  { value: 'solicitado', label: 'Solicitado' },
  { value: 'agendado', label: 'Agendado' },
  { value: 'realizado', label: 'Realizado' },
  { value: 'cancelado', label: 'Cancelado' },
];

export const UNIDADE_TYPES = [
  { value: 'posto', label: 'Posto de Saúde' },
  { value: 'ubs', label: 'UBS - Unidade Básica de Saúde' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinica', label: 'Clínica' },
];

// Regex patterns for validation
export const VALIDATION_PATTERNS = {
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  PHONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CEP: /^\d{5}-\d{3}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Date and time formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@conectasaude:auth_token',
  USER_DATA: '@conectasaude:user_data',
  THEME_PREFERENCE: '@conectasaude:theme',
  LANGUAGE_PREFERENCE: '@conectasaude:language',
};

// Network timeouts
export const NETWORK = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

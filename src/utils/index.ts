import { VALIDATION_PATTERNS } from '../constants';

// CPF validation utility (Brazilian tax ID)
export const validateCPF = (cpf: string): boolean => {
  // Remove formatting
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Check if has 11 digits
  if (cleanCPF.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validate check digits
  let sum = 0;
  let remainder;
  
  // First check digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  // Second check digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

// Format CPF (add dots and dash) - LIMITED TO 11 DIGITS
export const formatCPF = (cpf: string): string => {
  // Remove all non-digit characters
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Limit to maximum 11 digits
  const limitedCPF = cleanCPF.substring(0, 11);
  
  // Apply mask based on length
  if (limitedCPF.length <= 3) {
    return limitedCPF;
  } else if (limitedCPF.length <= 6) {
    return limitedCPF.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  } else if (limitedCPF.length <= 9) {
    return limitedCPF.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  } else {
    return limitedCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  }
};

// Format phone number (Brazilian format) - LIMITED TO 11 DIGITS
export const formatPhone = (phone: string): string => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Limit to maximum 11 digits
  const limitedPhone = cleanPhone.substring(0, 11);
  
  // Apply mask based on length
  if (limitedPhone.length <= 2) {
    return limitedPhone;
  } else if (limitedPhone.length <= 6) {
    return limitedPhone.replace(/(\d{2})(\d{0,4})/, '($1) $2');
  } else if (limitedPhone.length <= 10) {
    return limitedPhone.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else {
    return limitedPhone.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
};

// Format CEP (Brazilian postal code)
export const formatCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  if (cleanCEP.length <= 8) {
    return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
};

// Format RG (Brazilian ID document) - ALLOWS LETTERS AND NUMBERS
export const formatRG = (rg: string): string => {
  // Remove special characters but keep letters and numbers
  const cleanRG = rg.replace(/[^\w]/g, '').toUpperCase();
  
  // Limit to maximum 12 characters (allowing for longer RGs with letters)
  const limitedRG = cleanRG.substring(0, 12);
  
  // Apply mask based on length
  if (limitedRG.length <= 2) {
    return limitedRG;
  } else if (limitedRG.length <= 5) {
    return limitedRG.replace(/(\w{2})(\w{0,3})/, '$1.$2');
  } else if (limitedRG.length <= 8) {
    return limitedRG.replace(/(\w{2})(\w{3})(\w{0,3})/, '$1.$2.$3');
  } else {
    return limitedRG.replace(/(\w{2})(\w{3})(\w{3})(\w{0,3})/, '$1.$2.$3-$4');
  }
};

// Format SUS Number (Brazilian health system number) - LIMITED TO 15 DIGITS
export const formatSUS = (sus: string): string => {
  // Remove all non-digit characters
  const cleanSUS = sus.replace(/[^\d]/g, '');
  
  // Limit to maximum 15 digits
  const limitedSUS = cleanSUS.substring(0, 15);
  
  // Apply mask based on length
  if (limitedSUS.length <= 3) {
    return limitedSUS;
  } else if (limitedSUS.length <= 7) {
    return limitedSUS.replace(/(\d{3})(\d{0,4})/, '$1 $2');
  } else if (limitedSUS.length <= 11) {
    return limitedSUS.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1 $2 $3');
  } else {
    return limitedSUS.replace(/(\d{3})(\d{4})(\d{4})(\d{0,4})/, '$1 $2 $3 $4');
  }
};

// Email validation
export const validateEmail = (email: string): boolean => {
  return VALIDATION_PATTERNS.EMAIL.test(email);
};

// Phone validation
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

// CEP validation
export const validateCEP = (cep: string): boolean => {
  return VALIDATION_PATTERNS.CEP.test(cep);
};

// RG validation - accepts letters and numbers
export const validateRG = (rg: string): boolean => {
  const cleanRG = rg.replace(/[^\w]/g, '');
  return cleanRG.length >= 7 && cleanRG.length <= 12;
};

// SUS validation
export const validateSUS = (sus: string): boolean => {
  const cleanSUS = sus.replace(/[^\d]/g, '');
  return cleanSUS.length === 15;
};

// Validate birth date - format dd/MM/yyyy and in the past
export const validateBirthDate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  // Check format dd/MM/yyyy
  const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(datePattern);
  
  if (!match) return false;
  
  const [, day, month, year] = match;
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  // Check valid ranges
  if (monthNum < 1 || monthNum > 12) return false;
  if (dayNum < 1 || dayNum > 31) return false;
  if (yearNum < 1900 || yearNum > new Date().getFullYear()) return false;
  
  // Create date and check if it's valid
  const date = new Date(yearNum, monthNum - 1, dayNum);
  
  // Check if date construction was successful
  if (date.getDate() !== dayNum || 
      date.getMonth() !== monthNum - 1 || 
      date.getFullYear() !== yearNum) {
    return false;
  }
  
  // Check if date is in the past or today
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  return date <= today;
};

// Format date input for dd/MM/yyyy
export const formatBirthDate = (input: string): string => {
  // Remove all non-digit characters
  const numbers = input.replace(/\D/g, '');
  
  // Limit to 8 digits (ddMMyyyy)
  const limited = numbers.substring(0, 8);
  
  // Apply mask
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 4) {
    return limited.replace(/(\d{2})(\d{0,2})/, '$1/$2');
  } else {
    return limited.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
  }
};

// Date formatting utilities
export const formatDate = (date: string | Date, format = 'DD/MM/YYYY'): string => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'YYYY-MM-DDTHH:mm:ss':
      return d.toISOString();
    default:
      return `${day}/${month}/${year}`;
  }
};

// Parse date from Brazilian format
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Try DD/MM/YYYY format
  const brFormat = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brFormat) {
    const [, day, month, year] = brFormat;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Try ISO format
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  return null;
};

// Age calculation
export const calculateAge = (birthDate: string | Date): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Currency formatting (Brazilian Real)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Remove accents and special characters for search
export const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

// Generate initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Check if file is image
export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const extension = fileName.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension || '');
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Sleep utility for delays
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

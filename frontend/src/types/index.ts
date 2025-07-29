
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface TableData<T> {
  columns: ApiColumn[];
  rows: T[];
}

export interface ApiColumn {
  label: string;
  field: string;
  type: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}


export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  avatar?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}


export interface Customer extends BaseEntity, Record<string, unknown> {
  name: string;
  email: string;
  is_active: boolean;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  is_active: boolean;
}

export interface Product extends BaseEntity, Record<string, unknown> {
  name: string;
  price: string;
  quantity: number;
}

export interface CreateProductData {
  name: string;
  price: string;
  quantity: number;
}

// ===== НАСТРОЙКИ =====
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'ru' | 'en';
  notifications: boolean;
  sidebarCollapsed: boolean;
}


export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: ApiError | null;
}


export const API_ENDPOINTS = {
  CUSTOMERS: '/customers',
  PRODUCTS: '/products',
  AUTH: '/auth',
  USERS: '/users',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
} as const;


export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'boolean' | 'textarea';
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  icon?: string;
}

export interface UniversalFormProps {
  fields: FormField[];
  initialData: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
} 
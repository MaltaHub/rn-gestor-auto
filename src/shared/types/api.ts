/**
 * Tipos base para respostas da API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Tipo para operações que podem falhar
 */
export type Result<T, E = ApiError> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Tipos para paginação
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Tipos para filtros e ordenação
 */
export interface FilterParams {
  [key: string]: any;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Tipos para query options
 */
export interface QueryOptions {
  filters?: FilterParams;
  sort?: SortParams;
  pagination?: PaginationParams;
  include?: string[];
}
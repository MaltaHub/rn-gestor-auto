import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { ApiError, ApiResponse } from '../types/api';

const SUPABASE_URL = "https://cvhgjiksyyfhnswcvsqb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aGdqaWtzeXlmaG5zd2N2c3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDk3MzQsImV4cCI6MjA2MjM4NTczNH0.JvuFQda5fOOaSAPloT2XPQ4-k715vBX8-OX0Sjz9si0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

/**
 * Wrapper para operações do Supabase com tratamento de erro padronizado
 */
export class ApiClient {
  static async execute<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await operation();
      
      if (error) {
        return {
          success: false,
          error: new ApiError(error.message, error.code, error)
        };
      }
      
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      return {
        success: false,
        error: new ApiError(
          error instanceof Error ? error.message : 'Erro desconhecido',
          'UNKNOWN_ERROR',
          error
        )
      };
    }
  }

  static async executeRpc<T>(
    rpcName: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    return this.execute(() => supabase.rpc(rpcName, params));
  }
}
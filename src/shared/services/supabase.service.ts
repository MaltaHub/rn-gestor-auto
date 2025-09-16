import { supabase } from '../../lib/supabase';
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  VeiculoRow,
  VeiculoInsert,
  VeiculoUpdate,
  EmpresaRow,
  EmpresaInsert,
  EmpresaUpdate,
  LojaRow,
  LojaInsert,
  LojaUpdate,
  AnuncioRow,
  AnuncioInsert,
  AnuncioUpdate,
  VeiculoLojaRow,
  VeiculoLojaInsert,
  VeiculoLojaUpdate
} from '../types/database';
import type { ApiResponse, PaginatedResponse, QueryOptions } from '../types/api';

/**
 * Classe base para serviços do Supabase
 * Fornece métodos genéricos para operações CRUD
 */
export abstract class BaseSupabaseService<
  TRow extends Record<string, any>,
  TInsert extends Record<string, any>,
  TUpdate extends Record<string, any>
> {
  protected abstract tableName: keyof Database['public']['Tables'];
  protected tenantId?: string;

  constructor(tenantId?: string) {
    this.tenantId = tenantId;
  }

  /**
   * Busca todos os registros com paginação e filtros
   */
  async findAll(options: QueryOptions = {}): Promise<ApiResponse<PaginatedResponse<TRow>>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' });

      // Aplicar filtro de tenant se disponível
      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      // Aplicar filtros
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Aplicar busca por texto
      if (options.search && options.searchFields) {
        const searchConditions = options.searchFields
          .map(field => `${field}.ilike.%${options.search}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      // Aplicar ordenação
      if (options.sortBy) {
        query = query.order(options.sortBy, {
          ascending: options.sortOrder !== 'desc'
        });
      }

      // Aplicar paginação
      if (options.page && options.limit) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const totalPages = options.limit ? Math.ceil((count || 0) / options.limit) : 1;

      return {
        success: true,
        data: {
          items: data as TRow[],
          total: count || 0,
          page: options.page || 1,
          limit: options.limit || data?.length || 0,
          totalPages
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
    }
  }

  /**
   * Busca um registro por ID
   */
  async findById(id: string): Promise<ApiResponse<TRow | null>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id);

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: true,
            data: null
          };
        }
        throw error;
      }

      return {
        success: true,
        data: data as TRow
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: null
      };
    }
  }

  /**
   * Cria um novo registro
   */
  async create(data: TInsert): Promise<ApiResponse<TRow>> {
    try {
      const insertData = this.tenantId 
        ? { ...data, tenant_id: this.tenantId } as TInsert
        : data;

      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: result as TRow
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: {} as TRow
      };
    }
  }

  /**
   * Atualiza um registro
   */
  async update(id: string, data: TUpdate): Promise<ApiResponse<TRow>> {
    try {
      let query = supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id);

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      const { data: result, error } = await query.select().single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: result as TRow
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: {} as TRow
      };
    }
  }

  /**
   * Remove um registro
   */
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      let query = supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: false
      };
    }
  }

  /**
   * Conta registros com filtros
   */
  async count(filters?: Record<string, any>): Promise<ApiResponse<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: count || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: 0
      };
    }
  }
}

/**
 * Serviço para gerenciar veículos
 */
export class VeiculoService extends BaseSupabaseService<VeiculoRow, VeiculoInsert, VeiculoUpdate> {
  protected tableName = 'veiculos' as const;

  /**
   * Busca veículos por marca
   */
  async findByMarca(marca: string): Promise<ApiResponse<VeiculoRow[]>> {
    try {
      let query = supabase
        .from('veiculos')
        .select('*')
        .eq('marca', marca);

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as VeiculoRow[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: []
      };
    }
  }

  /**
   * Busca veículos por faixa de preço
   */
  async findByPrecoRange(minPreco: number, maxPreco: number): Promise<ApiResponse<VeiculoRow[]>> {
    try {
      let query = supabase
        .from('veiculos')
        .select('*')
        .gte('preco', minPreco)
        .lte('preco', maxPreco);

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as VeiculoRow[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: []
      };
    }
  }
}

/**
 * Serviço para gerenciar empresas
 */
export class EmpresaService extends BaseSupabaseService<EmpresaRow, EmpresaInsert, EmpresaUpdate> {
  protected tableName = 'empresas' as const;

  /**
   * Busca empresa por CNPJ
   */
  async findByCnpj(cnpj: string): Promise<ApiResponse<EmpresaRow | null>> {
    try {
      let query = supabase
        .from('empresas')
        .select('*')
        .eq('cnpj', cnpj);

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: true,
            data: null
          };
        }
        throw error;
      }

      return {
        success: true,
        data: data as EmpresaRow
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: null
      };
    }
  }
}

/**
 * Serviço para gerenciar lojas
 */
export class LojaService extends BaseSupabaseService<LojaRow, LojaInsert, LojaUpdate> {
  protected tableName = 'lojas' as const;

  /**
   * Busca lojas por empresa
   */
  async findByEmpresa(empresaId: string): Promise<ApiResponse<LojaRow[]>> {
    try {
      let query = supabase
        .from('lojas')
        .select('*')
        .eq('empresa_id', empresaId);

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as LojaRow[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: []
      };
    }
  }
}

/**
 * Serviço para gerenciar anúncios
 */
export class AnuncioService extends BaseSupabaseService<AnuncioRow, AnuncioInsert, AnuncioUpdate> {
  protected tableName = 'anuncios' as const;

  /**
   * Busca anúncios por status
   */
  async findByStatus(status: string): Promise<ApiResponse<AnuncioRow[]>> {
    try {
      let query = supabase
        .from('anuncios')
        .select('*')
        .eq('status', status);

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as AnuncioRow[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: []
      };
    }
  }

  /**
   * Busca anúncios por plataforma
   */
  async findByPlataforma(plataformaId: string): Promise<ApiResponse<AnuncioRow[]>> {
    try {
      let query = supabase
        .from('anuncios')
        .select('*')
        .eq('plataforma_id', plataformaId);

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as AnuncioRow[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: []
      };
    }
  }
}

/**
 * Serviço para gerenciar veículos de loja
 */
export class VeiculoLojaService extends BaseSupabaseService<VeiculoLojaRow, VeiculoLojaInsert, VeiculoLojaUpdate> {
  protected tableName = 'veiculos_loja' as const;

  /**
   * Busca veículos por loja
   */
  async findByLoja(lojaId: string): Promise<ApiResponse<VeiculoLojaRow[]>> {
    try {
      let query = supabase
        .from('veiculos_loja')
        .select('*')
        .eq('loja_id', lojaId);

      if (this.tenantId) {
        query = query.eq('tenant_id', this.tenantId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as VeiculoLojaRow[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: []
      };
    }
  }
}

// Instâncias dos serviços para uso direto
export const veiculoService = new VeiculoService();
export const empresaService = new EmpresaService();
export const lojaService = new LojaService();
export const anuncioService = new AnuncioService();
export const veiculoLojaService = new VeiculoLojaService();

// Factory para criar serviços com tenant específico
export const createTenantServices = (tenantId: string) => ({
  veiculo: new VeiculoService(tenantId),
  empresa: new EmpresaService(tenantId),
  loja: new LojaService(tenantId),
  anuncio: new AnuncioService(tenantId),
  veiculoLoja: new VeiculoLojaService(tenantId)
});

// Tipos para export
export type TenantServices = ReturnType<typeof createTenantServices>;
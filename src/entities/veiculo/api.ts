import { ApiClient } from '../../shared/api/client';
import { ApiResponse, QueryOptions, PaginatedResponse } from '../../shared/types/api';
import { Veiculo, VeiculoId, EmpresaId } from '../../shared/types/domain';
import { VeiculoRow, VeiculoInsert, VeiculoUpdate } from '../../shared/types/database';
import { supabase } from '../../shared/api/client';

/**
 * Serviço de API para veículos
 * Centraliza todas as operações relacionadas a veículos
 */
export class VeiculoApiService {
  /**
   * Busca um veículo por ID
   */
  static async getById(id: VeiculoId): Promise<ApiResponse<Veiculo>> {
    return ApiClient.execute(async () => {
      const { data, error } = await supabase
        .from('veiculos')
        .select(`
          *,
          modelo:modelos(*),
          caracteristicas_veiculos(
            caracteristica_id,
            caracteristicas(id, nome)
          )
        `)
        .eq('id', id)
        .single();

      return { data: data ? this.mapToVeiculo(data) : null, error };
    });
  }

  /**
   * Lista veículos com filtros e paginação
   */
  static async list(
    empresaId: EmpresaId,
    options: QueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<Veiculo>>> {
    return ApiClient.execute(async () => {
      let query = supabase
        .from('veiculos')
        .select(`
          *,
          modelo:modelos(*),
          caracteristicas_veiculos(
            caracteristica_id,
            caracteristicas(id, nome)
          )
        `, { count: 'exact' })
        .eq('empresa_id', empresaId);

      // Aplicar filtros
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Aplicar ordenação
      if (options.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' });
      }

      // Aplicar paginação
      if (options.pagination) {
        const { page = 1, limit = 20 } = options.pagination;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error };
      }

      const veiculos = data?.map(this.mapToVeiculo) || [];
      const total = count || 0;
      const limit = options.pagination?.limit || 20;
      const page = options.pagination?.page || 1;

      const paginatedResponse: PaginatedResponse<Veiculo> = {
        data: veiculos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };

      return { data: paginatedResponse, error: null };
    });
  }

  /**
   * Cria um novo veículo
   */
  static async create(veiculo: VeiculoInsert): Promise<ApiResponse<Veiculo>> {
    return ApiClient.execute(async () => {
      const { data, error } = await supabase
        .from('veiculos')
        .insert(veiculo)
        .select(`
          *,
          modelo:modelos(*)
        `)
        .single();

      return { data: data ? this.mapToVeiculo(data) : null, error };
    });
  }

  /**
   * Atualiza um veículo
   */
  static async update(id: VeiculoId, updates: VeiculoUpdate): Promise<ApiResponse<Veiculo>> {
    return ApiClient.execute(async () => {
      const { data, error } = await supabase
        .from('veiculos')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          modelo:modelos(*)
        `)
        .single();

      return { data: data ? this.mapToVeiculo(data) : null, error };
    });
  }

  /**
   * Remove um veículo
   */
  static async delete(id: VeiculoId): Promise<ApiResponse<void>> {
    return ApiClient.execute(async () => {
      const { error } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', id);

      return { data: null, error };
    });
  }

  /**
   * Mapeia dados do banco para o tipo de domínio
   */
  private static mapToVeiculo(data: any): Veiculo {
    return {
      id: data.id as VeiculoId,
      empresaId: data.empresa_id,
      modeloId: data.modelo_id,
      placa: data.placa,
      chassi: data.chassi,
      cor: data.cor,
      anoModelo: data.ano_modelo,
      anoFabricacao: data.ano_fabricacao,
      hodometro: data.hodometro,
      estadoVeiculo: data.estado_veiculo,
      estadoVenda: data.estado_venda,
      precoVenda: data.preco_venda,
      observacao: data.observacao,
      registradoEm: new Date(data.registrado_em),
      editadoEm: new Date(data.editado_em),
      modelo: data.modelo,
      caracteristicas: data.caracteristicas_veiculos?.map((cv: any) => cv.caracteristicas) || []
    };
  }
}
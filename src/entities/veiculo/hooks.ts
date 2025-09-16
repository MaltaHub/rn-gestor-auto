import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VeiculoApiService } from './api';
import { VeiculoModel, createVeiculoModel } from './model';
import { Veiculo, VeiculoId, EmpresaId } from '../../shared/types/domain';
import { VeiculoInsert, VeiculoUpdate } from '../../shared/types/database';
import { QueryOptions } from '../../shared/types/api';
import { useTenant } from '../../shared/hooks/useTenant';

/**
 * Query Keys padronizados para veículos
 */
export const veiculoQueryKeys = {
  all: ['veiculos'] as const,
  lists: () => [...veiculoQueryKeys.all, 'list'] as const,
  list: (empresaId: EmpresaId, options?: QueryOptions) => 
    [...veiculoQueryKeys.lists(), empresaId, options] as const,
  details: () => [...veiculoQueryKeys.all, 'detail'] as const,
  detail: (id: VeiculoId) => [...veiculoQueryKeys.details(), id] as const,
};

/**
 * Hook para buscar um veículo por ID
 */
export function useVeiculo(id: VeiculoId) {
  return useQuery({
    queryKey: veiculoQueryKeys.detail(id),
    queryFn: async () => {
      const response = await VeiculoApiService.getById(id);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data ? createVeiculoModel(response.data) : null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para listar veículos com filtros e paginação
 */
export function useVeiculos(options: QueryOptions = {}) {
  const { tenant } = useTenant();
  
  return useQuery({
    queryKey: veiculoQueryKeys.list(tenant?.id as EmpresaId, options),
    queryFn: async () => {
      if (!tenant?.id) {
        throw new Error('Tenant não encontrado');
      }
      
      const response = await VeiculoApiService.list(tenant.id as EmpresaId, options);
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
      }
      
      return {
        ...response.data,
        data: response.data.data.map(createVeiculoModel)
      };
    },
    enabled: !!tenant?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para criar um novo veículo
 */
export function useCreateVeiculo() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  
  return useMutation({
    mutationFn: async (veiculo: VeiculoInsert) => {
      const response = await VeiculoApiService.create(veiculo);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data ? createVeiculoModel(response.data) : null;
    },
    onSuccess: (data) => {
      if (data && tenant?.id) {
        // Invalida as listas de veículos
        queryClient.invalidateQueries({ 
          queryKey: veiculoQueryKeys.lists() 
        });
        
        // Adiciona o novo veículo ao cache
        queryClient.setQueryData(
          veiculoQueryKeys.detail(data.id),
          data
        );
      }
    },
  });
}

/**
 * Hook para atualizar um veículo
 */
export function useUpdateVeiculo() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: VeiculoId; updates: VeiculoUpdate }) => {
      const response = await VeiculoApiService.update(id, updates);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data ? createVeiculoModel(response.data) : null;
    },
    onSuccess: (data) => {
      if (data && tenant?.id) {
        // Atualiza o cache do veículo específico
        queryClient.setQueryData(
          veiculoQueryKeys.detail(data.id),
          data
        );
        
        // Invalida as listas para refletir as mudanças
        queryClient.invalidateQueries({ 
          queryKey: veiculoQueryKeys.lists() 
        });
      }
    },
  });
}

/**
 * Hook para deletar um veículo
 */
export function useDeleteVeiculo() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  
  return useMutation({
    mutationFn: async (id: VeiculoId) => {
      const response = await VeiculoApiService.delete(id);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return id;
    },
    onSuccess: (deletedId) => {
      if (tenant?.id) {
        // Remove do cache
        queryClient.removeQueries({ 
          queryKey: veiculoQueryKeys.detail(deletedId) 
        });
        
        // Invalida as listas
        queryClient.invalidateQueries({ 
          queryKey: veiculoQueryKeys.lists() 
        });
      }
    },
  });
}

/**
 * Hook para veículos disponíveis (filtro pré-definido)
 */
export function useVeiculosDisponiveis(options: Omit<QueryOptions, 'filters'> = {}) {
  return useVeiculos({
    ...options,
    filters: {
      ...options.filters,
      estado_venda: 'disponivel'
    }
  });
}

/**
 * Hook para veículos vendidos (filtro pré-definido)
 */
export function useVeiculosVendidos(options: Omit<QueryOptions, 'filters'> = {}) {
  return useVeiculos({
    ...options,
    filters: {
      ...options.filters,
      estado_venda: 'vendido'
    }
  });
}

/**
 * Hook para estatísticas de veículos
 */
export function useEstatisticasVeiculos() {
  const { tenant } = useTenant();
  
  return useQuery({
    queryKey: [...veiculoQueryKeys.all, 'estatisticas', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) {
        throw new Error('Tenant não encontrado');
      }
      
      // Busca todos os veículos para calcular estatísticas
      const response = await VeiculoApiService.list(tenant.id as EmpresaId);
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const veiculos = response.data?.data || [];
      
      return {
        total: veiculos.length,
        disponiveis: veiculos.filter(v => v.estadoVenda === 'disponivel').length,
        vendidos: veiculos.filter(v => v.estadoVenda === 'vendido').length,
        reservados: veiculos.filter(v => v.estadoVenda === 'reservado').length,
      };
    },
    enabled: !!tenant?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
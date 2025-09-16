import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { VeiculoModel } from '../../entities/veiculo/model';
import { Veiculo, VeiculoId, EstadoVenda, EstadoVeiculo } from '../types/domain';

/**
 * Interface para filtros de veículos
 */
interface VeiculoFilters {
  search?: string;
  estadoVenda?: EstadoVenda[];
  estadoVeiculo?: EstadoVeiculo[];
  marca?: string[];
  modelo?: string[];
  anoInicial?: number;
  anoFinal?: number;
  precoMinimo?: number;
  precoMaximo?: number;
  cor?: string[];
}

/**
 * Interface para ordenação de veículos
 */
interface VeiculoSort {
  field: 'placa' | 'modelo' | 'ano_modelo' | 'preco_venda' | 'registrado_em' | 'editado_em';
  direction: 'asc' | 'desc';
}

/**
 * Interface para o estado dos veículos
 */
interface VeiculoState {
  // Veículos selecionados
  selectedVeiculos: Set<VeiculoId>;
  
  // Veículo ativo (para edição/visualização)
  activeVeiculo: VeiculoModel | null;
  
  // Filtros ativos
  filters: VeiculoFilters;
  
  // Ordenação ativa
  sort: VeiculoSort;
  
  // View mode
  viewMode: 'grid' | 'list' | 'table';
  
  // Bulk operations
  bulkOperationMode: boolean;
  
  // Quick filters
  quickFilters: {
    disponiveis: boolean;
    vendidos: boolean;
    reservados: boolean;
    precisamLimpeza: boolean;
  };
}

/**
 * Interface para as ações dos veículos
 */
interface VeiculoActions {
  // Selection actions
  selectVeiculo: (id: VeiculoId) => void;
  deselectVeiculo: (id: VeiculoId) => void;
  toggleVeiculoSelection: (id: VeiculoId) => void;
  selectAllVeiculos: (ids: VeiculoId[]) => void;
  clearSelection: () => void;
  
  // Active veiculo actions
  setActiveVeiculo: (veiculo: VeiculoModel | null) => void;
  
  // Filter actions
  setFilters: (filters: Partial<VeiculoFilters>) => void;
  clearFilters: () => void;
  addFilter: <K extends keyof VeiculoFilters>(key: K, value: VeiculoFilters[K]) => void;
  removeFilter: (key: keyof VeiculoFilters) => void;
  
  // Sort actions
  setSort: (sort: VeiculoSort) => void;
  toggleSortDirection: () => void;
  
  // View actions
  setViewMode: (mode: VeiculoState['viewMode']) => void;
  
  // Bulk operations
  setBulkOperationMode: (enabled: boolean) => void;
  
  // Quick filters
  setQuickFilter: (filter: keyof VeiculoState['quickFilters'], enabled: boolean) => void;
  clearQuickFilters: () => void;
  
  // Reset
  reset: () => void;
}

type VeiculoStore = VeiculoState & VeiculoActions;

/**
 * Estado inicial dos veículos
 */
const initialState: VeiculoState = {
  selectedVeiculos: new Set(),
  activeVeiculo: null,
  filters: {},
  sort: {
    field: 'editado_em',
    direction: 'desc'
  },
  viewMode: 'grid',
  bulkOperationMode: false,
  quickFilters: {
    disponiveis: false,
    vendidos: false,
    reservados: false,
    precisamLimpeza: false
  }
};

/**
 * Store Zustand para gerenciamento de estado dos veículos
 */
export const useVeiculoStore = create<VeiculoStore>()()
  (devtools(
    immer((set, get) => ({
      ...initialState,
      
      // Selection actions
      selectVeiculo: (id: VeiculoId) => {
        set((state) => {
          state.selectedVeiculos.add(id);
        });
      },
      
      deselectVeiculo: (id: VeiculoId) => {
        set((state) => {
          state.selectedVeiculos.delete(id);
        });
      },
      
      toggleVeiculoSelection: (id: VeiculoId) => {
        set((state) => {
          if (state.selectedVeiculos.has(id)) {
            state.selectedVeiculos.delete(id);
          } else {
            state.selectedVeiculos.add(id);
          }
        });
      },
      
      selectAllVeiculos: (ids: VeiculoId[]) => {
        set((state) => {
          state.selectedVeiculos = new Set(ids);
        });
      },
      
      clearSelection: () => {
        set((state) => {
          state.selectedVeiculos.clear();
        });
      },
      
      // Active veiculo actions
      setActiveVeiculo: (veiculo: VeiculoModel | null) => {
        set((state) => {
          state.activeVeiculo = veiculo;
        });
      },
      
      // Filter actions
      setFilters: (filters: Partial<VeiculoFilters>) => {
        set((state) => {
          Object.assign(state.filters, filters);
        });
      },
      
      clearFilters: () => {
        set((state) => {
          state.filters = {};
        });
      },
      
      addFilter: <K extends keyof VeiculoFilters>(key: K, value: VeiculoFilters[K]) => {
        set((state) => {
          state.filters[key] = value;
        });
      },
      
      removeFilter: (key: keyof VeiculoFilters) => {
        set((state) => {
          delete state.filters[key];
        });
      },
      
      // Sort actions
      setSort: (sort: VeiculoSort) => {
        set((state) => {
          state.sort = sort;
        });
      },
      
      toggleSortDirection: () => {
        set((state) => {
          state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
        });
      },
      
      // View actions
      setViewMode: (mode: VeiculoState['viewMode']) => {
        set((state) => {
          state.viewMode = mode;
        });
      },
      
      // Bulk operations
      setBulkOperationMode: (enabled: boolean) => {
        set((state) => {
          state.bulkOperationMode = enabled;
          if (!enabled) {
            state.selectedVeiculos.clear();
          }
        });
      },
      
      // Quick filters
      setQuickFilter: (filter: keyof VeiculoState['quickFilters'], enabled: boolean) => {
        set((state) => {
          state.quickFilters[filter] = enabled;
          
          // Apply quick filter to main filters
          if (enabled) {
            switch (filter) {
              case 'disponiveis':
                state.filters.estadoVenda = [EstadoVenda.DISPONIVEL];
                break;
              case 'vendidos':
                state.filters.estadoVenda = [EstadoVenda.VENDIDO];
                break;
              case 'reservados':
                state.filters.estadoVenda = [EstadoVenda.RESERVADO];
                break;
              case 'precisamLimpeza':
                state.filters.estadoVeiculo = [EstadoVeiculo.SUJO];
                break;
            }
          } else {
            // Remove the specific filter when disabled
            switch (filter) {
              case 'disponiveis':
              case 'vendidos':
              case 'reservados':
                if (state.filters.estadoVenda?.length === 1) {
                  delete state.filters.estadoVenda;
                }
                break;
              case 'precisamLimpeza':
                if (state.filters.estadoVeiculo?.length === 1) {
                  delete state.filters.estadoVeiculo;
                }
                break;
            }
          }
        });
      },
      
      clearQuickFilters: () => {
        set((state) => {
          state.quickFilters = {
            disponiveis: false,
            vendidos: false,
            reservados: false,
            precisamLimpeza: false
          };
        });
      },
      
      // Reset
      reset: () => {
        set(initialState);
      }
    })),
    {
      name: 'Veiculo Store'
    }
  ));

/**
 * Hooks específicos para partes do estado dos veículos
 */
export const useVeiculoSelection = () => {
  const selectedVeiculos = useVeiculoStore(state => state.selectedVeiculos);
  const selectVeiculo = useVeiculoStore(state => state.selectVeiculo);
  const deselectVeiculo = useVeiculoStore(state => state.deselectVeiculo);
  const toggleVeiculoSelection = useVeiculoStore(state => state.toggleVeiculoSelection);
  const selectAllVeiculos = useVeiculoStore(state => state.selectAllVeiculos);
  const clearSelection = useVeiculoStore(state => state.clearSelection);
  
  return {
    selectedVeiculos: Array.from(selectedVeiculos),
    selectedCount: selectedVeiculos.size,
    isSelected: (id: VeiculoId) => selectedVeiculos.has(id),
    selectVeiculo,
    deselectVeiculo,
    toggleVeiculoSelection,
    selectAllVeiculos,
    clearSelection
  };
};

export const useVeiculoFilters = () => {
  const filters = useVeiculoStore(state => state.filters);
  const quickFilters = useVeiculoStore(state => state.quickFilters);
  const setFilters = useVeiculoStore(state => state.setFilters);
  const clearFilters = useVeiculoStore(state => state.clearFilters);
  const addFilter = useVeiculoStore(state => state.addFilter);
  const removeFilter = useVeiculoStore(state => state.removeFilter);
  const setQuickFilter = useVeiculoStore(state => state.setQuickFilter);
  const clearQuickFilters = useVeiculoStore(state => state.clearQuickFilters);
  
  return {
    filters,
    quickFilters,
    setFilters,
    clearFilters,
    addFilter,
    removeFilter,
    setQuickFilter,
    clearQuickFilters,
    hasActiveFilters: Object.keys(filters).length > 0
  };
};

export const useVeiculoSort = () => {
  const sort = useVeiculoStore(state => state.sort);
  const setSort = useVeiculoStore(state => state.setSort);
  const toggleSortDirection = useVeiculoStore(state => state.toggleSortDirection);
  
  return {
    sort,
    setSort,
    toggleSortDirection
  };
};

export const useVeiculoView = () => {
  const viewMode = useVeiculoStore(state => state.viewMode);
  const setViewMode = useVeiculoStore(state => state.setViewMode);
  const bulkOperationMode = useVeiculoStore(state => state.bulkOperationMode);
  const setBulkOperationMode = useVeiculoStore(state => state.setBulkOperationMode);
  
  return {
    viewMode,
    setViewMode,
    bulkOperationMode,
    setBulkOperationMode
  };
};
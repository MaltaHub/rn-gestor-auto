import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  priceRange: [number, number];
  sortBy: string;
  viewMode: 'grid' | 'list';
}

interface UIState {
  // Filters for different sections
  estoqueFilters: FilterState;
  anunciosFilters: FilterState;
  vendasFilters: FilterState;
  
  // UI preferences
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  setEstoqueFilters: (filters: Partial<FilterState>) => void;
  setAnunciosFilters: (filters: Partial<FilterState>) => void;
  setVendasFilters: (filters: Partial<FilterState>) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resetFilters: (section: 'estoque' | 'anuncios' | 'vendas') => void;
}

const defaultFilters: FilterState = {
  searchTerm: '',
  statusFilter: 'all',
  priceRange: [0, 1000000],
  sortBy: 'newest',
  viewMode: 'grid',
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      estoqueFilters: defaultFilters,
      anunciosFilters: defaultFilters,
      vendasFilters: defaultFilters,
      sidebarCollapsed: false,
      theme: 'system',
      
      // Actions
      setEstoqueFilters: (filters) =>
        set((state) => ({
          estoqueFilters: { ...state.estoqueFilters, ...filters },
        })),
      
      setAnunciosFilters: (filters) =>
        set((state) => ({
          anunciosFilters: { ...state.anunciosFilters, ...filters },
        })),
      
      setVendasFilters: (filters) =>
        set((state) => ({
          vendasFilters: { ...state.vendasFilters, ...filters },
        })),
      
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
      
      setTheme: (theme) =>
        set({ theme }),
      
      resetFilters: (section) =>
        set((state) => ({
          [`${section}Filters`]: defaultFilters,
        })),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        estoqueFilters: state.estoqueFilters,
        anunciosFilters: state.anunciosFilters,
        vendasFilters: state.vendasFilters,
      }),
    }
  )
);
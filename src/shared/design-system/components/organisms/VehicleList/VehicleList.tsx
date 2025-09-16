import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { VehicleCard } from '../../molecules/VehicleCard';
import { VehicleFilters } from '../../molecules/VehicleFilters';
import { cn } from '../../../utils/cn';
import { VeiculoModel } from '../../../../entities/veiculo/model';
import { VeiculoFilters } from '../../../../entities/veiculo/hooks';

/**
 * Props do VehicleList
 */
export interface VehicleListProps {
  veiculos: VeiculoModel[];
  loading?: boolean;
  error?: string | null;
  filters?: VeiculoFilters;
  onFiltersChange?: (filters: Partial<VeiculoFilters>) => void;
  onClearFilters?: () => void;
  onVehicleView?: (veiculo: VeiculoModel) => void;
  onVehicleEdit?: (veiculo: VeiculoModel) => void;
  onVehicleDelete?: (veiculo: VeiculoModel) => void;
  onVehicleSelect?: (veiculo: VeiculoModel, selected: boolean) => void;
  selectedVehicles?: Set<string>;
  showFilters?: boolean;
  showActions?: boolean;
  selectable?: boolean;
  compact?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
}

/**
 * Componente VehicleList
 * Organismo para exibir lista de veículos com filtros
 */
export const VehicleList: React.FC<VehicleListProps> = ({
  veiculos,
  loading = false,
  error = null,
  filters = {},
  onFiltersChange,
  onClearFilters,
  onVehicleView,
  onVehicleEdit,
  onVehicleDelete,
  onVehicleSelect,
  selectedVehicles = new Set(),
  showFilters = true,
  showActions = true,
  selectable = false,
  compact = false,
  viewMode = 'grid',
  onViewModeChange,
  className,
  emptyMessage = 'Nenhum veículo encontrado',
  loadingMessage = 'Carregando veículos...'
}) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const handleSelectAll = () => {
    if (!onVehicleSelect) return;
    
    const allSelected = veiculos.every(v => selectedVehicles.has(v.id));
    veiculos.forEach(veiculo => {
      onVehicleSelect(veiculo, !allSelected);
    });
  };

  const selectedCount = selectedVehicles.size;
  const totalCount = veiculos.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filtros */}
      {showFilters && onFiltersChange && onClearFilters && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Filtros
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              {filtersExpanded ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
          
          {filtersExpanded && (
            <VehicleFilters
              filters={filters}
              onFiltersChange={onFiltersChange}
              onClearFilters={onClearFilters}
              compact={compact}
            />
          )}
        </div>
      )}

      {/* Header da Lista */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>
                Veículos ({totalCount})
              </CardTitle>
              
              {selectable && totalCount > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedCount > 0 ? `${selectedCount} selecionados` : 'Selecionar todos'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onViewModeChange && (
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                    className="rounded-r-none border-r"
                  >
                    Grade
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    className="rounded-l-none"
                  >
                    Lista
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Estados de Loading e Error */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{loadingMessage}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium mb-2">Erro ao carregar veículos</p>
                <p className="text-gray-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Lista Vazia */}
          {!loading && !error && veiculos.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-2">{emptyMessage}</p>
                <p className="text-gray-500 text-sm">Tente ajustar os filtros ou adicionar novos veículos.</p>
              </div>
            </div>
          )}

          {/* Lista de Veículos */}
          {!loading && !error && veiculos.length > 0 && (
            <div className={cn(
              viewMode === 'grid' 
                ? cn(
                    'grid gap-4',
                    compact 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  )
                : 'space-y-4'
            )}>
              {veiculos.map((veiculo) => (
                <VehicleCard
                  key={veiculo.id}
                  veiculo={veiculo}
                  onView={onVehicleView}
                  onEdit={onVehicleEdit}
                  onDelete={onVehicleDelete}
                  onSelect={onVehicleSelect}
                  showActions={showActions}
                  compact={compact || viewMode === 'list'}
                  selectable={selectable}
                  selected={selectedVehicles.has(veiculo.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações em Lote */}
      {selectable && selectedCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-blue-900">
                  {selectedCount} veículo{selectedCount > 1 ? 's' : ''} selecionado{selectedCount > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedVehicles.forEach(id => {
                      const veiculo = veiculos.find(v => v.id === id);
                      if (veiculo && onVehicleSelect) {
                        onVehicleSelect(veiculo, false);
                      }
                    });
                  }}
                >
                  Desmarcar Todos
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Implementar ação em lote (ex: exportar, editar em massa, etc.)
                    console.log('Ação em lote para:', Array.from(selectedVehicles));
                  }}
                >
                  Ações em Lote
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { cn } from '../../../utils/cn';
import { EstadoVenda, EstadoVeiculo } from '../../../types/domain';
import { VeiculoFilters } from '../../../../entities/veiculo/hooks';

/**
 * Props do VehicleFilters
 */
export interface VehicleFiltersProps {
  filters: VeiculoFilters;
  onFiltersChange: (filters: Partial<VeiculoFilters>) => void;
  onClearFilters: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Componente VehicleFilters
 * Componente para filtros de veículos
 */
export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
  compact = false
}) => {
  const handleInputChange = (field: keyof VeiculoFilters, value: any) => {
    onFiltersChange({ [field]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <Card className={cn('w-full', className)} padding={compact ? 'sm' : 'md'}>
      <CardHeader className={compact ? 'pb-3' : undefined}>
        <div className="flex items-center justify-between">
          <CardTitle className={compact ? 'text-base' : 'text-lg'}>
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size={compact ? 'sm' : 'md'}
              onClick={onClearFilters}
            >
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : undefined}>
        <div className={cn(
          'grid gap-4',
          compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}>
          {/* Busca por texto */}
          <div className="space-y-2">
            <label className={cn(
              'block font-medium text-gray-700',
              compact ? 'text-xs' : 'text-sm'
            )}>
              Buscar
            </label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleInputChange('search', e.target.value)}
              placeholder="Marca, modelo, placa..."
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                compact ? 'text-sm py-1.5' : 'text-sm'
              )}
            />
          </div>

          {/* Estado de Venda */}
          <div className="space-y-2">
            <label className={cn(
              'block font-medium text-gray-700',
              compact ? 'text-xs' : 'text-sm'
            )}>
              Estado de Venda
            </label>
            <select
              value={filters.estadoVenda || ''}
              onChange={(e) => handleInputChange('estadoVenda', e.target.value as EstadoVenda || undefined)}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                compact ? 'text-sm py-1.5' : 'text-sm'
              )}
            >
              <option value="">Todos</option>
              <option value={EstadoVenda.DISPONIVEL}>Disponível</option>
              <option value={EstadoVenda.RESERVADO}>Reservado</option>
              <option value={EstadoVenda.VENDIDO}>Vendido</option>
              <option value={EstadoVenda.REPASSADO}>Repassado</option>
              <option value={EstadoVenda.RESTRITO}>Restrito</option>
            </select>
          </div>

          {/* Estado do Veículo */}
          <div className="space-y-2">
            <label className={cn(
              'block font-medium text-gray-700',
              compact ? 'text-xs' : 'text-sm'
            )}>
              Estado do Veículo
            </label>
            <select
              value={filters.estadoVeiculo || ''}
              onChange={(e) => handleInputChange('estadoVeiculo', e.target.value as EstadoVeiculo || undefined)}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                compact ? 'text-sm py-1.5' : 'text-sm'
              )}
            >
              <option value="">Todos</option>
              <option value={EstadoVeiculo.NOVO}>Novo</option>
              <option value={EstadoVeiculo.SEMINOVO}>Seminovo</option>
              <option value={EstadoVeiculo.USADO}>Usado</option>
              <option value={EstadoVeiculo.SUCATA}>Sucata</option>
              <option value={EstadoVeiculo.LIMPO}>Limpo</option>
              <option value={EstadoVeiculo.SUJO}>Sujo</option>
            </select>
          </div>

          {/* Marca */}
          <div className="space-y-2">
            <label className={cn(
              'block font-medium text-gray-700',
              compact ? 'text-xs' : 'text-sm'
            )}>
              Marca
            </label>
            <input
              type="text"
              value={filters.marca || ''}
              onChange={(e) => handleInputChange('marca', e.target.value)}
              placeholder="Ex: Toyota, Honda..."
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                compact ? 'text-sm py-1.5' : 'text-sm'
              )}
            />
          </div>

          {/* Modelo */}
          <div className="space-y-2">
            <label className={cn(
              'block font-medium text-gray-700',
              compact ? 'text-xs' : 'text-sm'
            )}>
              Modelo
            </label>
            <input
              type="text"
              value={filters.modelo || ''}
              onChange={(e) => handleInputChange('modelo', e.target.value)}
              placeholder="Ex: Corolla, Civic..."
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                compact ? 'text-sm py-1.5' : 'text-sm'
              )}
            />
          </div>

          {/* Ano */}
          <div className="space-y-2">
            <label className={cn(
              'block font-medium text-gray-700',
              compact ? 'text-xs' : 'text-sm'
            )}>
              Ano
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.anoMin || ''}
                onChange={(e) => handleInputChange('anoMin', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="De"
                min="1900"
                max="2030"
                className={cn(
                  'flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  compact ? 'text-sm py-1.5' : 'text-sm'
                )}
              />
              <input
                type="number"
                value={filters.anoMax || ''}
                onChange={(e) => handleInputChange('anoMax', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Até"
                min="1900"
                max="2030"
                className={cn(
                  'flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  compact ? 'text-sm py-1.5' : 'text-sm'
                )}
              />
            </div>
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <label className={cn(
              'block font-medium text-gray-700',
              compact ? 'text-xs' : 'text-sm'
            )}>
              Preço (R$)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.precoMin || ''}
                onChange={(e) => handleInputChange('precoMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="De"
                min="0"
                step="1000"
                className={cn(
                  'flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  compact ? 'text-sm py-1.5' : 'text-sm'
                )}
              />
              <input
                type="number"
                value={filters.precoMax || ''}
                onChange={(e) => handleInputChange('precoMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Até"
                min="0"
                step="1000"
                className={cn(
                  'flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  compact ? 'text-sm py-1.5' : 'text-sm'
                )}
              />
            </div>
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <label className={cn(
              'block font-medium text-gray-700',
              compact ? 'text-xs' : 'text-sm'
            )}>
              Cor
            </label>
            <input
              type="text"
              value={filters.cor || ''}
              onChange={(e) => handleInputChange('cor', e.target.value)}
              placeholder="Ex: Branco, Preto..."
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                compact ? 'text-sm py-1.5' : 'text-sm'
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
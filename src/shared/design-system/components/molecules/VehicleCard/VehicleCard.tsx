import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { cn } from '../../../utils/cn';
import { VeiculoModel } from '../../../../entities/veiculo/model';
import { EstadoVenda, EstadoVeiculo } from '../../../types/domain';

/**
 * Props do VehicleCard
 */
export interface VehicleCardProps {
  veiculo: VeiculoModel;
  onView?: (veiculo: VeiculoModel) => void;
  onEdit?: (veiculo: VeiculoModel) => void;
  onDelete?: (veiculo: VeiculoModel) => void;
  showActions?: boolean;
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (veiculo: VeiculoModel, selected: boolean) => void;
  className?: string;
}

/**
 * Componente VehicleCard
 * Card especializado para exibir informações de veículos
 */
export const VehicleCard: React.FC<VehicleCardProps> = ({
  veiculo,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
  selectable = false,
  selected = false,
  onSelect,
  className
}) => {
  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(veiculo, !selected);
    } else if (onView) {
      onView(veiculo);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(veiculo);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(veiculo);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(veiculo);
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        selectable && 'cursor-pointer',
        selected && 'ring-2 ring-blue-500 ring-offset-2',
        !selectable && onView && 'hover:shadow-md cursor-pointer',
        className
      )}
      onClick={handleCardClick}
      padding={compact ? 'sm' : 'md'}
    >
      {selectable && (
        <div className="absolute top-3 right-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.(veiculo, e.target.checked);
            }}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      )}

      <CardHeader className={compact ? 'pb-2' : undefined}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold text-gray-900 truncate',
              compact ? 'text-sm' : 'text-lg'
            )}>
              {veiculo.getNomeCompleto()}
            </h3>
            <p className={cn(
              'text-gray-600 font-mono',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {veiculo.placa}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <EstadoVendaBadge estado={veiculo.estadoVenda} compact={compact} />
            {!compact && (
              <EstadoVeiculoBadge estado={veiculo.estadoVeiculo} />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={compact ? 'py-2' : undefined}>
        <div className="space-y-2">
          {veiculo.precoVenda && (
            <div className="flex items-center justify-between">
              <span className={cn(
                'text-gray-600',
                compact ? 'text-xs' : 'text-sm'
              )}>
                Preço:
              </span>
              <span className={cn(
                'font-bold text-green-600',
                compact ? 'text-sm' : 'text-lg'
              )}>
                {veiculo.getPrecoFormatado()}
              </span>
            </div>
          )}
          
          {!compact && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cor:</span>
                <span className="text-gray-900">{veiculo.cor}</span>
              </div>
              
              {veiculo.anoModelo && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ano:</span>
                  <span className="text-gray-900">{veiculo.anoModelo}</span>
                </div>
              )}
              
              {veiculo.hodometro && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">KM:</span>
                  <span className="text-gray-900">{veiculo.getHodometroFormatado()}</span>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className={cn(
          'gap-2',
          compact ? 'pt-2' : 'pt-4'
        )}>
          {onView && (
            <Button
              variant="outline"
              size={compact ? 'sm' : 'md'}
              onClick={handleViewClick}
              className="flex-1"
            >
              Ver
            </Button>
          )}
          {onEdit && (
            <Button
              variant="secondary"
              size={compact ? 'sm' : 'md'}
              onClick={handleEditClick}
              className="flex-1"
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size={compact ? 'sm' : 'md'}
              onClick={handleDeleteClick}
            >
              Excluir
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * Badge para estado de venda
 */
interface EstadoVendaBadgeProps {
  estado: EstadoVenda;
  compact?: boolean;
}

const EstadoVendaBadge: React.FC<EstadoVendaBadgeProps> = ({ estado, compact = false }) => {
  const getEstadoStyles = (estado: EstadoVenda) => {
    switch (estado) {
      case EstadoVenda.DISPONIVEL:
        return 'bg-green-100 text-green-800 border-green-200';
      case EstadoVenda.RESERVADO:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case EstadoVenda.VENDIDO:
        return 'bg-red-100 text-red-800 border-red-200';
      case EstadoVenda.REPASSADO:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case EstadoVenda.RESTRITO:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoText = (estado: EstadoVenda) => {
    switch (estado) {
      case EstadoVenda.DISPONIVEL:
        return 'Disponível';
      case EstadoVenda.RESERVADO:
        return 'Reservado';
      case EstadoVenda.VENDIDO:
        return 'Vendido';
      case EstadoVenda.REPASSADO:
        return 'Repassado';
      case EstadoVenda.RESTRITO:
        return 'Restrito';
      default:
        return estado;
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full border font-medium',
      compact ? 'text-xs' : 'text-xs',
      getEstadoStyles(estado)
    )}>
      {getEstadoText(estado)}
    </span>
  );
};

/**
 * Badge para estado do veículo
 */
interface EstadoVeiculoBadgeProps {
  estado: EstadoVeiculo;
}

const EstadoVeiculoBadge: React.FC<EstadoVeiculoBadgeProps> = ({ estado }) => {
  const getEstadoStyles = (estado: EstadoVeiculo) => {
    switch (estado) {
      case EstadoVeiculo.NOVO:
        return 'bg-green-50 text-green-700';
      case EstadoVeiculo.SEMINOVO:
        return 'bg-blue-50 text-blue-700';
      case EstadoVeiculo.USADO:
        return 'bg-yellow-50 text-yellow-700';
      case EstadoVeiculo.SUCATA:
        return 'bg-red-50 text-red-700';
      case EstadoVeiculo.LIMPO:
        return 'bg-green-50 text-green-700';
      case EstadoVeiculo.SUJO:
        return 'bg-orange-50 text-orange-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getEstadoText = (estado: EstadoVeiculo) => {
    switch (estado) {
      case EstadoVeiculo.NOVO:
        return 'Novo';
      case EstadoVeiculo.SEMINOVO:
        return 'Seminovo';
      case EstadoVeiculo.USADO:
        return 'Usado';
      case EstadoVeiculo.SUCATA:
        return 'Sucata';
      case EstadoVeiculo.LIMPO:
        return 'Limpo';
      case EstadoVeiculo.SUJO:
        return 'Sujo';
      default:
        return estado;
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      getEstadoStyles(estado)
    )}>
      {getEstadoText(estado)}
    </span>
  );
};
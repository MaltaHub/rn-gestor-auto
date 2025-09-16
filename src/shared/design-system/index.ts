/**
 * Design System - Barrel Export
 * Sistema de design completo com tokens e componentes
 */

// Design Tokens
export * from './tokens';

// Components
export * from './components';

// Utilities
export { cn } from '../utils/cn';

// Re-exports organizados por categoria
export {
  // Tokens
  colors,
  typography,
  spacing,
  type ColorTokens,
  type TypographyTokens,
  type SpacingTokens
} from './tokens';

export {
  // Core Components
  Button,
  Card,
  
  // Vehicle Components
  VehicleCard,
  VehicleFilters,
  VehicleList,
  
  // Types
  type ButtonProps,
  type CardProps,
  type VehicleCardProps,
  type VehicleFiltersProps,
  type VehicleListProps
} from './components';
/**
 * Design System Components - Barrel Export
 * Exportações organizadas por nível de atomic design
 */

// Atoms
export * from './atoms';

// Molecules
export * from './molecules';

// Organisms
export * from './organisms';

// Re-exports organizados por categoria
export {
  // Buttons
  Button,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  DestructiveButton,
  GhostButton,
  LinkButton,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
  
  // Cards
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ElevatedCard,
  OutlinedCard,
  GhostCard,
  ClickableCard,
  HoverableCard,
  type CardProps,
  type CardVariant,
  type CardPadding
} from './atoms';

export {
  // Vehicle Components
  VehicleCard,
  VehicleFilters,
  type VehicleCardProps,
  type VehicleFiltersProps
} from './molecules';

export {
  // Complex Components
  VehicleList,
  type VehicleListProps
} from './organisms';
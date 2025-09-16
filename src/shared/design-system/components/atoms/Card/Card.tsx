import React from 'react';
import { cn } from '../../../utils/cn';

/**
 * Variantes do card
 */
export type CardVariant = 'default' | 'outlined' | 'elevated' | 'ghost';

/**
 * Tamanhos de padding do card
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Props do componente Card
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  clickable?: boolean;
  asChild?: boolean;
}

/**
 * Props do CardHeader
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * Props do CardContent
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * Props do CardFooter
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * Estilos base do card
 */
const cardBaseStyles = [
  'rounded-lg',
  'transition-all',
  'duration-200'
].join(' ');

/**
 * Estilos por variante
 */
const cardVariantStyles: Record<CardVariant, string> = {
  default: [
    'bg-white',
    'border',
    'border-gray-200'
  ].join(' '),
  
  outlined: [
    'bg-white',
    'border-2',
    'border-gray-300'
  ].join(' '),
  
  elevated: [
    'bg-white',
    'shadow-md',
    'border',
    'border-gray-100'
  ].join(' '),
  
  ghost: [
    'bg-transparent'
  ].join(' ')
};

/**
 * Estilos de padding
 */
const cardPaddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

/**
 * Componente Card principal
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    padding = 'md',
    hoverable = false,
    clickable = false,
    className,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardBaseStyles,
          cardVariantStyles[variant],
          cardPaddingStyles[padding],
          hoverable && [
            'hover:shadow-lg',
            'hover:-translate-y-0.5'
          ].join(' '),
          clickable && [
            'cursor-pointer',
            'hover:shadow-lg',
            'hover:-translate-y-0.5',
            'active:translate-y-0',
            'active:shadow-md'
          ].join(' '),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Componente CardHeader
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          'flex-col',
          'space-y-1.5',
          'pb-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Componente CardTitle
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

export const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-lg',
          'font-semibold',
          'leading-none',
          'tracking-tight',
          'text-gray-900',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

/**
 * Componente CardDescription
 */
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'text-sm',
          'text-gray-600',
          'leading-relaxed',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

/**
 * Componente CardContent
 */
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-1', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * Componente CardFooter
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          'items-center',
          'pt-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

/**
 * Variantes específicas do card para contextos comuns
 */
export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="elevated" {...props} />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="outlined" {...props} />
);

export const GhostCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="ghost" {...props} />
);

export const ClickableCard: React.FC<Omit<CardProps, 'clickable'>> = (props) => (
  <Card clickable {...props} />
);

export const HoverableCard: React.FC<Omit<CardProps, 'hoverable'>> = (props) => (
  <Card hoverable {...props} />
);
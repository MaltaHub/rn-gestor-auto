import React from 'react';
import { cn } from '../../../utils/cn';
import { colors, textStyles, spacing, borderRadius } from '../../tokens';

/**
 * Variantes do botão
 */
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'destructive'
  | 'success'
  | 'warning';

/**
 * Tamanhos do botão
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props do componente Button
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

/**
 * Estilos base do botão
 */
const buttonBaseStyles = [
  'inline-flex',
  'items-center',
  'justify-center',
  'gap-2',
  'font-medium',
  'transition-all',
  'duration-200',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-offset-2',
  'disabled:opacity-50',
  'disabled:cursor-not-allowed',
  'disabled:pointer-events-none'
].join(' ');

/**
 * Estilos por variante
 */
const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-blue-600',
    'text-white',
    'hover:bg-blue-700',
    'active:bg-blue-800',
    'focus:ring-blue-500'
  ].join(' '),
  
  secondary: [
    'bg-gray-100',
    'text-gray-900',
    'hover:bg-gray-200',
    'active:bg-gray-300',
    'focus:ring-gray-500'
  ].join(' '),
  
  outline: [
    'border',
    'border-gray-300',
    'bg-transparent',
    'text-gray-700',
    'hover:bg-gray-50',
    'active:bg-gray-100',
    'focus:ring-gray-500'
  ].join(' '),
  
  ghost: [
    'bg-transparent',
    'text-gray-700',
    'hover:bg-gray-100',
    'active:bg-gray-200',
    'focus:ring-gray-500'
  ].join(' '),
  
  destructive: [
    'bg-red-600',
    'text-white',
    'hover:bg-red-700',
    'active:bg-red-800',
    'focus:ring-red-500'
  ].join(' '),
  
  success: [
    'bg-green-600',
    'text-white',
    'hover:bg-green-700',
    'active:bg-green-800',
    'focus:ring-green-500'
  ].join(' '),
  
  warning: [
    'bg-yellow-600',
    'text-white',
    'hover:bg-yellow-700',
    'active:bg-yellow-800',
    'focus:ring-yellow-500'
  ].join(' ')
};

/**
 * Estilos por tamanho
 */
const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md h-8',
  md: 'px-4 py-2 text-sm rounded-md h-10',
  lg: 'px-6 py-3 text-base rounded-lg h-12'
};

/**
 * Componente Button
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className,
    children,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          buttonBaseStyles,
          buttonVariantStyles[variant],
          buttonSizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size={size} />
            {children && <span className="opacity-70">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Componente de loading spinner interno
 */
interface LoadingSpinnerProps {
  size: ButtonSize;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <svg
      className={cn(
        'animate-spin',
        sizeClasses[size]
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Variantes específicas do botão para contextos comuns
 */
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

export const DestructiveButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="destructive" {...props} />
);

export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="success" {...props} />
);

export const WarningButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="warning" {...props} />
);
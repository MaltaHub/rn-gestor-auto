/**
 * Design Tokens - Barrel Export
 * Centraliza todos os tokens de design da aplicação
 */

export * from './colors';
export * from './typography';
export * from './spacing';

// Re-export organizado por categoria
export {
  colors,
  primary,
  secondary,
  success,
  warning,
  error,
  info,
  neutral,
  automotive
} from './colors';

export {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textStyles,
  responsiveTextStyles
} from './typography';

export {
  spacing,
  semanticSpacing,
  sizes,
  borderRadius,
  borderWidth,
  zIndex,
  breakpoints
} from './spacing';
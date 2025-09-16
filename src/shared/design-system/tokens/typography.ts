/**
 * Design Tokens - Tipografia
 * Sistema tipográfico consistente para toda a aplicação
 */

// Font families
export const fontFamily = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'sans-serif'
  ],
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace'
  ],
  display: [
    'Cal Sans',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'sans-serif'
  ]
} as const;

// Font weights
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900'
} as const;

// Font sizes (em rem)
export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem',  // 72px
  '8xl': '6rem',    // 96px
  '9xl': '8rem'     // 128px
} as const;

// Line heights
export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2'
} as const;

// Letter spacing
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em'
} as const;

// Text styles predefinidos
export const textStyles = {
  // Headings
  h1: {
    fontFamily: fontFamily.display.join(', '),
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight
  },
  h2: {
    fontFamily: fontFamily.display.join(', '),
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight
  },
  h3: {
    fontFamily: fontFamily.display.join(', '),
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal
  },
  h4: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal
  },
  h5: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal
  },
  h6: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal
  },
  
  // Body text
  body: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal
  },
  bodyLarge: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal
  },
  bodySmall: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal
  },
  
  // Labels and captions
  label: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide
  },
  caption: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide
  },
  
  // Code
  code: {
    fontFamily: fontFamily.mono.join(', '),
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal
  },
  codeBlock: {
    fontFamily: fontFamily.mono.join(', '),
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal
  },
  
  // UI elements
  button: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.wide
  },
  buttonLarge: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.wide
  },
  input: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal
  },
  
  // Especiais para contexto automotivo
  vehicleTitle: {
    fontFamily: fontFamily.display.join(', '),
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.normal
  },
  vehiclePrice: {
    fontFamily: fontFamily.display.join(', '),
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.tight
  },
  vehicleSpec: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal
  },
  licensePlate: {
    fontFamily: fontFamily.mono.join(', '),
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.wider
  }
} as const;

// Responsive typography utilities
export const responsiveTextStyles = {
  h1: {
    base: textStyles.h2,
    md: textStyles.h1
  },
  h2: {
    base: textStyles.h3,
    md: textStyles.h2
  },
  h3: {
    base: textStyles.h4,
    md: textStyles.h3
  },
  vehicleTitle: {
    base: textStyles.body,
    md: textStyles.vehicleTitle
  },
  vehiclePrice: {
    base: textStyles.xl,
    md: textStyles.vehiclePrice
  }
} as const;

// Tipos TypeScript
export type FontFamily = keyof typeof fontFamily;
export type FontWeight = keyof typeof fontWeight;
export type FontSize = keyof typeof fontSize;
export type LineHeight = keyof typeof lineHeight;
export type LetterSpacing = keyof typeof letterSpacing;
export type TextStyle = keyof typeof textStyles;
export type ResponsiveTextStyle = keyof typeof responsiveTextStyles;
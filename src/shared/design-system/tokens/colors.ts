/**
 * Design Tokens - Cores
 * Sistema de cores consistente para toda a aplicação
 */

// Cores primárias
export const primary = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6', // Cor principal
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554'
} as const;

// Cores secundárias
export const secondary = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617'
} as const;

// Cores de estado
export const success = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e', // Verde principal
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
  950: '#052e16'
} as const;

export const warning = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b', // Amarelo principal
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03'
} as const;

export const error = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444', // Vermelho principal
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a'
} as const;

export const info = {
  50: '#ecfeff',
  100: '#cffafe',
  200: '#a5f3fc',
  300: '#67e8f9',
  400: '#22d3ee',
  500: '#06b6d4', // Ciano principal
  600: '#0891b2',
  700: '#0e7490',
  800: '#155e75',
  900: '#164e63',
  950: '#083344'
} as const;

// Cores neutras
export const neutral = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a'
} as const;

// Cores especiais para o contexto automotivo
export const automotive = {
  // Cores para estados de veículos
  novo: success[500],
  seminovo: info[500],
  usado: warning[500],
  sucata: error[500],
  
  // Cores para estados de venda
  disponivel: success[500],
  reservado: warning[500],
  vendido: error[500],
  repassado: secondary[500],
  restrito: neutral[500],
  
  // Cores para limpeza
  limpo: success[500],
  sujo: warning[500]
} as const;

// Mapeamento semântico das cores
export const colors = {
  primary,
  secondary,
  success,
  warning,
  error,
  info,
  neutral,
  automotive,
  
  // Aliases semânticos
  brand: primary,
  destructive: error,
  muted: secondary,
  accent: info,
  
  // Cores de fundo
  background: {
    primary: '#ffffff',
    secondary: neutral[50],
    muted: neutral[100],
    accent: primary[50]
  },
  
  // Cores de texto
  text: {
    primary: neutral[900],
    secondary: neutral[600],
    muted: neutral[500],
    inverse: '#ffffff',
    accent: primary[600]
  },
  
  // Cores de borda
  border: {
    primary: neutral[200],
    secondary: neutral[300],
    accent: primary[200],
    focus: primary[500]
  }
} as const;

// Tipos TypeScript para as cores
export type ColorScale = typeof primary;
export type ColorToken = keyof typeof colors;
export type PrimaryColor = keyof typeof primary;
export type SemanticColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type AutomotiveColor = keyof typeof automotive;
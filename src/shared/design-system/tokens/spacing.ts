/**
 * Design Tokens - Espaçamento e Dimensões
 * Sistema de espaçamento consistente para toda a aplicação
 */

// Escala de espaçamento base (em rem)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem'       // 384px
} as const;

// Espaçamentos semânticos
export const semanticSpacing = {
  // Espaçamentos internos (padding)
  padding: {
    xs: spacing[1],      // 4px
    sm: spacing[2],      // 8px
    md: spacing[4],      // 16px
    lg: spacing[6],      // 24px
    xl: spacing[8],      // 32px
    '2xl': spacing[12],  // 48px
    '3xl': spacing[16]   // 64px
  },
  
  // Espaçamentos externos (margin)
  margin: {
    xs: spacing[1],      // 4px
    sm: spacing[2],      // 8px
    md: spacing[4],      // 16px
    lg: spacing[6],      // 24px
    xl: spacing[8],      // 32px
    '2xl': spacing[12],  // 48px
    '3xl': spacing[16]   // 64px
  },
  
  // Gaps para layouts
  gap: {
    xs: spacing[1],      // 4px
    sm: spacing[2],      // 8px
    md: spacing[4],      // 16px
    lg: spacing[6],      // 24px
    xl: spacing[8],      // 32px
    '2xl': spacing[12]   // 48px
  },
  
  // Espaçamentos para componentes específicos
  component: {
    // Cards
    cardPadding: spacing[6],        // 24px
    cardGap: spacing[4],            // 16px
    
    // Buttons
    buttonPaddingX: spacing[4],     // 16px
    buttonPaddingY: spacing[2],     // 8px
    buttonGap: spacing[2],          // 8px
    
    // Forms
    inputPaddingX: spacing[3],      // 12px
    inputPaddingY: spacing[2],      // 8px
    formGap: spacing[4],            // 16px
    labelGap: spacing[1],           // 4px
    
    // Navigation
    navPadding: spacing[4],         // 16px
    navItemGap: spacing[2],         // 8px
    
    // Lists
    listItemPadding: spacing[3],    // 12px
    listGap: spacing[2],            // 8px
    
    // Modals
    modalPadding: spacing[6],       // 24px
    modalGap: spacing[4],           // 16px
    
    // Tables
    tableCellPadding: spacing[3],   // 12px
    tableRowGap: spacing[1],        // 4px
    
    // Grids
    gridGap: spacing[4],            // 16px
    gridItemPadding: spacing[4]     // 16px
  }
} as const;

// Dimensões fixas
export const sizes = {
  // Tamanhos de ícones
  icon: {
    xs: spacing[3],      // 12px
    sm: spacing[4],      // 16px
    md: spacing[5],      // 20px
    lg: spacing[6],      // 24px
    xl: spacing[8],      // 32px
    '2xl': spacing[12]   // 48px
  },
  
  // Tamanhos de avatars
  avatar: {
    xs: spacing[6],      // 24px
    sm: spacing[8],      // 32px
    md: spacing[10],     // 40px
    lg: spacing[12],     // 48px
    xl: spacing[16],     // 64px
    '2xl': spacing[20]   // 80px
  },
  
  // Alturas de componentes
  height: {
    input: spacing[10],     // 40px
    button: spacing[10],    // 40px
    buttonSm: spacing[8],   // 32px
    buttonLg: spacing[12],  // 48px
    navbar: spacing[16],    // 64px
    sidebar: '100vh',
    modal: 'auto',
    card: 'auto'
  },
  
  // Larguras de componentes
  width: {
    sidebar: spacing[64],      // 256px
    sidebarCollapsed: spacing[16], // 64px
    modal: {
      sm: spacing[96],         // 384px
      md: '32rem',             // 512px
      lg: '48rem',             // 768px
      xl: '64rem',             // 1024px
      full: '100%'
    },
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
  }
} as const;

// Raios de borda
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px'
} as const;

// Larguras de borda
export const borderWidth = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px'
} as const;

// Z-index layers
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const;

// Breakpoints responsivos
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Tipos TypeScript
export type Spacing = keyof typeof spacing;
export type SemanticSpacing = keyof typeof semanticSpacing;
export type IconSize = keyof typeof sizes.icon;
export type AvatarSize = keyof typeof sizes.avatar;
export type BorderRadius = keyof typeof borderRadius;
export type BorderWidth = keyof typeof borderWidth;
export type ZIndex = keyof typeof zIndex;
export type Breakpoint = keyof typeof breakpoints;
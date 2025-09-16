/**
 * Re-export dos tipos do Supabase para manter compatibilidade
 * Este arquivo serve como ponte entre os tipos gerados e nossa arquitetura
 */
export type { Database } from '../../integrations/supabase/types';

// Tipos auxiliares para trabalhar com o Supabase
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T];

// Aliases para facilitar o uso
export type VeiculoRow = Tables<'veiculos'>;
export type VeiculoInsert = TablesInsert<'veiculos'>;
export type VeiculoUpdate = TablesUpdate<'veiculos'>;

export type EmpresaRow = Tables<'empresas'>;
export type EmpresaInsert = TablesInsert<'empresas'>;
export type EmpresaUpdate = TablesUpdate<'empresas'>;

export type LojaRow = Tables<'lojas'>;
export type LojaInsert = TablesInsert<'lojas'>;
export type LojaUpdate = TablesUpdate<'lojas'>;

export type AnuncioRow = Tables<'anuncios'>;
export type AnuncioInsert = TablesInsert<'anuncios'>;
export type AnuncioUpdate = TablesUpdate<'anuncios'>;

export type VeiculoLojaRow = Tables<'veiculos_loja'>;
export type VeiculoLojaInsert = TablesInsert<'veiculos_loja'>;
export type VeiculoLojaUpdate = TablesUpdate<'veiculos_loja'>;